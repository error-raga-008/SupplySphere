import subprocess
import MySQLdb

DB_NAME = "supplysphere"

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
    stdin=open("database/supplysphere_schema.sql", "r", encoding="utf-8"),
    check=True
)

print("Database ready!")