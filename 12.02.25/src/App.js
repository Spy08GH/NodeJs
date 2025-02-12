import React, { useState } from 'react';
import './App.css';

function App() {
  const initialElements = [
    { id: 1, name: 'Квадранит', type: 'square', color: 'blue', x: 50, y: 50 },
    { id: 2, name: 'Квадранит', type: 'square', color: 'blue', x: 150, y: 50 },
    { id: 3, name: 'Квадранит', type: 'square', color: 'blue', x: 250, y: 50 },
    { id: 4, name: 'Квадранит', type: 'square', color: 'blue', x: 350, y: 50 },
    { id: 5, name: 'Овалин', type: 'circle', color: 'green', x: 50, y: 150 },
    { id: 6, name: 'Овалин', type: 'circle', color: 'green', x: 150, y: 150 },
    { id: 7, name: 'Овалин', type: 'circle', color: 'green', x: 250, y: 150 },
    { id: 8, name: 'Трегонис', type: 'triangle', color: 'red', x: 50, y: 250 },
    { id: 9, name: 'Трегонис', type: 'triangle', color: 'red', x: 150, y: 250 },
    { id: 10, name: 'Трегонис', type: 'triangle', color: 'red', x: 250, y: 250 },
  ];

  const [elements, setElements] = useState(initialElements);
  const [helpVisible, setHelpVisible] = useState(false);
  const [draggingElement, setDraggingElement] = useState(null);

  const moveElement = (id, deltaX, deltaY) => {
    setElements(prevElements =>
      prevElements.map(elem =>
        elem.id === id
          ? { ...elem, x: elem.x + deltaX, y: elem.y + deltaY }
          : elem
      )
    );
  };

  const handleDragStart = (e, id) => {
    setDraggingElement(id);
    e.preventDefault();
  };

  const handleDragMove = (e) => {
    if (draggingElement) {
      const deltaX = e.movementX;
      const deltaY = e.movementY;
      moveElement(draggingElement, deltaX, deltaY);
    }
  };

  const handleDragEnd = () => {
    if (draggingElement) {
      const draggedElement = elements.find((elem) => elem.id === draggingElement);
      const otherElements = elements.filter((elem) => elem.id !== draggingElement);

      otherElements.forEach((otherElem) => {
        const distance = Math.sqrt(
          Math.pow(draggedElement.x - otherElem.x, 2) + Math.pow(draggedElement.y - otherElem.y, 2)
        );
        // Если два элемента близки друг к другу, они сливаются
        if (distance < 70) {
          combineElements(draggedElement, otherElem);
        }
      });
    }
    setDraggingElement(null);
  };

  const combineElements = (elem1, elem2) => {
    // Трегонис + Овалин = Зелерит
    if (
      (elem1.name === 'Трегонис' && elem2.name === 'Овалин') ||
      (elem1.name === 'Овалин' && elem2.name === 'Трегонис')
    ) {
      const newElement = {
        id: Date.now(),
        name: 'Зелерит',
        type: 'trapezoid',
        color: 'darkgreen',
        x: (elem1.x + elem2.x) / 2,
        y: (elem1.y + elem2.y) / 2,
      };
      setElements((prevElements) => [...prevElements, newElement]);
      setElements((prevElements) =>
        prevElements.filter(
          (elem) => elem.id !== elem1.id && elem.id !== elem2.id
        )
      );
    }

    // Квадранит + Трегонис = Убиони
    if (
      (elem1.name === 'Квадранит' && elem2.name === 'Трегонис') ||
      (elem1.name === 'Трегонис' && elem2.name === 'Квадранит')
    ) {
      const newElement = {
        id: Date.now(),
        name: 'Убиони',
        type: 'pentagon',
        color: 'darkred',
        x: (elem1.x + elem2.x) / 2,
        y: (elem1.y + elem2.y) / 2,
      };
      setElements((prevElements) => [...prevElements, newElement]);
      setElements((prevElements) =>
        prevElements.filter(
          (elem) => elem.id !== elem1.id && elem.id !== elem2.id
        )
      );
    }

    // Убиони + Овалин = Сапфир
    if (
      (elem1.name === 'Убиони' && elem2.name === 'Овалин') ||
      (elem1.name === 'Овалин' && elem2.name === 'Убиони')
    ) {
      const newElement = {
        id: Date.now(),
        name: 'Сапфир',
        type: 'diamond',
        color: 'lightblue',
        x: (elem1.x + elem2.x) / 2,
        y: (elem1.y + elem2.y) / 2,
      };
      setElements((prevElements) => [...prevElements, newElement]);
      setElements((prevElements) =>
        prevElements.filter(
          (elem) => elem.id !== elem1.id && elem.id !== elem2.id
        )
      );
    }

    // Сапфир + Зелерит = Кристаллит
    if (
      (elem1.name === 'Сапфир' && elem2.name === 'Зелерит') ||
      (elem1.name === 'Зелерит' && elem2.name === 'Сапфир')
    ) {
      const newElement = {
        id: Date.now(),
        name: 'Кристаллит',
        type: 'hexagon',
        color: 'purple',
        x: (elem1.x + elem2.x) / 2,
        y: (elem1.y + elem2.y) / 2,
      };
      setElements((prevElements) => [...prevElements, newElement]);
      setElements((prevElements) =>
        prevElements.filter(
          (elem) => elem.id !== elem1.id && elem.id !== elem2.id
        )
      );
    }

    // Кристаллит + Трегонис = Австралий
    if (
      (elem1.name === 'Кристаллит' && elem2.name === 'Трегонис') ||
      (elem1.name === 'Трегонис' && elem2.name === 'Кристаллит')
    ) {
      const newElement = {
        id: Date.now(),
        name: 'Австралий',
        type: 'star',
        color: 'yellow',
        x: (elem1.x + elem2.x) / 2,
        y: (elem1.y + elem2.y) / 2,
      };
      setElements((prevElements) => [...prevElements, newElement]);
      setElements((prevElements) =>
        prevElements.filter(
          (elem) => elem.id !== elem1.id && elem.id !== elem2.id
        )
      );
    }
  };

  return (
    <div
      className="App"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <header className="App-header">
        <h1>Кристаллический алхимик</h1>
        <div
          className="square"
          style={{
            position: 'relative',
            width: 500,
            height: 500,
            border: '2px solid black',
            marginBottom: '20px',
          }}
        >
          {elements.map((elem) => (
            <div
              key={elem.id}
              onMouseDown={(e) => handleDragStart(e, elem.id)}
              style={{
                position: 'absolute',
                left: `${elem.x}px`,
                top: `${elem.y}px`,
                width: '70px',
                height: '70px',
                backgroundColor: elem.color,
                borderRadius: elem.type === 'circle' ? '50%' : '0',
                clipPath:
                  elem.type === 'triangle'
                    ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                    : elem.type === 'trapezoid'
                    ? 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)'
                    : elem.type === 'pentagon'
                    ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                    : elem.type === 'diamond'
                    ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                    : elem.type === 'hexagon'
                    ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                    : elem.type === 'star'
                    ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                    : 'none',
                cursor: 'move',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '14px',
                color: 'black',
                fontWeight: 'bold',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              {elem.name}
            </div>
          ))}
        </div>
        <div
          className="help"
          onClick={() => setHelpVisible(!helpVisible)}
          style={{ cursor: 'pointer', marginTop: '20px' }}
        >
          Помощь
        </div>
        {helpVisible && (
          <div
            className="help-text"
            style={{ marginTop: '10px', fontSize: '14px', color: 'black' }}
          >
            Перетаскивайте элементы и соединяйте их, чтобы создавать новые. Например, соедините Кристаллит и Трегонис, чтобы получить Австралий.
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
