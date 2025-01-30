import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import ReactSwitch from 'react-switch';

// Глобальные стили для светлой и темной темы
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${(props) => (props.darkMode ? '#121212' : '#f4f4f4')};
    color: ${(props) => (props.darkMode ? '#f4f4f4' : '#121212')};
    font-family: 'Arial', sans-serif;
    transition: all 0.3s ease;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${(props) => (props.darkMode ? '#fff' : '#333')};
  transition: all 0.3s ease;
`;

const AboutSection = styled.section`
  background-color: ${(props) => (props.darkMode ? '#333' : '#fff')};
  border-radius: 10px;
  padding: 30px;
  width: 80%;
  max-width: 800px;
  box-shadow: ${(props) => (props.darkMode ? '0 4px 8px rgba(255, 255, 255, 0.1)' : '0 4px 8px rgba(0, 0, 0, 0.1)')};
  transition: all 0.3s ease;
`;

const Button = styled.button`
  background-color: ${(props) => (props.darkMode ? '#fff' : '#333')};
  color: ${(props) => (props.darkMode ? '#121212' : '#fff')};
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.darkMode ? '#f4f4f4' : '#666')};
  }
`;

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <>
      <GlobalStyle darkMode={darkMode} />
      <Container>
        <Title darkMode={darkMode}>Мой личный блог</Title>
        <ReactSwitch
          checked={darkMode}
          onChange={toggleTheme}
          checkedIcon={false}
          uncheckedIcon={false}
          offColor="#bbb"
          onColor="#333"
        />
        <AboutSection darkMode={darkMode}>
          <h2>О вас</h2>
          <p>
            Привет! Я разработчик, увлекающийся программированием, дизайном и технологиями. На этом блоге я
            делюсь своими знаниями, множеством полезных материалов и интересных проектов. Постоянно учусь
            и совершенствую свои навыки. Вдохновляюсь на создание новых проектов и всегда открыт для
            общения!
          </p>
          <Button darkMode={darkMode}>Связаться со мной</Button>
        </AboutSection>
      </Container>
    </>
  );
};

export default App;
