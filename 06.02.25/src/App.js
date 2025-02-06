import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [coins, setCoins] = useState(0); // Количество монет
  const [autoMine, setAutoMine] = useState(0); // Автодобыча монет в секунду
  const [clickUpgradeCost, setClickUpgradeCost] = useState(10); // Стоимость улучшения клика
  const [autoMineUpgradeCost, setAutoMineUpgradeCost] = useState(20); // Стоимость улучшения автодобычи
  const [environmentUpgradeCost, setEnvironmentUpgradeCost] = useState(100); // Стоимость улучшения окружения
  const [background, setBackground] = useState(''); // Состояние фона

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
    if (coins >= environmentUpgradeCost) {
      setCoins(coins - environmentUpgradeCost);
      setBackground('url(/background.png)'); // Изменение фона на background.png
      setEnvironmentUpgradeCost(environmentUpgradeCost * 1.5);
    }
  };

  // Автодобыча монет с определенной периодичностью
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(coins + autoMine);
    }, 1000);

    return () => clearInterval(interval);
  }, [coins, autoMine]);

  return (
    <div className="App" style={{ backgroundImage: background, backgroundSize: 'cover' }}>
      <div className="coin-display">
        <h2>Монеты: {coins}</h2>
        <p>Автодобыча: +{autoMine} монет/сек</p>
      </div>

      <button className="mine-button" onClick={mineCoins}>Добыть</button>

      <button className="upgrade-button" onClick={upgradeClick}>Улучшить клик (стоимость: {clickUpgradeCost} монет)</button>
      <button className="upgrade-button" onClick={upgradeAutoMine}>Улучшить автодобычу (стоимость: {autoMineUpgradeCost} монет)</button>
      <button className="upgrade-button" onClick={upgradeEnvironment}>Улучшить окружение (стоимость: {environmentUpgradeCost} монет)</button>
    </div>
  );
}

export default App;
