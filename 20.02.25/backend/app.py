import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Создаем базу данных и таблицу Users при старте приложения
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            FIO TEXT,
            phone TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Запускаем инициализацию базы данных
init_db()

# Маршрут для получения данных из таблицы Users
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT * FROM Users')
    users = c.fetchall()
    conn.close()

    # Преобразуем данные в список словарей
    users_list = [
        {"id": user[0], "username": user[1], "password": user[2], "FIO": user[3], "phone": user[4]}
        for user in users
    ]
    return jsonify(users_list)

# Маршрут для добавления нового пользователя
@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    FIO = data.get('FIO')
    phone = data.get('phone')

    # Вставляем данные в таблицу Users
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO Users (username, password, FIO, phone)
        VALUES (?, ?, ?, ?)
    ''', (username, password, FIO, phone))
    conn.commit()
    conn.close()

    return jsonify({"message": "User added successfully!"}), 201

if __name__ == '__main__':
    app.run(debug=True)
