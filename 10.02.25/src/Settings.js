import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Settings({ settings, setSettings, handleBack }) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (column, key, value) => {
    setLocalSettings((prevSettings) => {
      const newColumns = { ...prevSettings.columns };
      newColumns[column] = { ...newColumns[column], [key]: value };
      return { ...prevSettings, columns: newColumns };
    });
  };

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(localSettings));
    setSettings(localSettings); // Сохраняем настройки в глобальное состояние
    handleBack(); // Возвращаемся на главную страницу
  };

  return (
    <div>
      <h1>Настройки столбцов</h1>
      {Object.keys(localSettings.columns).map((column) => (
        <div key={column}>
          <h3>{column.charAt(0).toUpperCase() + column.slice(1)}</h3>
          <label>
            Видимость:
            <input
              type="checkbox"
              checked={localSettings.columns[column].visible}
              onChange={(e) => handleChange(column, 'visible', e.target.checked)}
            />
          </label>
          <br />
          <label>
            Ширина (px):
            <input
              type="number"
              value={localSettings.columns[column].width}
              onChange={(e) => handleChange(column, 'width', e.target.value)}
            />
          </label>
          <br />
          <label>
            Фоновый цвет:
            <input
              type="color"
              value={localSettings.columns[column].backgroundColor}
              onChange={(e) => handleChange(column, 'backgroundColor', e.target.value)}
            />
          </label>
          <br />
          <hr />
        </div>
      ))}
      <button onClick={handleSave}>Сохранить изменения</button>
    </div>
  );
}

export default Settings;
