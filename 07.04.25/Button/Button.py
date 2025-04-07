import tkinter as tk
import asyncio
import time
import random
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import threading
from functools import partial

class ReactionGame:
    def __init__(self, master):
        self.master = master
        self.master.title("Игра на скорость реакции")
        self.master.geometry("600x500")
        self.master.resizable(False, False)
        
        # Переменные для игры
        self.round = 0
        self.total_rounds = 10
        self.current_clicks = 0
        self.required_clicks = 5
        self.click_times = []
        self.reaction_times = []
        self.avg_clicks_per_round = []
        self.round_active = False
        self.round_start_time = 0
        self.last_click_time = 0
        
        # Создание виджетов
        self.frame = tk.Frame(master)
        self.frame.pack(expand=True, fill="both", padx=20, pady=20)
        
        self.info_label = tk.Label(self.frame, text="Игра на скорость реакции", font=("Arial", 16))
        self.info_label.pack(pady=10)
        
        self.round_label = tk.Label(self.frame, text=f"Раунд: 0/{self.total_rounds}", font=("Arial", 12))
        self.round_label.pack(pady=5)
        
        self.clicks_label = tk.Label(self.frame, text=f"Нажатий: 0/{self.required_clicks}", font=("Arial", 12))
        self.clicks_label.pack(pady=5)
        
        self.instruction_label = tk.Label(self.frame, text="Нажмите 'Старт' чтобы начать игру", font=("Arial", 14))
        self.instruction_label.pack(pady=20)
        
        self.reaction_label = tk.Label(self.frame, text="", font=("Arial", 12))
        self.reaction_label.pack(pady=5)
        
        self.button_frame = tk.Frame(self.frame)
        self.button_frame.pack(pady=10)
        
        self.start_button = tk.Button(self.button_frame, text="Старт", font=("Arial", 12), command=self.start_game)
        self.start_button.pack(side=tk.LEFT, padx=10)
        
        self.click_button = tk.Button(self.button_frame, text="НАЖМИ", font=("Arial", 12, "bold"), 
                                      bg="red", fg="white", state=tk.DISABLED, command=self.handle_click)
        self.click_button.pack(side=tk.LEFT, padx=10)
        
        # Область для графика
        self.figure_frame = tk.Frame(self.frame)
        self.figure_frame.pack(expand=True, fill="both", pady=10)
        
        self.figure = plt.Figure(figsize=(5, 3), dpi=100)
        self.ax = self.figure.add_subplot(111)
        self.canvas = FigureCanvasTkAgg(self.figure, self.figure_frame)
        self.canvas.get_tk_widget().pack(expand=True, fill="both")
        
        # Инициализация графика
        self.update_graph()
        
    def start_game(self):
        self.round = 0
        self.reaction_times = []
        self.avg_clicks_per_round = []
        self.start_button.config(state=tk.DISABLED)
        self.info_label.config(text="Игра началась!")
        self.instruction_label.config(text="Ждите появления кнопки 'НАЖМИ'...")
        
        # Запуск асинхронного цикла игры в отдельном потоке
        threading.Thread(target=self.run_game_loop, daemon=True).start()
    
    def run_game_loop(self):
        for _ in range(self.total_rounds):
            if self.round >= self.total_rounds:
                break
                
            # Случайная задержка перед началом раунда
            delay = random.uniform(1, 5)
            time.sleep(delay)
            
            # Начать новый раунд
            self.round += 1
            self.required_clicks = self.round * 5
            self.current_clicks = 0
            
            # Обновление интерфейса через основной поток
            self.master.after(0, self.start_round)
            
            # Ждем завершения раунда
            start = time.time()
            while time.time() - start < 3 and self.round_active:
                time.sleep(0.01)
                
            # Завершение раунда
            self.master.after(0, self.end_round)
            
        # Игра завершена
        self.master.after(0, self.end_game)
    
    def start_round(self):
        self.round_active = True
        self.round_start_time = time.time()
        self.last_click_time = self.round_start_time
        self.click_times = []
        
        self.round_label.config(text=f"Раунд: {self.round}/{self.total_rounds}")
        self.clicks_label.config(text=f"Нажатий: {self.current_clicks}/{self.required_clicks}")
        self.instruction_label.config(text="НАЖМИ БЫСТРЕЕ!", fg="red")
        self.click_button.config(state=tk.NORMAL, bg="green")
    
    def end_round(self):
        self.round_active = False
        self.click_button.config(state=tk.DISABLED, bg="red")
        
        # Рассчитываем среднее время реакции в раунде
        if self.click_times:
            avg_reaction = sum(self.click_times) / len(self.click_times)
            self.reaction_times.append(avg_reaction)
            self.reaction_label.config(text=f"Среднее время реакции: {avg_reaction:.3f} сек")
        else:
            self.reaction_times.append(0)
            self.reaction_label.config(text="Нет нажатий в этом раунде")
        
        # Сохраняем среднее количество нажатий в секунду
        clicks_per_second = self.current_clicks / 3  # 3 секунды на раунд
        self.avg_clicks_per_round.append(clicks_per_second)
        
        self.instruction_label.config(text=f"Раунд {self.round} завершен. Ждите следующий...", fg="black")
        
        # Обновляем график
        self.update_graph()
    
    def handle_click(self):
        if not self.round_active:
            return
        
        current_time = time.time()
        reaction_time = current_time - self.last_click_time
        self.click_times.append(reaction_time)
        self.last_click_time = current_time
        
        self.current_clicks += 1
        self.clicks_label.config(text=f"Нажатий: {self.current_clicks}/{self.required_clicks}")
    
    def end_game(self):
        self.start_button.config(state=tk.NORMAL)
        
        # Рассчитываем и показываем итоговые результаты
        if self.reaction_times:
            avg_reaction_total = sum(self.reaction_times) / len(self.reaction_times)
        else:
            avg_reaction_total = 0
            
        avg_clicks_total = sum(self.avg_clicks_per_round) / len(self.avg_clicks_per_round) if self.avg_clicks_per_round else 0
        
        result_text = (f"Игра завершена!\n"
                      f"Среднее время реакции: {avg_reaction_total:.3f} сек\n"
                      f"Среднее кол-во нажатий в секунду: {avg_clicks_total:.2f}")
        
        self.info_label.config(text="Результаты игры")
        self.instruction_label.config(text=result_text, fg="blue")
        
        # Финальное обновление графика
        self.update_graph()
    
    def update_graph(self):
        self.ax.clear()
        
        rounds = list(range(1, len(self.avg_clicks_per_round) + 1))
        if rounds:
            self.ax.bar(rounds, self.avg_clicks_per_round, color='blue')
            self.ax.set_xlabel('Раунд')
            self.ax.set_ylabel('Нажатий в секунду')
            self.ax.set_title('Результаты по раундам')
            self.ax.set_xticks(rounds)
            
            if len(rounds) < self.total_rounds:
                self.ax.set_xlim(0.5, self.total_rounds + 0.5)
        
        self.canvas.draw()

def main():
    root = tk.Tk()
    app = ReactionGame(root)
    root.mainloop()

if __name__ == "__main__":
    main()