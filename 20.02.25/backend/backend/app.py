from flask import Flask, jsonify
from flask_cors import CORS  # Добавим поддержку CORS

app = Flask(__name__)
CORS(app)  # Разрешаем все кросс-доменные запросы

@app.route('/api/data', methods=['GET'])
def get_data():
    data = [
        {"id": 1, "name": "Item 1"},
        {"id": 2, "name": "Item 2"},
        {"id": 3, "name": "Item 3"}
    ]
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
