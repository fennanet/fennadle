import "./styles.css";
import Backspace from "./backspace.svg";
import { useEffect, useRef, useState } from "react";

export default function Main() {
  const [grid, setGrid] = useState(Array.from({ length: 6 }, () => Array(5).fill(null)));
  const [currentRow, setCurrentRow] = useState(0);
  const [input, setInput] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.length > 1 && e.key !== "Enter" && e.key !== "Backspace") return;

      if (e.key === "Backspace") {
        setInput((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        if (input.length === 5 && currentRow < 5) {
          setGrid((prev) => {
            const newGrid = [...prev];
            newGrid[currentRow] = input.split("");
            return newGrid;
          });
          setCurrentRow((prev) => prev + 1);
          setInput("");
        }
      } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        if (input.length < 5 && currentRow < 5) {
          setInput((prev) => prev + e.key.toUpperCase());
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input, currentRow]);

  const handleVirtualClick = (value) => {
    if (value === "BACKSPACE") {
      setInput((prev) => prev.slice(0, -1));
    } else if (value === "ENTER") {
      if (input.length === 5 && currentRow < 5) {
        setGrid((prev) => {
          const newGrid = [...prev];
          newGrid[currentRow] = input.split("");
          return newGrid;
        });
        setCurrentRow((prev) => prev + 1);
        setInput("");
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
      <Grid text={grid} currentInput={input} currentRow={currentRow} />
      <div className="keyboard">
        <Keyboard onClick={handleVirtualClick} />
      </div>
    </div>
  );
}

function Grid({ text, currentInput, currentRow }) {
  return (
    <>
      {text.map((row, i) => (
        <GridRow key={i} text={row} isCurrentRow={i === currentRow} currentInput={currentInput} />
      ))}
    </>
  );
}

function GridRow({ text, isCurrentRow, currentInput }) {
  const letters = Array.isArray(text)
    ? text.map((letter, index) => (
        <div key={index} className={`cell ${letter ? 'filled' : ''}`}>
          {letter || (isCurrentRow && index < currentInput.length ? currentInput[index] : "")}
        </div>
      ))
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
  const ref = useRef(null);

  const handleClick = () => {
    if (onClick) onClick(value);
  };

  const className = WIDE_KEYS.includes(value) ? "key wide" : "key";

  return (
    <div ref={ref} className={className} onClick={handleClick}>
      {value === "BACKSPACE" ? (
        <img src={Backspace} alt="Backspace" className="keyIcon" />
      ) : (
        value
      )}
    </div>
  );
}