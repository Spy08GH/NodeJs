import os
import sqlite3
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех маршрутов

# Инициализация bcrypt
bcrypt = Bcrypt(app)

# Инициализация SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Папка для хранения загруженных изображений
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Функция для проверки расширения изображения
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

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

# Маршрут для загрузки изображения
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify({'message': 'File uploaded successfully', 'filename': filename}), 200
    return jsonify({'error': 'Invalid file type'}), 400

# Обработка сообщений
@socketio.on('send_message')
def handle_send_message(data):
    username = data['username']
    message = data['message']
    image = data.get('image', None)  # Если есть изображение, передаем его

    # Отправляем сообщение всем подключенным клиентам
    emit('receive_message', {'username': username, 'message': message, 'image': image}, broadcast=True)

# Обработка запроса на изображение (для отображения)
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    socketio.run(app, debug=True)
