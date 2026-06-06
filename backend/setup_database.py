import MySQLdb

DB_NAME = "supplysphere"

conn = MySQLdb.connect(
    host="localhost",
    user="root",
    passwd="1234"
)

cursor = conn.cursor()

cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")

cursor.execute(f"USE {DB_NAME}")

with open("database/supplysphere_schema.sql", "r", encoding="utf-8") as f:
    sql = f.read()

for statement in sql.split(";"):
    if statement.strip():
        cursor.execute(statement)

conn.commit()

print("Database ready!")