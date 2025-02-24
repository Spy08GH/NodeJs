# backend/app.py

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt  # Импортируем flask_bcrypt
import sqlite3

app = Flask(__name__)
CORS(app)  # Разрешаем CORS

# Инициализация bcrypt
bcrypt = Bcrypt(app)

# Функция для создания базы данных и таблицы Users, если их нет
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            FIO TEXT NOT NULL,
            phone TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Инициализация базы данных при запуске приложения
init_db()

# Функция для хэширования пароля
def hash_password(password):
    return bcrypt.generate_password_hash(password).decode('utf-8')

# Функция для проверки пароля
def check_password(hashed_password, password):
    return bcrypt.check_password_hash(hashed_password, password)

@app.route('/api/data', methods=['GET'])
def get_data():
    data = [
        {"id": 1, "name": "Item 1"},
        {"id": 2, "name": "Item 2"},
        {"id": 3, "name": "Item 3"}
    ]
    return jsonify(data)

# Маршрут для добавления нового пользователя
@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')
    fio = data.get('FIO')
    phone = data.get('phone')

    if not username or not password or not fio or not phone:
        return jsonify({"error": "Missing required fields"}), 400

    # Хэшируем пароль перед сохранением
    hashed_password = hash_password(password)

    # Сохраняем нового пользователя в базе данных
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO Users (username, password, FIO, phone)
        VALUES (?, ?, ?, ?)
    ''', (username, hashed_password, fio, phone))
    conn.commit()
    conn.close()

    return jsonify({"message": "User added successfully"}), 201

@app.route('/api/users', methods=['GET'])
def get_users():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT * FROM Users')
    users = c.fetchall()
    conn.close()

    users_list = []
    for user in users:
        users_list.append({
            "id": user[0],
            "username": user[1],
            "password": user[2],  # Пароль не будем отображать, но он есть в базе
            "FIO": user[3],
            "phone": user[4]
        })

    return jsonify(users_list)

# Маршрут для проверки пользователя (логин)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing required fields"}), 400

    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT * FROM Users WHERE username = ?', (username,))
    user = c.fetchone()
    conn.close()

    if user and check_password(user[2], password):  # Проверяем пароль
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 400

if __name__ == '__main__':
    app.run(debug=True)
