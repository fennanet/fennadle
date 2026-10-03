
import "./styles.css";
import Backspace from "./backspace.svg";
import { useEffect, useState } from "react";

const SECRET_WORD = "FRICK";

function getColors(guess, target) {
  const guessArr = guess.split("");
  const targetArr = target.split("");
  const colors = Array(5).fill("gray");
  
  const targetCounts = {};
  
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === targetArr[i]) {
      colors[i] = "green";
      targetCounts[guessArr[i]] = (targetCounts[guessArr[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (colors[i] === "green") continue;

    const letter = guessArr[i];
    const countInTarget = targetArr.filter(l => l === letter).length;
    const countUsedSoFar = (targetCounts[letter] || 0);

    if (countInTarget > countUsedSoFar && targetArr.includes(letter)) {
      colors[i] = "yellow";
      targetCounts[letter] = (targetCounts[letter] || 0) + 1;
    }
  }

  return colors;
}

export default function Main() {
  const [grid, setGrid] = useState(Array.from({ length: 6 }, () => Array(5).fill(null)));
  const [colors, setColors] = useState(Array.from({ length: 6 }, () => Array(5).fill(null)));
  const [currentRow, setCurrentRow] = useState(0);
  const [input, setInput] = useState("");
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;

      if (e.key.length > 1 && e.key !== "Enter" && e.key !== "Backspace") return;

      if (e.key === "Backspace") {
        setInput((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        if (input.length === 5) {
          const guess = input.toUpperCase();
          
          const newColors = getColors(guess, SECRET_WORD);
          
          setGrid((prev) => {
            const newGrid = [...prev];
            newGrid[currentRow] = guess.split("");
            return newGrid;
          });

          setColors((prev) => {
            const newColorsGrid = [...prev];
            newColorsGrid[currentRow] = newColors;
            return newColorsGrid;
          });

          if (guess === SECRET_WORD) {
            setGameOver(true);
          } else if (currentRow >= 5) {
            setGameOver(true);
          } else {
            setCurrentRow((prev) => prev + 1);
            setInput("");
          }
        }
      } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        if (input.length < 5 && currentRow < 5 && !gameOver) {
          setInput((prev) => prev + e.key.toUpperCase());
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input, currentRow, gameOver]);

  const handleVirtualClick = (value) => {
    if (gameOver) return;

    if (value === "BACKSPACE") {
      setInput((prev) => prev.slice(0, -1));
    } else if (value === "ENTER") {
      if (input.length === 5) {
        const guess = input.toUpperCase();
        const newColors = getColors(guess, SECRET_WORD);

        setGrid((prev) => {
          const newGrid = [...prev];
          newGrid[currentRow] = guess.split("");
          return newGrid;
        });

        setColors((prev) => {
          const newColorsGrid = [...prev];
          newColorsGrid[currentRow] = newColors;
          return newColorsGrid;
        });

        if (guess === SECRET_WORD) {
          setGameOver(true);
        } else if (currentRow >= 5) {
          setGameOver(true);
        } else {
          setCurrentRow((prev) => prev + 1);
          setInput("");
        }
      }
    } else if (/[a-zA-Z]/.test(value)) {
      if (input.length < 5 && currentRow < 5) {
        setInput((prev) => prev + value);
      }
    }
  };

  return (
    <div className="app-body">
      <h1 className="title">The Fenna Times</h1>
      <Grid text={grid} currentInput={input} currentRow={currentRow} colors={colors} />
      <div className="keyboard">
        <Keyboard onClick={handleVirtualClick} />
      </div>
    </div>
  );
}

function Grid({ text, currentInput, currentRow, colors }) {
  return (
    <>
      {text.map((row, i) => (
        <GridRow 
          key={i} 
          text={row} 
          isCurrentRow={i === currentRow} 
          currentInput={currentInput}
          rowColors={colors[i]}
        />
      ))}
    </>
  );
}

function GridRow({ text, isCurrentRow, currentInput, rowColors }) {
  const letters = Array.isArray(text)
    ? text.map((letter, index) => {
        let bgColor = "";
        if (rowColors) {
          if (rowColors[index] === "green") bgColor = "green";
          else if (rowColors[index] === "yellow") bgColor = "yellow";
          else if (rowColors[index] === "gray") bgColor = "gray";
        } else if (isCurrentRow && index < currentInput.length) {
          bgColor = "current";
        }

        return (
          <div 
            key={index} 
            className={`cell ${letter ? 'filled' : ''} ${bgColor}`}
          >
            {letter || (isCurrentRow && index < currentInput.length ? currentInput[index] : "")}
          </div>
        );
      })
    : [];

  return <div className="gridrow">{letters}</div>;
}

const WIDE_KEYS = ["ENTER", "BACKSPACE"];
const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

function Keyboard({ onClick }) {
  return (
    <>
      {ROWS.map((row, i) => (
        <div className="keyboardRow" key={i}>
          {row.map((value) => (
            <Key key={value} value={value} onClick={onClick} />
          ))}
        </div>
      ))}
    </>
  );
}

function Key({ value, onClick }) {
  const handleClick = () => {
    if (onClick) onClick(value);
  };

  const className = WIDE_KEYS.includes(value) ? "key wide" : "key";

  return (
    <div className={className} onClick={handleClick}>
      {value === "BACKSPACE" ? (
        <img src={Backspace} alt="Backspace" className="keyIcon" />
      ) : (
        value
      )}
    </div>
  );
}

