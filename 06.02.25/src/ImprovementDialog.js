import React from 'react';

function ImprovementDialog({ close, upgradeClick, upgradeAutoMining, upgradeEnvironment }) {
  return (
    <div className="improvement-dialog">
      <div className="dialog-content">
        <button className="close-button" onClick={close}>Закрыть</button>

        <h2>Улучшения</h2>

        <div className="improvement-item">
          <button onClick={upgradeClick}>Улучшить Клик (10 монет)</button>
        </div>
        <div className="improvement-item">
          <button onClick={upgradeAutoMining}>Улучшить Автодобычу (20 монет)</button>
        </div>
        <div className="improvement-item">
          <button onClick={upgradeEnvironment}>Улучшить Окружение (100 монет)</button>
        </div>
      </div>
    </div>
  );
}

export default ImprovementDialog;
