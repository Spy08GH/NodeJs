import React, { useState, useEffect } from 'react';

const Timer = () => {
  // Состояния для часов, минут и секунд
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  
  // Состояние для отслеживания состояния секундомера (старт/стоп)
  const [isRunning, setIsRunning] = useState(false);
  
  // Таймер в setInterval
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 59) {
            setMinutes((min) => {
              if (min === 59) {
                setHours((hour) => hour + 1);
                return 0;
              }
              return min + 1;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    // Очистка интервала при размонтировании
    return () => clearInterval(interval);
  }, [isRunning]);

  // Функция для старта/стопа секундомера
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Функция для сброса времени
  const resetTimer = () => {
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  return (
    <div style={styles.container}>
      <div style={styles.timeDisplay}>
        <span style={styles.time}>{String(hours).padStart(2, '0')}:</span>
        <span style={styles.time}>{String(minutes).padStart(2, '0')}:</span>
        <span style={styles.time}>{String(seconds).padStart(2, '0')}</span>
      </div>

      <div style={styles.buttons}>
        <button onClick={toggleTimer} style={styles.button}>
          {isRunning ? 'Стоп' : 'Старт'}
        </button>
        {(hours > 0 || minutes > 0 || seconds > 0) && (
          <button onClick={resetTimer} style={styles.button}>
            Сброс
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f9',
    fontFamily: 'Arial, sans-serif',
  },
  timeDisplay: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#333',
  },
  time: {
    margin: '0 5px',
  },
  buttons: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '18px',
    cursor: 'pointer',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
  },
};

export default Timer;
