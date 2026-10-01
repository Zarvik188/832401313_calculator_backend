import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

from calculator import CalculationError, evaluate_expression, result_for_json


DEFAULT_DATABASE = Path(__file__).with_name("calculator.db")


def get_connection(database_path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
    return connection


def init_database(database_path: Path) -> None:
    database_path.parent.mkdir(parents=True, exist_ok=True)
    with get_connection(database_path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS calculation_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                expression TEXT NOT NULL,
                result TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def create_app(database_path: str | Path | None = None) -> Flask:
    app = Flask(__name__)
    path = Path(database_path or os.getenv("DATABASE_PATH", DEFAULT_DATABASE))
    app.config["DATABASE_PATH"] = path
    init_database(path)
    CORS(app)

    @app.get("/api/health")
    def health():
        return jsonify({"success": True, "message": "calculator backend is running"})

    @app.post("/api/calculate")
    def calculate():
        body = request.get_json(silent=True) or {}
        expression = body.get("expression")
        if not isinstance(expression, str):
            return jsonify({"success": False, "message": "expression must be a string"}), 400

        try:
            value = evaluate_expression(expression)
        except CalculationError as error:
            return jsonify({"success": False, "message": str(error)}), 400

        result = result_for_json(value)
        created_at = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
        with get_connection(app.config["DATABASE_PATH"]) as connection:
            cursor = connection.execute(
                "INSERT INTO calculation_history(expression, result, created_at) VALUES (?, ?, ?)",
                (expression, str(result), created_at),
            )
            history_id = cursor.lastrowid

        return jsonify(
            {
                "success": True,
                "id": history_id,
                "expression": expression,
                "result": result,
                "created_at": created_at,
            }
        )

    @app.get("/api/history")
    def history():
        with get_connection(app.config["DATABASE_PATH"]) as connection:
            rows = connection.execute(
                "SELECT id, expression, result, created_at FROM calculation_history ORDER BY id DESC"
            ).fetchall()
        records = []
        for row in rows:
            records.append(
                {
                    "id": row["id"],
                    "expression": row["expression"],
                    "result": _stored_result(row["result"]),
                    "created_at": row["created_at"],
                }
            )
        return jsonify({"success": True, "history": records})

    @app.delete("/api/history/<int:history_id>")
    def delete_history(history_id: int):
        with get_connection(app.config["DATABASE_PATH"]) as connection:
            cursor = connection.execute("DELETE FROM calculation_history WHERE id = ?", (history_id,))
        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "History record not found"}), 404
        return jsonify({"success": True, "message": "History record deleted"})

    return app


def _stored_result(value: str) -> int | float:
    try:
        number = float(value)
        return int(number) if number.is_integer() else number
    except (TypeError, ValueError):
        return value


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

