import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

const symbols = ['♥', '♦', '♣', '♠', '★', '☆', '■', '□'];

function App() {
  // Генерация карточек: случайным образом перемешиваем символы и создаем пары
  const generateCards = () => {
    const shuffled = [...symbols, ...symbols]  // Дублируем символы для создания пар
      .sort(() => Math.random() - 0.5)  // Перемешиваем их случайным образом
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }));
    return shuffled;
  };

  const [cards, setCards] = useState(generateCards);  // Инициализация карточек
  const [flippedCards, setFlippedCards] = useState([]);  // Карточки, которые перевернуты
  const [moves, setMoves] = useState(0);  // Счетчик ходов
  const [isGameOver, setIsGameOver] = useState(false);  // Статус игры

  // Функция переворачивания карточки
  const flipCard = (id) => {
    if (flippedCards.length === 2 || isGameOver) return;  // Не можем переворачивать больше двух карточек
    const newCards = [...cards];
    const card = newCards.find(card => card.id === id);
    if (!card.isFlipped) {
      card.isFlipped = true;
      setFlippedCards(prev => [...prev, card]);
      setCards(newCards);
    }
  };

  // Проверка на совпадение
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCard, secondCard] = flippedCards;
      if (firstCard.symbol === secondCard.symbol) {
        // Если совпало, оставляем их открытыми
        const newCards = cards.map(card =>
          card.symbol === firstCard.symbol ? { ...card, isMatched: true } : card
        );
        setCards(newCards);
        setFlippedCards([]);
        // Проверяем, закончилась ли игра
        if (newCards.every(card => card.isMatched)) {
          setIsGameOver(true);
        }
      } else {
        // Если не совпало, скрываем карточки через 1 секунду
        setTimeout(() => {
          const newCards = cards.map(card =>
            card.id === firstCard.id || card.id === secondCard.id
              ? { ...card, isFlipped: false }
              : card
          );
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  // Перезапуск игры
  const restartGame = () => {
    setCards(generateCards());
    setFlippedCards([]);
    setMoves(0);
    setIsGameOver(false);
  };

  return (
    <div className="game-container">
      <h1>Игра на память</h1>
      <div className="game-info">
        <p>Ходы: {moves}</p>
        {isGameOver && <p>Поздравляем, вы выиграли!</p>}
      </div>
      <div className="cards-container">
        {cards.map(card => (
          <div
            key={card.id}
            className={`card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
            onClick={() => flipCard(card.id)}
          >
            {card.isFlipped || card.isMatched ? card.symbol : '?'}
          </div>
        ))}
      </div>
      <button onClick={restartGame}>Перезапустить игру</button>
    </div>
  );
}

export default App;
