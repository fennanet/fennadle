import "./styles.css"
import Backspace from "./backspace.svg"
import { useLayoutEffect, useRef } from "react";


export default function main() {
  return (
    <>
      <h1 className="title">The Fenna Times</h1>
      <Grid />
      <div className="keyboard">
        <Keyboard />
      </div>
    </>
  );
}

function Grid() {
  return (
    <>
      <GridRow />
      <GridRow />
      <GridRow />
      <GridRow />
      <GridRow />
      <GridRow />
    </>
  );
}

function GridRow() {
  return (
    <div className="gridrow">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

const WIDE_KEYS = ["ENTER", "BACKSPACE"];
const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

function Keyboard() {
  return (
    <>
      {ROWS.map((row, i) => (
        <div className="keyboardRow" key={i}>
          {row.map((value) => (
            <Key key={value} value={value} />
          ))}
        </div>
      ))}
    </>
  );
}

function Key({ value }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      el.style.fontSize = "";
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth && size > 6) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [value]);

  const className = WIDE_KEYS.includes(value) ? "key wide" : "key";

  return (
      <div ref={ref} className={className}>
        {value === "BACKSPACE" ? (
          <img src={Backspace} alt="Backspace" className="keyIcon" />
        ) : (
          value
        )}
      </div>
    );
}