// Получаем канвас и контекст
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Состояние игры
let score = 0;
let fruits = [];

// Цвета и формы фруктов
const fruitColors = ['red', 'blue', 'orange', 'green', 'purple'];
const fruitShapes = ['circle', 'square', 'diamond'];

// Функция для создания случайных фруктов
function createFruit() {
  const shape = fruitShapes[Math.floor(Math.random() * fruitShapes.length)];
  const color = fruitColors[Math.floor(Math.random() * fruitColors.length)];
  
  // Начальная позиция (под рамкой)
  const x = Math.random() * (canvas.width - 40);
  const y = canvas.height;

  // Добавляем фрукт в массив
  fruits.push({
    x: x,
    y: y,
    shape: shape,
    color: color,
    size: 30 + Math.random() * 30, // случайный размер
    velocityY: -5, // начальная скорость вверх
    gravity: 0.1, // гравитация
    isBurst: false // проверка, был ли фрукт "ударен"
  });
}

// Функция для рисования фруктов
function drawFruit(fruit) {
  ctx.beginPath();
  ctx.fillStyle = fruit.color;

  switch (fruit.shape) {
    case 'circle':
      ctx.arc(fruit.x, fruit.y, fruit.size / 2, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(fruit.x - fruit.size / 2, fruit.y - fruit.size / 2, fruit.size, fruit.size);
      break;
    case 'diamond':
      ctx.moveTo(fruit.x, fruit.y - fruit.size / 2);
      ctx.lineTo(fruit.x + fruit.size / 2, fruit.y);
      ctx.lineTo(fruit.x, fruit.y + fruit.size / 2);
      ctx.lineTo(fruit.x - fruit.size / 2, fruit.y);
      break;
  }

  ctx.fill();
}

// Функция для обновления позиции фруктов
function updateFruits() {
  for (let i = 0; i < fruits.length; i++) {
    const fruit = fruits[i];

    // Если фрукт не был "ударен", он взлетает
    if (!fruit.isBurst) {
      fruit.y += fruit.velocityY;
      fruit.velocityY += fruit.gravity;

      if (fruit.y > canvas.height) {
        fruit.velocityY = 0;
        fruit.y = canvas.height;
      }
    }

    drawFruit(fruit);
  }
}

// Функция для проверки клика по фрукту
canvas.addEventListener('click', (e) => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  // Проверяем каждый фрукт
  for (let i = 0; i < fruits.length; i++) {
    const fruit = fruits[i];
    const distance = Math.sqrt(Math.pow(mouseX - fruit.x, 2) + Math.pow(mouseY - fruit.y, 2));

    if (distance < fruit.size / 2 && !fruit.isBurst) {
      // Ударили фрукт, увеличиваем счёт
      score++;
      fruit.isBurst = true; // Фрукт больше не будет двигаться
      fruits.splice(i, 1); // Убираем фрукт из массива
      break;
    }
  }
});

// Обновляем счёт на экране
function updateScore() {
  document.querySelector('.score').textContent = `Счёт: ${score}`;
}

// Главный игровой цикл
function gameLoop() {
  // Очищаем канвас
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Обновляем фрукты
  updateFruits();

  // Обновляем счёт
  updateScore();

  // Запускаем следующий кадр
  requestAnimationFrame(gameLoop);
}

// Добавляем фрукты с интервалом
setInterval(createFruit, 1500); // Каждые 1.5 секунды

// Запускаем игровой цикл
gameLoop();
