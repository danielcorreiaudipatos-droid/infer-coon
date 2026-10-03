"""
Motor de Regressão — Inferência Estatística para Avaliação de Imóveis
Compatível com NBR 14.653-2 (Norma Brasileira de Avaliação)
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, Any, Tuple, Optional, List
from sklearn.linear_model import Ridge, LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_percentage_error
from scipy import stats
import joblib
from pathlib import Path

logger = logging.getLogger(__name__)

class MotorRegressao:
    """
    Motor de regressão para avaliação de imóveis.
    Implementa mecanismos de rigor científico (intervalo de confiança, grau de precisão NBR).
    """

    def __init__(self, modelo_tipo: str = 'ridge'):
        self.modelo_tipo = modelo_tipo
        self.modelo = None
        self.X_train = None
        self.y_train = None
        self.features_importantes = None
        self.metricas = {}
        self.modelo_path = Path("./models/modelo_avaliacao.pkl")
        self.modelo_path.parent.mkdir(parents=True, exist_ok=True)

    # ========== 1. TREINAMENTO ==========

    def treinar(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2) -> Dict[str, Any]:
        """
        Treina o modelo de regressão.

        Args:
            X: DataFrame com features
            y: Series com preços (pode ser log-transformado)
            test_size: proporção de dados para teste

        Returns:
            Dicionário com métricas de treinamento
        """
        logger.info(f"Treinando modelo {self.modelo_tipo} com {len(X)} amostras...")

        # Dividir dados
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )

        self.X_train = X_train
        self.y_train = y_train

        # Criar modelo baseado no tipo
        if self.modelo_tipo == 'ridge':
            self.modelo = Ridge(alpha=1.0)
        elif self.modelo_tipo == 'linear':
            self.modelo = LinearRegression()
        elif self.modelo_tipo == 'random_forest':
            self.modelo = RandomForestRegressor(n_estimators=100, random_state=42)
        elif self.modelo_tipo == 'gradient_boosting':
            self.modelo = GradientBoostingRegressor(n_estimators=100, random_state=42)
        else:
            self.modelo = Ridge(alpha=1.0)

        # Treinar
        self.modelo.fit(X_train, y_train)

        # Avaliação
        y_pred_train = self.modelo.predict(X_train)
        y_pred_test = self.modelo.predict(X_test)

        r2_train = r2_score(y_train, y_pred_train)
        r2_test = r2_score(y_test, y_pred_test)
        rmse_test = np.sqrt(mean_squared_error(y_test, y_pred_test))
        mape_test = mean_absolute_percentage_error(y_test, y_pred_test)

        self.metricas = {
            'r2_train': r2_train,
            'r2_test': r2_test,
            'rmse_test': rmse_test,
            'mape_test': mape_test,
            'n_features': X_train.shape[1],
            'n_amostras': len(X_train)
        }

        logger.info(f"R² Train: {r2_train:.4f} | R² Test: {r2_test:.4f} | RMSE: {rmse_test:.4f}")

        # Features importantes
        if hasattr(self.modelo, 'coef_'):
            self.features_importantes = pd.Series(
                np.abs(self.modelo.coef_),
                index=X_train.columns
            ).sort_values(ascending=False)
        elif hasattr(self.modelo, 'feature_importances_'):
            self.features_importantes = pd.Series(
                self.modelo.feature_importances_,
                index=X_train.columns
            ).sort_values(ascending=False)

        # Salvar modelo
        self.salvar_modelo()

        return self.metricas

    # ========== 2. VALIDAÇÃO E DIAGNÓSTICOS ==========

    def validacao_cruzada(self, X: pd.DataFrame, y: pd.Series, cv: int = 5) -> Dict[str, Any]:
        """
        Validação cruzada (k-fold).
        Valida se o modelo generaliza bem.
        """
        scores = cross_val_score(self.modelo, X, y, cv=cv, scoring='r2')

        diagnostico = {
            'cv_scores': scores.tolist(),
            'cv_mean': scores.mean(),
            'cv_std': scores.std(),
            'resultado': 'OK' if scores.mean() > 0.7 else 'Verificar'
        }

        logger.info(f"Validação cruzada (CV={cv}): {diagnostico['cv_mean']:.4f} ± {diagnostico['cv_std']:.4f}")

        return diagnostico

    def testar_multicolinearidade(self, X: pd.DataFrame) -> Dict[str, Any]:
        """
        Testa multicolinearidade (VIF - Variance Inflation Factor).
        VIF > 10 indica problema.
        """
        from sklearn.preprocessing import StandardScaler
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        vif_data = pd.DataFrame()
        vif_data['Feature'] = X.columns
        vif_data['VIF'] = [
            np.linalg.inv(np.corrcoef(X_scaled.T)).diagonal()[i]
            for i in range(X.shape[1])
        ]

        problematico = vif_data[vif_data['VIF'] > 10]

        return {
            'vif_data': vif_data.to_dict('records'),
            'problematico': len(problematico) == 0,
            'features_problema': problematico['Feature'].tolist()
        }

    def testar_normalidade_residuos(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """
        Teste de Shapiro-Wilk para normalidade dos resíduos.
        p-value > 0.05 = resíduos normais (bom)
        """
        y_pred = self.modelo.predict(X)
        residuos = y - y_pred

        statistic, p_value = stats.shapiro(residuos)

        return {
            'shapiro_statistic': float(statistic),
            'p_value': float(p_value),
            'normal': p_value > 0.05,
            'resultado': 'Resíduos normais ✓' if p_value > 0.05 else 'Resíduos não normais ⚠'
        }

    # ========== 3. AVALIAÇÃO (PREDICT) ==========

    def avaliar_imovel(self, caracteristicas: Dict[str, Any], log_transform: bool = False) -> Dict[str, Any]:
        """
        Avalia um imóvel usando o modelo treinado.
        Retorna valor central + intervalo de confiança (NBR 14.653).

        Args:
            caracteristicas: dict com features do imóvel (mesmo nome das features do treino)
            log_transform: se True, desfaz log-transform no resultado

        Returns:
            Dict com: valor_central, valor_min, valor_max, intervalo, grau_precisao, detalhe
        """

        if self.modelo is None:
            raise ValueError("Modelo não treinado. Execute treinar() primeiro.")

        # Preparar dados
        X_eval = pd.DataFrame([caracteristicas])

        # Prever valor
        valor_log = self.modelo.predict(X_eval)[0]

        # Desfazer log se necessário
        if log_transform:
            valor_central = np.exp(valor_log)
        else:
            valor_central = valor_log

        # ========== INTERVALO DE CONFIANÇA (NBR 14.653) ==========

        # Resíduos do treinamento
        y_pred_train = self.modelo.predict(self.X_train)
        residuos = self.y_train - y_pred_train
        desvio_padrao = np.std(residuos)

        # Nível de confiança 80% (padrão NBR)
        nivel_confianca = 0.80
        alpha = 1 - nivel_confianca
        t_critico = stats.t.ppf(1 - alpha/2, len(self.y_train) - 1)

        # Intervalo de confiança
        margem_erro = t_critico * desvio_padrao

        if log_transform:
            valor_min = np.exp(valor_log - margem_erro)
            valor_max = np.exp(valor_log + margem_erro)
        else:
            valor_min = valor_central - margem_erro
            valor_max = valor_central + margem_erro

        # ========== GRAU DE PRECISÃO (NBR 14.653) ==========

        # Amplitude = (Max - Min) / Valor Central
        amplitude = (valor_max - valor_min) / valor_central

        # Grau de Precisão conforme Tabela 5 da NBR
        if amplitude <= 0.20:
            grau_precisao = 'III'  # Melhor precisão
            descricao_grau = 'Alto (±10%)'
        elif amplitude <= 0.30:
            grau_precisao = 'II'
            descricao_grau = 'Médio (±15%)'
        else:
            grau_precisao = 'I'
            descricao_grau = 'Baixo (±20%+)'

        # ========== FUNDAMENTAÇÃO (NBR 14.653) ==========

        fundamentacao = {
            'n_amostras': len(self.X_train),
            'r2': self.metricas.get('r2_test', 0),
            'rmse': self.metricas.get('rmse_test', 0),
            'mape': self.metricas.get('mape_test', 0),
            'features_utilizadas': len(self.metricas.get('n_features', 0))
        }

        return {
            'valor_central': round(valor_central, 2),
            'valor_minimo': round(valor_min, 2),
            'valor_maximo': round(valor_max, 2),
            'amplitude': round(amplitude * 100, 1),  # em %
            'intervalo_confianca': nivel_confianca,
            'grau_precisao': grau_precisao,
            'descricao_grau': descricao_grau,
            'margem_erro': round(margem_erro, 2),
            'fundamentacao': fundamentacao,
            'features_importantes': self.features_importantes.head(5).to_dict() if self.features_importantes is not None else {},
            'timestamp': pd.Timestamp.now().isoformat()
        }

    # ========== 4. GERENCIAR MODELO ==========

    def salvar_modelo(self, path: Optional[Path] = None):
        """Salva modelo em arquivo."""
        path = path or self.modelo_path
        joblib.dump(self.modelo, path)
        logger.info(f"Modelo salvo em: {path}")

    def carregar_modelo(self, path: Optional[Path] = None):
        """Carrega modelo de arquivo."""
        path = path or self.modelo_path
        if path.exists():
            self.modelo = joblib.load(path)
            logger.info(f"Modelo carregado de: {path}")
            return True
        return False

    def obter_metricas(self) -> Dict[str, Any]:
        """Retorna métricas do modelo treinado."""
        return self.metricas

    def obter_features_importantes(self, top: int = 10) -> pd.Series:
        """Retorna features mais importantes do modelo."""
        if self.features_importantes is not None:
            return self.features_importantes.head(top)
        return pd.Series()

    def gerar_relatorio_tecnico(self, X_val: pd.DataFrame, y_val: pd.Series) -> Dict[str, Any]:
        """
        Gera relatório técnico completo do modelo (para laudo NBR).
        """
        relatorio = {
            'modelo': self.modelo_tipo,
            'metricas': self.metricas,
            'validacao_cruzada': self.validacao_cruzada(X_val, y_val),
            'multicolinearidade': self.testar_multicolinearidade(X_val),
            'normalidade_residuos': self.testar_normalidade_residuos(X_val, y_val),
            'features_importantes': self.obter_features_importantes(10).to_dict()
        }

        return relatorio


# Instância global
motor = MotorRegressao(modelo_tipo='ridge')
