import sqlite3
import glob

print("Verificando bancos de dados locais...")
for db in glob.glob('backend/*.db') + glob.glob('*.db'):
    try:
        conn = sqlite3.connect(db)
        cursor = conn.cursor()
        tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
        for t in tables:
            tname = t[0]
            try:
                cols = [c[1] for c in cursor.execute(f"PRAGMA table_info({tname});").fetchall()]
                for c in cols:
                    cnt = cursor.execute(f"SELECT COUNT(*) FROM {tname} WHERE CAST({c} AS TEXT) LIKE '%co.on%' OR CAST({c} AS TEXT) LIKE '%CO.ON%';").fetchone()[0]
                    if cnt > 0:
                        print(f"{db} -> {tname}.{c}: {cnt} ocorrências de co.on")
                        # Imprime as amostras
                        samples = cursor.execute(f"SELECT {c} FROM {tname} WHERE CAST({c} AS TEXT) LIKE '%co.on%' OR CAST({c} AS TEXT) LIKE '%CO.ON%' LIMIT 3;").fetchall()
                        for s in samples:
                            print(f"   Amostra: {s[0]}")
            except Exception as e:
                pass
    except Exception as e:
        print(f"Erro ao abrir {db}: {e}")
print("Fim da verificação.")
