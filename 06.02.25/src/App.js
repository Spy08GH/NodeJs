import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [coins, setCoins] = useState(0); // Количество монет
  const [autoMine, setAutoMine] = useState(0); // Автодобыча монет в секунду
  const [clickUpgradeCost, setClickUpgradeCost] = useState(10); // Стоимость улучшения клика
  const [autoMineUpgradeCost, setAutoMineUpgradeCost] = useState(20); // Стоимость улучшения автодобычи
  const [environmentUpgradeCost, setEnvironmentUpgradeCost] = useState(100); // Стоимость улучшения окружения
  const [background, setBackground] = useState('white'); // Начальный фон - белый
  const [environmentLevel, setEnvironmentLevel] = useState(0); // Уровень улучшения окружения

  // Массив с фонами для каждого уровня
  const backgrounds = [
    '/background1.png', // 1 уровень
    '/background2.png', // 2 уровень
    '/background3.png', // 3 уровень
    '/background4.png', // 4 уровень
    '/background5.png', // 5 уровень
  ];

  // Функция для добычи монет при клике
  const mineCoins = () => {
    setCoins(coins + 1);
  };

  // Функция для улучшения клика
  const upgradeClick = () => {
    if (coins >= clickUpgradeCost) {
      setCoins(coins - clickUpgradeCost);
      setClickUpgradeCost(clickUpgradeCost * 1.5);
    }
  };

  // Функция для улучшения автодобычи
  const upgradeAutoMine = () => {
    if (coins >= autoMineUpgradeCost) {
      setCoins(coins - autoMineUpgradeCost);
      setAutoMine(autoMine + 2);
      setAutoMineUpgradeCost(autoMineUpgradeCost * 1.5);
    }
  };

  // Функция для улучшения окружения и изменения фона
  const upgradeEnvironment = () => {
    if (coins >= environmentUpgradeCost && environmentLevel < 5) {
      setCoins(coins - environmentUpgradeCost);
      setEnvironmentLevel(environmentLevel + 1);
      setBackground(backgrounds[environmentLevel]); // Меняем фон на основе уровня
      setEnvironmentUpgradeCost(environmentUpgradeCost * 1.5);
    }
  };

  // Автодобыча монет с определенной периодичностью
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(coins + autoMine);
    }, 1000);

    // Слушатель для клавиши ё (добавляет 50 монет)
    const handleKeyDown = (event) => {
      if (event.key === 'Ё' || event.key === 'ё') {
        setCoins(coins + 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, [coins, autoMine]);

  return (
    <div className="App" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="coin-display">
        <h2>Монеты: {coins}</h2>
        <p>Автодобыча: +{autoMine} монет/сек</p>
      </div>

      {/* Блок для кнопки "Добыть" */}
      <button className="mine-button" onClick={mineCoins}>Добыть</button>

      {/* Блок для кнопок улучшений (слева сверху) */}
      <div className="upgrade-buttons">
        <button className="upgrade-button" onClick={upgradeClick}>
          Улучшить клик (стоимость: {clickUpgradeCost} монет)
        </button>
        <button className="upgrade-button" onClick={upgradeAutoMine}>
          Улучшить автодобычу (стоимость: {autoMineUpgradeCost} монет)
        </button>

        {/* Отображаем кнопку только если уровень улучшения окружения меньше 5 */}
        {environmentLevel < 5 && (
          <button className="upgrade-button" onClick={upgradeEnvironment}>
            Улучшить окружение (стоимость: {environmentUpgradeCost} монет)
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
