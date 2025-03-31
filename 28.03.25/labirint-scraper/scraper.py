from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import csv
import time
import os

def setup_driver():
    """Настройка и инициализация драйвера Chrome"""
    chrome_options = Options()
    # Добавление опций для безголового режима, если необходимо
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-notifications")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def scrape_labirint_bestsellers(min_rating=4.5, limit=10):
    """Сбор данных о книгах-бестселлерах с рейтингом выше указанного"""
    driver = setup_driver()
    
    try:
        # Открываем страницу бестселлеров
        url = "https://www.labirint.ru/bestsellers/"
        driver.get(url)
        print(f"Открыта страница: {url}")
        
        # Ждем загрузки элементов страницы
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "product"))
        )
        
        # Находим все книги на странице
        books = driver.find_elements(By.CLASS_NAME, "product")
        print(f"Найдено книг на странице: {len(books)}")
        
        # Создаем список для хранения данных о книгах
        books_data = []
        
        # Обходим каждую книгу и собираем информацию
        for i, book in enumerate(books):
            if i >= limit:
                break
                
            try:
                # Извлекаем данные о книге
                title_elem = book.find_element(By.CLASS_NAME, "product-title")
                title = title_elem.text.strip()
                
                # Получаем автора
                author = "Не указан"
                try:
                    author_elem = book.find_element(By.CLASS_NAME, "author")
                    author = author_elem.text.strip()
                except:
                    pass
                
                # Получаем цену
                price = "Нет данных"
                try:
                    price_elem = book.find_element(By.CLASS_NAME, "price-val")
                    price = price_elem.text.strip()
                except:
                    pass
                
                # Получаем рейтинг (если есть)
                rating = 0
                try:
                    rating_elem = book.find_element(By.CLASS_NAME, "rating")
                    rating_text = rating_elem.get_attribute("title")
                    if rating_text:
                        rating = float(rating_text.split()[1])
                except:
                    pass
                
                # Проверяем, соответствует ли рейтинг минимальному
                if rating >= min_rating or rating == 0:  # Включаем книги без рейтинга для демонстрации
                    books_data.append({
                        "Название": title,
                        "Автор": author,
                        "Цена": price,
                        "Рейтинг": rating
                    })
                    print(f"Добавлена книга: {title} | Рейтинг: {rating}")
            
            except Exception as e:
                print(f"Ошибка при обработке книги: {e}")
        
        return books_data
        
    finally:
        # Закрываем драйвер в любом случае
        driver.quit()

def save_to_csv(data, filename="books_data.csv"):
    """Сохранение данных в CSV-файл"""
    if not data:
        print("Нет данных для сохранения")
        return
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ["Название", "Автор", "Цена", "Рейтинг"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for book in data:
                writer.writerow(book)
        
        print(f"Данные успешно сохранены в файл: {filename}")
    except Exception as e:
        print(f"Ошибка при сохранении данных: {e}")

def main():
    """Основная функция программы"""
    print("Начинаем сбор данных о книгах...")
    
    # Получаем данные о книгах
    books_data = scrape_labirint_bestsellers(min_rating=4.5, limit=10)
    
    # Сохраняем данные в CSV-файл
    if books_data:
        save_to_csv(books_data)
    
    print("Работа программы завершена")

if __name__ == "__main__":
    main()