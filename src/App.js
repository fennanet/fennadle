
import "./styles.css";
import Backspace from "./backspace.svg";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { init } from '@plausible-analytics/tracker'

init({
  domain: 'my-app.com'
})

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
  const [dictionary, setDictionary] = useState(new Set());
  const [modalContent, setModalContent] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [shareText, setShareText] = useState("");

  useEffect(() => {
    fetch("/daily-words.json")
      .then((res) => res.json())
      .then((data) => {
        const today = new Date().toISOString().split('T')[0];
        setSecretWord(data[today] || "DEFAULT");
      });
  }, []);

  useEffect(() => {
    fetch('/words.json')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDictionary(new Set(data));
          console.log('dictionary loaded');
        } else {
          console.error('Expected an array in words.json');
        }
      })
      .catch(error => console.error('Error loading dictionary:', error));
  }, []);

  const handleInput = (value) => {
    setModalContent("");
  
    if (gameOver) return;
  
    if (value === "BACKSPACE") {
      setInput((prev) => prev.slice(0, -1));
      return;
    }
  
    if (value === "ENTER") {
      if (input.length !== 5) return;
  
      const guess = input.toUpperCase();
  
      if (!dictionary.has(guess.toLowerCase())) {
        setModalContent("not in dictionary");
        setInput("");
        return;
      }
  
      const newColors = getColors(guess, secretWord);
  
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
  
      if (guess === secretWord || currentRow >= 5) {
        triggerConfetti();
        setGameOver(true);
        
        const ShareTextContent = () => {
          colors[currentRow].fill('green')
          const d = new Date();
          let date = d.toDateString();
          let content = "fennadle " + date + "\n" + (currentRow + 1) +"/6";
          
          for (let y of colors) {
            content += "\n";
            console.log(y);
            for (let char of y) {
              if (char === 'green') {
                content += "🟩";
              } else if (char === 'yellow') {
                content += "🟨";
              } else if (char === null || char === undefined) {
                      content += ""; 
              } else {
                content += "⬛";
              }
            } 
          }
          console.log(content);
          return content;
        };
        
        setShareText(ShareTextContent());
      } else {
        setCurrentRow((prev) => prev + 1);
        setInput("");
      }
  
      return;
    }
  
    if (/[a-zA-Z]/.test(value)) {
      if (input.length < 5 && currentRow < 5) {
        setInput((prev) => prev + value.toUpperCase());
      }
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key.length > 1 &&
        e.key !== "Enter" &&
        e.key !== "Backspace"
      ) {
        return;
      }
  
      if (e.key === "Enter") {
        handleInput("ENTER");
      } else if (e.key === "Backspace") {
        handleInput("BACKSPACE");
      } else {
        handleInput(e.key);
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
  
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [input, currentRow, gameOver, dictionary]);
  
  const handleVirtualClick = (value) => {
    handleInput(value);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#9B59B6', '#3498DB']
    });
  };


  return (
    <div className="app-body">
      <Modal text={modalContent} />
      <ShareButton text={shareText} />
      <h1 className="title">The Fenna Times</h1>
      <Grid text={grid} currentInput={input} currentRow={currentRow} colors={colors} />
      <div className="keyboard">
        <Keyboard onClick={handleVirtualClick} />
      </div>
      <a className="note" href="https://www.fenna.net?ref=fennadle" target={"_blank"} rel={"noreferrer"}><i>also see: my personal website</i></a>
      <p className="note"><i>note: Fennadle is not, in any way, affiliated with The New York Times Games / Wordle.</i></p>
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

function Modal({ text }) {
  return (
    <div>
      { (text !== "") &&
        <div className="modal" key={text}>
          <div>
            {text}
          </div>
        </div>
      }
    </div>
    
  );
}

function ShareButton({ text }) {
  const [copyText, setCopyText] = useState('copy result');

  const handleCopy = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopyText('result copied!');
      setTimeout(() => setCopyText('copy result'), 2000);
    } catch (err) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        setCopyText('result copied!');
        setTimeout(() => setCopyText('copy result'), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        setCopyText('copy failed');
      }
    }
  };

  const handleShare = async () => {
    if (!text) return;

    if (!navigator.share) {
      console.log('Web Share API not supported, falling back to copy');
      await handleCopy();
      return;
    }

    try {

      await navigator.share({ 
        title: 'Result', 
        text: text
      });
      
      setCopyText('shared!');
      setTimeout(() => setCopyText('copy result'), 2000);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('User cancelled share');
      } else {
        console.error('Share failed:', error);
        await handleCopy();
      }
    }
  };

  return (
    <div className="shareDialogue">
      {text && (
        <div>
          <p>hooray!</p>
          <button onClick={handleShare}>
            share result
          </button>
          <button onClick={handleCopy}>{copyText}</button>
        </div>
      )}
    </div>
  );
}
