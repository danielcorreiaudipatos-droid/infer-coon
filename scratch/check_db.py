import sqlite3
import os

for f in os.listdir('backend'):
    if f.endswith('.db'):
        path = os.path.join('backend', f)
        try:
            conn = sqlite3.connect(path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            for t in tables:
                tname = t[0]
                cursor.execute(f"PRAGMA table_info({tname});")
                cols = [c[1] for c in cursor.fetchall()]
                for col in cols:
                    try:
                        cursor.execute(f"SELECT COUNT(*) FROM {tname} WHERE CAST({col} AS TEXT) LIKE '%Co.on%' OR CAST({col} AS TEXT) LIKE '%co.on%';")
                        cnt = cursor.fetchone()[0]
                        if cnt > 0:
                            print(f"{path} -> {tname}.{col}: {cnt} rows with Co.on")
                    except Exception as e:
                        pass
            conn.close()
        except Exception as e:
            print(f"Error reading {path}: {e}")
