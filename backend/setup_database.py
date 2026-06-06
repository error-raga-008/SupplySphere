import os
import getpass
import subprocess
import sys
from pathlib import Path
import MySQLdb
from dotenv import load_dotenv

DB_NAME = "supplysphere"
BASE_DIR = Path(__file__).resolve().parent

DB_NAME = os.getenv("MYSQL_DATABASE", "supplysphere")
DB_HOST = os.getenv("MYSQL_HOST", "localhost")
DB_USER = os.getenv("MYSQL_USER", "root")
DB_PORT = int(os.getenv("MYSQL_PORT", "3306"))

# Read password from env; if not set, prompt securely
DB_PASS = os.getenv("MYSQL_PASSWORD")
if DB_PASS is None:
    DB_PASS = getpass.getpass(f"MySQL password for '{DB_USER}'@'{DB_HOST}': ")

# ── Step 1: create the database ──────────────────────────────────────────────
print("Step 1: Creating database...")
conn = MySQLdb.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, passwd=DB_PASS)
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

print("\nDatabase setup complete! You can now start the backend server.")
