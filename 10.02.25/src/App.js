import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Settings from "./Settings";

// Функция для загрузки данных с API
const fetchProducts = async () => {
  const response = await fetch("https://dummyjson.com/products?limit=10000");
  const data = await response.json();
  return data.products;
};

function App() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [settings, setSettings] = useState({
    columns: {
      id: { visible: true, width: 100, backgroundColor: "#fff" },
      name: { visible: true, width: 200, backgroundColor: "#fff" },
      price: { visible: true, width: 150, backgroundColor: "#fff" },
      category: { visible: true, width: 150, backgroundColor: "#fff" },
    },
  });
  const [isSettingsPage, setIsSettingsPage] = useState(false); // Состояние для переключения между страницами

  // Загружаем данные с API при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      const productsData = await fetchProducts();
      setProducts(productsData);
    };
    loadData();

    // Загружаем настройки из localStorage
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Вычисляем индекс начала и конца текущей страницы
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;

  // Используем useMemo для оптимизации пагинации и фильтрации
  const currentProducts = useMemo(() => {
    return products.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [products, currentPage]);

  // Обработчик для смены страницы
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Обработчик клика на иконку настроек
  const handleSettingsClick = () => {
    setIsSettingsPage(true); // Переход на страницу настроек
  };

  // Обработчик возврата на главную страницу
  const handleBackToHome = () => {
    setIsSettingsPage(false); // Возвращаемся на главную страницу
  };

  return (
    <Router>
      <div>
        {!isSettingsPage ? (
          <div>
            <h1>Товары</h1>
            <button onClick={handleSettingsClick} style={{ fontSize: "20px", margin: "10px" }}>
              ⚙️ Настройки
            </button>

            <table border="1" cellPadding="10">
              <thead>
                <tr>
                  {settings.columns.id.visible && <th style={{ width: settings.columns.id.width, backgroundColor: settings.columns.id.backgroundColor }}>ID</th>}
                  {settings.columns.name.visible && <th style={{ width: settings.columns.name.width, backgroundColor: settings.columns.name.backgroundColor }}>Название</th>}
                  {settings.columns.price.visible && <th style={{ width: settings.columns.price.width, backgroundColor: settings.columns.price.backgroundColor }}>Цена</th>}
                  {settings.columns.category.visible && <th style={{ width: settings.columns.category.width, backgroundColor: settings.columns.category.backgroundColor }}>Категория</th>}
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr key={product.id}>
                    {settings.columns.id.visible && <td>{product.id}</td>}
                    {settings.columns.name.visible && <td>{product.name}</td>}
                    {settings.columns.price.visible && <td>{product.price}</td>}
                    {settings.columns.category.visible && <td>{product.category}</td>}
                  </tr>
                ))}
              </tbody>
            </table>

            <div>
              {Array.from({ length: Math.ceil(products.length / itemsPerPage) }, (_, index) => (
                <button key={index + 1} onClick={() => paginate(index + 1)}>
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Settings settings={settings} setSettings={setSettings} handleBack={handleBackToHome} />
        )}
      </div>

      <Routes>
        <Route path="/settings" element={<Settings settings={settings} setSettings={setSettings} handleBack={handleBackToHome} />} />
      </Routes>
    </Router>
  );
}

export default App;
