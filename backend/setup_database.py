import subprocess
import sys
from pathlib import Path
import MySQLdb

DB_NAME = "supplysphere"
BASE_DIR = Path(__file__).resolve().parent

conn = MySQLdb.connect(
    host="localhost",
    user="root",
    passwd="1234"
)

cursor = conn.cursor()
cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")

conn.close()

subprocess.run(
    [
        "mysql",
        "-u",
        "root",
        "-p1234",
        DB_NAME,
    ],
    stdin=open(BASE_DIR / "database" / "supplysphere_schema.sql", "r", encoding="utf-8"),
    check=True
)

subprocess.run([sys.executable, "manage.py", "migrate", "--fake-initial"], cwd=BASE_DIR, check=True)

print("Database ready!")