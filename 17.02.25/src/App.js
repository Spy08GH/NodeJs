import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";

// Главная страница
function Home() {
  return (
    <div>
      <h1>Главная страница</h1>
      <p>Добро пожаловать на главную страницу!</p>
    </div>
  );
}

// Страница "О нас"
function About() {
  return (
    <div>
      <h1>О нас</h1>
      <p>Мы - команда профессионалов, стремящихся к лучшему.</p>
    </div>
  );
}

// Страница "Контакты"
function Contacts() {
  return (
    <div>
      <h1>Контакты</h1>
      <p>Наши контакты: 69@sdasfdasddq.com</p>
    </div>
  );
}

// Страница "Калькулятор финансов"
function FinancialCalculator() {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxAmount, setTaxAmount] = useState(null);

  const calculateTax = () => {
    const result = (income - expense) * (taxRate / 100);
    setTaxAmount(result);
  };

  return (
    <div>
      <h1>Калькулятор финансов</h1>
      <div>
        <label>Доход: </label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Расход: </label>
        <input
          type="number"
          value={expense}
          onChange={(e) => setExpense(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Процент налога: </label>
        <input
          type="number"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
        />
      </div>
      <button onClick={calculateTax}>Рассчитать</button>
      {taxAmount !== null && <h3>Налог: {taxAmount}</h3>}
    </div>
  );
}

// Защищенная страница
function ProtectedPage({ setTaxRate }) {
  const [newTaxRate, setNewTaxRate] = useState(0);
  const [calculatedTax, setCalculatedTax] = useState(null);

  const calculateTax = () => {
    setCalculatedTax(newTaxRate);
  };

  return (
    <div>
      <h1>Защищенная страница</h1>
      <div>
        <label>Установить новый процент налога: </label>
        <input
          type="number"
          value={newTaxRate}
          onChange={(e) => setNewTaxRate(Number(e.target.value))}
        />
      </div>
      <button onClick={calculateTax}>Рассчитать новый налог</button>
      {calculatedTax !== null && <h3>Новый налог: {calculatedTax}</h3>}
    </div>
  );
}

// Страница ввода пароля
function PasswordPage({ onLogin }) {
  const handleLogin = () => {
    const password = prompt("Введите пароль:");
    if (password === "1234") {
      onLogin();
    } else {
      alert("Неверный пароль");
    }
  };

  return (
    <div>
      <h1>Введите пароль</h1>
      <button onClick={handleLogin}>Войти</button>
    </div>
  );
}

// Основное приложение с маршрутизацией
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [taxRate, setTaxRate] = useState(10); // начальный процент налога

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Главная</Link>
            </li>
            <li>
              <Link to="/about">О нас</Link>
            </li>
            <li>
              <Link to="/contacts">Контакты</Link>
            </li>
            <li>
              <Link to="/calculator">Калькулятор финансов</Link>
            </li>
            <li>
              <Link to="/protected">Защищенная страница</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/calculator" element={<FinancialCalculator />} />
          <Route
            path="/protected"
            element={
              isAuthenticated ? (
                <ProtectedPage setTaxRate={setTaxRate} />
              ) : (
                <Navigate to="/password" />
              )
            }
          />
          <Route path="/password" element={<PasswordPage onLogin={() => setIsAuthenticated(true)} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
