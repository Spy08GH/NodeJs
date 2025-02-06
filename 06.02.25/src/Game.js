import React from 'react';

function Game({ incrementCoins }) {
  return (
    <div className="game">
      <button className="mine-button" onClick={incrementCoins}>
        Добыть
      </button>
    </div>
  );
}

export default Game;
