"""
Processamento e limpeza de dados imobiliários
Feature engineering para modelo de regressão
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, Any, Tuple, Optional
from scipy import stats
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

logger = logging.getLogger(__name__)

class ProcessadorDadosImobiliarios:
    """Processa dados coletados para treinar modelo de regressão."""

    def __init__(self):
        self.df_processado = None
        self.scaler = StandardScaler()
        self.encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')

    # ========== 1. LIMPEZA DE DADOS ==========

    def remover_outliers_iqr(self, df: pd.DataFrame, coluna: str, fator: float = 1.5) -> pd.DataFrame:
        """
        Remove outliers usando IQR (Interquartile Range).
        Mantém valores entre Q1 - fator*IQR e Q3 + fator*IQR
        """
        Q1 = df[coluna].quantile(0.25)
        Q3 = df[coluna].quantile(0.75)
        IQR = Q3 - Q1

        limite_inferior = Q1 - fator * IQR
        limite_superior = Q3 + fator * IQR

        antes = len(df)
        df_limpo = df[(df[coluna] >= limite_inferior) & (df[coluna] <= limite_superior)].copy()
        depois = len(df_limpo)

        logger.info(f"Remover outliers ({coluna}): {antes} → {depois} registros")
        return df_limpo

    def remover_outliers_zscore(self, df: pd.DataFrame, coluna: str, threshold: float = 3.0) -> pd.DataFrame:
        """Remove outliers usando Z-score (valores > 3 desvios padrão)."""
        z_scores = np.abs(stats.zscore(df[coluna].dropna()))
        mask = z_scores < threshold

        antes = len(df)
        df_limpo = df[mask].copy()
        depois = len(df_limpo)

        logger.info(f"Remover outliers Z-score ({coluna}): {antes} → {depois} registros")
        return df_limpo

    def preencher_valores_faltantes(self, df: pd.DataFrame, estrategia: str = 'media') -> pd.DataFrame:
        """
        Preenche valores NaN.
        estrategia: 'media', 'mediana', 'moda', 'remover'
        """
        if estrategia == 'remover':
            df_preenchido = df.dropna()
        else:
            imputer = SimpleImputer(strategy=estrategia)
            colunas_numericas = df.select_dtypes(include=[np.number]).columns
            df_preenchido = df.copy()
            df_preenchido[colunas_numericas] = imputer.fit_transform(df[colunas_numericas])

        logger.info(f"Preenchimento de valores faltantes ({estrategia}): {len(df)} → {len(df_preenchido)}")
        return df_preenchido

    def remover_duplicatas(self, df: pd.DataFrame, subset: list = None) -> pd.DataFrame:
        """Remove registros duplicados."""
        antes = len(df)
        df_limpo = df.drop_duplicates(subset=subset)
        depois = len(df_limpo)

        logger.info(f"Remover duplicatas: {antes} → {depois} registros")
        return df_limpo

    # ========== 2. FEATURE ENGINEERING ==========

    def criar_features_localizacao(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Cria features baseadas em localização.
        Requer: latitude, longitude (ou geocoding prévio)
        """
        df_features = df.copy()

        # Exemplo: criar zona (Centro/Periférico)
        if 'latitude' in df.columns and 'longitude' in df.columns:
            # Centro de SP: lat ≈ -23.55, long ≈ -46.63
            centro_lat, centro_long = -23.55, -46.63

            df_features['distancia_centro'] = np.sqrt(
                (df['latitude'] - centro_lat)**2 +
                (df['longitude'] - centro_long)**2
            ) * 111  # converter para km (aproximado)

            df_features['zona'] = df['distancia_centro'].apply(
                lambda x: 'Centro' if x < 5 else 'Periférico'
            )

        logger.info("Features de localização criadas")
        return df_features

    def criar_features_imovel(self, df: pd.DataFrame) -> pd.DataFrame:
        """Cria features derivadas do imóvel."""
        df_features = df.copy()

        # Valor por m²
        if 'preco' in df.columns and 'area' in df.columns:
            df_features['preco_por_m2'] = df['preco'] / df['area']

        # Razão banheiros/quartos (qualidade)
        if 'banheiros' in df.columns and 'quartos' in df.columns:
            df_features['razao_banheiros_quartos'] = df['banheiros'] / (df['quartos'] + 1)

        # Idade da construção (se tiver ano)
        if 'ano_construcao' in df.columns:
            df_features['idade_anos'] = 2024 - df['ano_construcao']

        # Tem garagem?
        if 'garagens' in df.columns:
            df_features['tem_garagem'] = (df['garagens'] > 0).astype(int)

        logger.info("Features do imóvel criadas")
        return df_features

    # ========== 3. TRANSFORMAÇÕES ==========

    def aplicar_log_preco(self, df: pd.DataFrame, coluna_preco: str = 'preco') -> pd.DataFrame:
        """
        Aplica log-transform no preço.
        Regressão com log(y) melhora distribuição e reduz heterocedasticidade.
        """
        df_transformado = df.copy()

        # Remover valores zero/negativos
        df_transformado = df_transformado[df_transformado[coluna_preco] > 0]

        df_transformado[f'{coluna_preco}_log'] = np.log(df_transformado[coluna_preco])

        logger.info(f"Log-transform aplicada em {coluna_preco}")
        return df_transformado

    def normalizar_features(self, df: pd.DataFrame, colunas: list = None) -> Tuple[pd.DataFrame, StandardScaler]:
        """Normaliza features para média 0, desvio padrão 1."""
        df_normalizado = df.copy()

        if colunas is None:
            colunas = df.select_dtypes(include=[np.number]).columns

        df_normalizado[colunas] = self.scaler.fit_transform(df[colunas])

        logger.info(f"Normalização aplicada em {len(colunas)} features")
        return df_normalizado, self.scaler

    def one_hot_encode(self, df: pd.DataFrame, colunas_cat: list) -> pd.DataFrame:
        """One-hot encoding para variáveis categóricas."""
        df_encoded = df.copy()

        encoded = self.encoder.fit_transform(df[colunas_cat])
        feature_names = self.encoder.get_feature_names_out(colunas_cat)

        df_encoded[feature_names] = encoded
        df_encoded = df_encoded.drop(columns=colunas_cat)

        logger.info(f"One-hot encoding aplicado em {len(colunas_cat)} features")
        return df_encoded

    # ========== 4. PIPELINE COMPLETO ==========

    def processar_completo(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Pipeline completo de processamento:
        1. Limpeza (duplicatas, outliers, valores faltantes)
        2. Feature engineering
        3. Transformações (log, normalização)
        """
        logger.info("Iniciando pipeline de processamento...")

        # 1. LIMPEZA
        df_limpo = self.remover_duplicatas(df)
        df_limpo = self.preencher_valores_faltantes(df_limpo, estrategia='media')

        # Remover outliers de preço (valores muito altos/baixos)
        if 'preco' in df_limpo.columns:
            df_limpo = self.remover_outliers_iqr(df_limpo, 'preco', fator=1.5)

        # 2. FEATURE ENGINEERING
        df_features = self.criar_features_localizacao(df_limpo)
        df_features = self.criar_features_imovel(df_features)

        # 3. TRANSFORMAÇÕES
        if 'preco' in df_features.columns:
            df_features = self.aplicar_log_preco(df_features, 'preco')

        self.df_processado = df_features

        logger.info(f"Pipeline concluído. Shape final: {df_features.shape}")
        return df_features

    def obter_dados_processados(self) -> Optional[pd.DataFrame]:
        """Retorna dados processados."""
        return self.df_processado

    def resumo_processamento(self, df_original: pd.DataFrame, df_processado: pd.DataFrame) -> Dict[str, Any]:
        """Gera resumo das transformações."""
        return {
            'registros_originais': len(df_original),
            'registros_processados': len(df_processado),
            'removidos': len(df_original) - len(df_processado),
            'colunas_originais': len(df_original.columns),
            'colunas_processadas': len(df_processado.columns),
            'features_adicionadas': len(df_processado.columns) - len(df_original.columns),
            'valores_faltantes_antes': df_original.isna().sum().sum(),
            'valores_faltantes_depois': df_processado.isna().sum().sum()
        }


# Instância global
processador = ProcessadorDadosImobiliarios()
