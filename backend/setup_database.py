"""
Database setup script.

Run this ONCE to initialise the database:
    cd backend
    python setup_database.py

What it does:
  1. Creates the MySQL database if it doesn't exist
  2. Runs Django migrations (creates auth tables: roles, users, sessions, etc.)
     The migration also seeds the 4 default roles automatically.
  3. Creates the non-managed tables (vendors, rfqs, quotations, etc.)
"""

import os
import subprocess
import sys

import MySQLdb

DB_NAME = os.getenv("MYSQL_DATABASE", "supplysphere")
DB_HOST = os.getenv("MYSQL_HOST", "localhost")
DB_USER = os.getenv("MYSQL_USER", "root")
DB_PASS = os.getenv("MYSQL_PASSWORD", "1234")
DB_PORT = int(os.getenv("MYSQL_PORT", "3306"))

# ── Step 1: create the database ──────────────────────────────────────────────
print("Step 1: Creating database...")
conn = MySQLdb.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, passwd=DB_PASS)
cursor = conn.cursor()
cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
conn.commit()
cursor.close()
conn.close()
print(f"  Database '{DB_NAME}' ready.")

# ── Step 2: run Django migrations (creates managed tables + seeds roles) ──────
print("Step 2: Running Django migrations...")
result = subprocess.run(
    [sys.executable, "manage.py", "migrate", "--noinput"],
    check=True,
)
print("  Migrations complete.")

# ── Step 3: create non-managed tables (vendors, rfqs, quotations, etc.) ──────
print("Step 3: Creating vendor/procurement tables...")
conn = MySQLdb.connect(
    host=DB_HOST, port=DB_PORT, user=DB_USER, passwd=DB_PASS,
    db=DB_NAME, charset="utf8mb4",
)
cursor = conn.cursor()

sql_path = os.path.join(os.path.dirname(__file__), "database", "vendor_tables.sql")
with open(sql_path, "r", encoding="utf-8") as f:
    sql = f.read()

for statement in sql.split(";"):
    stmt = statement.strip()
    if not stmt or stmt.startswith("--"):
        continue
    try:
        cursor.execute(stmt)
    except MySQLdb.OperationalError as exc:
        if exc.args[0] == 1050:  # Table already exists — safe to skip
            pass
        else:
            raise

conn.commit()
cursor.close()
conn.close()
print("  Vendor tables ready.")

print("\nDatabase setup complete! You can now start the backend server.")
