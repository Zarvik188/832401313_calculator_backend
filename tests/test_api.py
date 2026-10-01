from app import create_app


def test_calculate_history_and_delete(tmp_path):
    app = create_app(tmp_path / "test.db")
    client = app.test_client()

    response = client.post("/api/calculate", json={"expression": "(2+3)*4"})
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["result"] == 20

    history = client.get("/api/history").get_json()["history"]
    assert len(history) == 1
    assert history[0]["expression"] == "(2+3)*4"

    deleted = client.delete(f"/api/history/{payload['id']}")
    assert deleted.status_code == 200
    assert client.get("/api/history").get_json()["history"] == []


def test_history_survives_backend_restart(tmp_path):
    database = tmp_path / "persistent.db"
    first_client = create_app(database).test_client()
    first_client.post("/api/calculate", json={"expression": "5*8"})

    second_client = create_app(database).test_client()
    records = second_client.get("/api/history").get_json()["history"]
    assert records[0]["expression"] == "5*8"
    assert records[0]["result"] == 40


def test_calculation_errors_are_returned_by_backend(tmp_path):
    app = create_app(tmp_path / "test.db")
    response = app.test_client().post("/api/calculate", json={"expression": "1/0"})
    assert response.status_code == 400
    assert response.get_json()["success"] is False

