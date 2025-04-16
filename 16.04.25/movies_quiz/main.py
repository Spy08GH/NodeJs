# main.py

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import json
import os
import random
import cv2
import asyncio
from PIL import Image, ImageTk
import threading
from functools import partial

class GuessMovieGame:
    def __init__(self, root):
        self.root = root
        self.root.title("Угадай фильм")
        self.root.geometry("800x600")
        self.root.resizable(True, True)
        
        self.score = 0
        self.current_video = None
        self.video_playing = False
        self.admin_mode = False
        
        # Создание директории media, если она не существует
        if not os.path.exists("media"):
            os.makedirs("media")
            
        # Создание JSON файла, если он не существует
        if not os.path.exists("quiz_data.json"):
            with open("quiz_data.json", "w") as f:
                json.dump([], f)
        
        self.create_main_menu()
    
    def create_main_menu(self):
        self.clear_window()
        
        # Создание основного фрейма
        main_frame = ttk.Frame(self.root)
        main_frame.pack(expand=True, fill="both", padx=20, pady=20)
        
        # Заголовок
        title_label = ttk.Label(main_frame, text="УГАДАЙ ФИЛЬМ", font=("Arial", 20, "bold"))
        title_label.pack(pady=20)
        
        # Описание игры
        desc_label = ttk.Label(main_frame, text="Угадай название фильма по короткому фрагменту видео.\nИгра длится до первой ошибки.", 
                              font=("Arial", 12))
        desc_label.pack(pady=10)
        
        # Кнопки
        style = ttk.Style()
        style.configure("TButton", font=("Arial", 12))
        
        play_button = ttk.Button(main_frame, text="Играть", command=self.start_game, style="TButton")
        play_button.pack(pady=10, ipadx=20, ipady=10)
        
        admin_button = ttk.Button(main_frame, text="Администрирование", command=self.admin_login, style="TButton")
        admin_button.pack(pady=10, ipadx=20, ipady=10)
        
        exit_button = ttk.Button(main_frame, text="Выход", command=self.root.quit, style="TButton")
        exit_button.pack(pady=10, ipadx=20, ipady=10)
    
    def admin_login(self):
        self.clear_window()
        
        login_frame = ttk.Frame(self.root)
        login_frame.pack(expand=True, fill="both", padx=20, pady=20)
        
        ttk.Label(login_frame, text="Вход в режим администратора", font=("Arial", 16, "bold")).pack(pady=20)
        
        ttk.Label(login_frame, text="Пароль:").pack(pady=5)
        password_entry = ttk.Entry(login_frame, show="*")
        password_entry.pack(pady=5)
        password_entry.focus_set()
        
        def check_password():
            # В реальном проекте пароль должен храниться безопасно
            if password_entry.get() == "admin123":
                self.admin_panel()
            else:
                messagebox.showerror("Ошибка", "Неверный пароль")
        
        ttk.Button(login_frame, text="Войти", command=check_password).pack(pady=10)
        ttk.Button(login_frame, text="Назад", command=self.create_main_menu).pack(pady=5)
        
        # Привязка Enter к функции проверки пароля
        password_entry.bind('<Return>', lambda event: check_password())
    
    def admin_panel(self):
        self.admin_mode = True
        self.clear_window()
        
        admin_frame = ttk.Frame(self.root)
        admin_frame.pack(expand=True, fill="both", padx=20, pady=20)
        
        ttk.Label(admin_frame, text="Панель администратора", font=("Arial", 16, "bold")).pack(pady=10)
        
        # Фрейм для добавления нового фильма
        add_frame = ttk.LabelFrame(admin_frame, text="Добавить новый фильм")
        add_frame.pack(fill="x", padx=10, pady=10)
        
        # Поле для выбора видео
        file_frame = ttk.Frame(add_frame)
        file_frame.pack(fill="x", padx=5, pady=5)
        
        self.file_path_var = tk.StringVar()
        ttk.Label(file_frame, text="Видео:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        ttk.Entry(file_frame, textvariable=self.file_path_var, width=50).grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(file_frame, text="Обзор...", command=self.browse_video).grid(row=0, column=2, padx=5, pady=5)
        
        # Поле для правильного ответа
        correct_frame = ttk.Frame(add_frame)
        correct_frame.pack(fill="x", padx=5, pady=5)
        
        self.correct_answer_var = tk.StringVar()
        ttk.Label(correct_frame, text="Правильный ответ:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        ttk.Entry(correct_frame, textvariable=self.correct_answer_var, width=50).grid(row=0, column=1, padx=5, pady=5, columnspan=2)
        
        # Поля для вариантов ответов
        options_frame = ttk.Frame(add_frame)
        options_frame.pack(fill="x", padx=5, pady=5)
        
        ttk.Label(options_frame, text="Введите 4 неверных варианта ответа:").grid(row=0, column=0, columnspan=3, padx=5, pady=5, sticky="w")
        
        self.option_vars = []
        for i in range(4):
            var = tk.StringVar()
            self.option_vars.append(var)
            ttk.Label(options_frame, text=f"Вариант {i+1}:").grid(row=i+1, column=0, padx=5, pady=5, sticky="w")
            ttk.Entry(options_frame, textvariable=var, width=50).grid(row=i+1, column=1, padx=5, pady=5, columnspan=2)
        
        # Кнопка добавления
        ttk.Button(add_frame, text="Добавить фильм", command=self.add_movie).pack(pady=10)
        
        # Фрейм для списка добавленных фильмов
        list_frame = ttk.LabelFrame(admin_frame, text="Добавленные фильмы")
        list_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Создание Treeview для отображения списка
        columns = ('filename', 'correct', 'options')
        self.movie_tree = ttk.Treeview(list_frame, columns=columns, show='headings')
        
        # Определение заголовков
        self.movie_tree.heading('filename', text='Видеофайл')
        self.movie_tree.heading('correct', text='Правильный ответ')
        self.movie_tree.heading('options', text='Варианты ответов')
        
        # Настройка ширины колонок
        self.movie_tree.column('filename', width=200)
        self.movie_tree.column('correct', width=150)
        self.movie_tree.column('options', width=350)
        
        # Добавление прокрутки
        scrollbar = ttk.Scrollbar(list_frame, orient="vertical", command=self.movie_tree.yview)
        self.movie_tree.configure(yscrollcommand=scrollbar.set)
        
        self.movie_tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Контекстное меню для удаления записей
        self.context_menu = tk.Menu(self.movie_tree, tearoff=0)
        self.context_menu.add_command(label="Удалить", command=self.delete_movie)
        
        self.movie_tree.bind("<Button-3>", self.show_context_menu)
        
        # Загрузка текущих данных
        self.load_movies_to_tree()
        
        # Кнопка возврата в главное меню
        ttk.Button(admin_frame, text="Вернуться в главное меню", command=self.create_main_menu).pack(pady=10)
    
    def browse_video(self):
        file_path = filedialog.askopenfilename(
            filetypes=[("Видеофайлы", "*.mp4 *.mov *.avi *.mkv")]
        )
        if file_path:
            self.file_path_var.set(file_path)
    
    def add_movie(self):
        # Получение данных из полей
        video_path = self.file_path_var.get()
        correct_answer = self.correct_answer_var.get()
        options = [var.get() for var in self.option_vars]
        
        # Проверка на заполнение всех полей
        if not video_path or not correct_answer or '' in options:
            messagebox.showerror("Ошибка", "Заполните все поля")
            return
        
        # Копирование файла в директорию media
        if not video_path.startswith("media/"):
            # Получение имени файла
            file_name = os.path.basename(video_path)
            destination = os.path.join("media", file_name)
            
            # Копирование файла
            try:
                import shutil
                shutil.copy2(video_path, destination)
                video_path = f"media/{file_name}"
            except Exception as e:
                messagebox.showerror("Ошибка", f"Не удалось скопировать файл: {e}")
                return
        
        # Создание новой записи
        new_entry = {
            "filename": video_path,
            "correct": correct_answer,
            "options": options + [correct_answer]  # Добавляем правильный ответ к вариантам
        }
        
        # Загрузка текущих данных
        try:
            with open("quiz_data.json", "r") as file:
                data = json.load(file)
        except json.JSONDecodeError:
            data = []
        
        # Добавление новой записи
        data.append(new_entry)
        
        # Сохранение данных
        with open("quiz_data.json", "w") as file:
            json.dump(data, file, indent=2)
        
        # Обновление списка
        self.load_movies_to_tree()
        
        # Очистка полей
        self.file_path_var.set("")
        self.correct_answer_var.set("")
        for var in self.option_vars:
            var.set("")
        
        messagebox.showinfo("Успех", "Фильм успешно добавлен")
    
    def load_movies_to_tree(self):
        # Очистка текущих данных
        for item in self.movie_tree.get_children():
            self.movie_tree.delete(item)
        
        # Загрузка данных из файла
        try:
            with open("quiz_data.json", "r") as file:
                data = json.load(file)
            
            # Добавление данных в дерево
            for idx, movie in enumerate(data):
                options_str = ", ".join(movie["options"])
                if len(options_str) > 50:
                    options_str = options_str[:50] + "..."
                
                self.movie_tree.insert("", "end", values=(
                    movie["filename"],
                    movie["correct"],
                    options_str
                ), tags=(str(idx),))
        
        except (json.JSONDecodeError, FileNotFoundError):
            messagebox.showwarning("Предупреждение", "Невозможно загрузить данные фильмов")
    
    def show_context_menu(self, event):
        item = self.movie_tree.identify_row(event.y)
        if item:
            self.movie_tree.selection_set(item)
            self.context_menu.post(event.x_root, event.y_root)
    
    def delete_movie(self):
        selected_item = self.movie_tree.selection()
        if not selected_item:
            return
        
        # Получение индекса выбранного элемента
        tags = self.movie_tree.item(selected_item, "tags")
        if not tags:
            return
        
        index = int(tags[0])
        
        # Загрузка данных
        try:
            with open("quiz_data.json", "r") as file:
                data = json.load(file)
            
            # Проверка на корректность индекса
            if 0 <= index < len(data):
                movie_name = data[index]["correct"]
                
                # Подтверждение удаления
                if messagebox.askyesno("Подтверждение", f"Вы действительно хотите удалить фильм '{movie_name}'?"):
                    # Удаление записи
                    del data[index]
                    
                    # Сохранение обновленных данных
                    with open("quiz_data.json", "w") as file:
                        json.dump(data, file, indent=2)
                    
                    # Обновление списка
                    self.load_movies_to_tree()
                    
                    messagebox.showinfo("Успех", "Фильм успешно удален")
        
        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось удалить фильм: {e}")
    
    def start_game(self):
        # Загрузка данных игры
        try:
            with open("quiz_data.json", "r") as file:
                self.quiz_data = json.load(file)
            
            if not self.quiz_data:
                messagebox.showinfo("Информация", "Нет доступных фильмов для игры. Добавьте фильмы через панель администратора.")
                self.create_main_menu()
                return
            
            # Сброс счета
            self.score = 0
            
            # Запуск игры
            self.play_round()
            
        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось загрузить данные игры: {e}")
            self.create_main_menu()
    
    def play_round(self):
        self.clear_window()
        
        # Создание игрового фрейма
        game_frame = ttk.Frame(self.root)
        game_frame.pack(expand=True, fill="both", padx=20, pady=20)
        
        # Отображение счета
        score_label = ttk.Label(game_frame, text=f"Счет: {self.score}", font=("Arial", 14))
        score_label.pack(pady=10)
        
        # Выбор случайного фильма
        self.current_round_data = random.choice(self.quiz_data)
        
        # Создание области для видео
        video_frame = ttk.Frame(game_frame)
        video_frame.pack(expand=True, fill="both", padx=10, pady=10)
        
        self.video_label = ttk.Label(video_frame)
        self.video_label.pack(expand=True, fill="both")
        
        # Создание области для вариантов ответов
        options_frame = ttk.Frame(game_frame)
        options_frame.pack(fill="x", padx=10, pady=10)
        
        # Перемешивание вариантов ответов
        options = self.current_round_data["options"].copy()
        random.shuffle(options)
        
        # Создание кнопок с вариантами
        for option in options:
            btn = ttk.Button(
                options_frame, 
                text=option, 
                command=partial(self.check_answer, option),
                style="TButton"
            )
            btn.pack(fill="x", pady=5)
        
        # Воспроизведение видео
        self.play_video(self.current_round_data["filename"])
    
    def play_video(self, video_path):
        def video_thread():
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                messagebox.showerror("Ошибка", f"Не удалось открыть видео: {video_path}")
                return
            
            self.video_playing = True
            
            while self.video_playing:
                ret, frame = cap.read()
                if not ret:
                    # Достигнут конец видео, перезапускаем
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                
                # Конвертация из BGR в RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Изменение размера для отображения
                h, w, _ = rgb_frame.shape
                max_width = 700
                max_height = 400
                
                if w > max_width or h > max_height:
                    ratio = min(max_width / w, max_height / h)
                    new_w = int(w * ratio)
                    new_h = int(h * ratio)
                    rgb_frame = cv2.resize(rgb_frame, (new_w, new_h))
                
                # Создание изображения для Tkinter
                img = Image.fromarray(rgb_frame)
                img_tk = ImageTk.PhotoImage(image=img)
                
                # Обновление label
                if hasattr(self, 'video_label'):
                    self.video_label.configure(image=img_tk)
                    self.video_label.image = img_tk
                
                # Задержка для плавного воспроизведения
                cv2.waitKey(25)
            
            cap.release()
        
        # Запуск видео в отдельном потоке
        threading.Thread(target=video_thread, daemon=True).start()
    
    def check_answer(self, selected_option):
        # Остановка воспроизведения видео
        self.video_playing = False
        
        correct_answer = self.current_round_data["correct"]
        
        if selected_option == correct_answer:
            # Правильный ответ
            self.score += 1
            messagebox.showinfo("Правильно!", f"Вы угадали! Это действительно '{correct_answer}'.")
            self.play_round()
        else:
            # Неправильный ответ - конец игры
            messagebox.showinfo("Неправильно!", f"К сожалению, это неверный ответ. Правильный ответ: '{correct_answer}'.\n\nВаш итоговый счет: {self.score}")
            self.game_over()
    
    def game_over(self):
        self.clear_window()
        
        end_frame = ttk.Frame(self.root)
        end_frame.pack(expand=True, fill="both", padx=20, pady=20)
        
        ttk.Label(end_frame, text="Игра окончена", font=("Arial", 20, "bold")).pack(pady=20)
        ttk.Label(end_frame, text=f"Ваш счет: {self.score}", font=("Arial", 16)).pack(pady=10)
        
        ttk.Button(end_frame, text="Играть снова", command=self.start_game).pack(pady=10)
        ttk.Button(end_frame, text="Главное меню", command=self.create_main_menu).pack(pady=10)
    
    def clear_window(self):
        # Остановка воспроизведения видео, если оно идет
        self.video_playing = False
        
        # Удаление всех виджетов
        for widget in self.root.winfo_children():
            widget.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = GuessMovieGame(root)
    root.mainloop()