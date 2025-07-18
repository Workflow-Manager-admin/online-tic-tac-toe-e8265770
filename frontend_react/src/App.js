import React, { useState, useEffect } from "react";
import "./App.css";

// Color palette for minimalistic light theme (from requirements):
const PRIMARY = "#3f51b5";     // used for main accent elements
const SECONDARY = "#f50057";   // (e.g., lose/x/score highlight)
const ACCENT = "#4caf50";      // (e.g., win/o/score highlight)

// PUBLIC_INTERFACE
function App() {
  // Board cells: 9 slots, each empty or 'X' or 'O'
  const [board, setBoard] = useState(Array(9).fill(""));
  // "X" starts first
  const [currentPlayer, setCurrentPlayer] = useState("X");
  // Game result: "X", "O", "draw", or null if ongoing
  const [result, setResult] = useState(null);
  // Total scores by symbol
  const [score, setScore] = useState({ X: 0, O: 0 });
  // UI: for minimal preview, use light theme by default (with toggler)
  const [theme, setTheme] = useState("light");

  // Game logic: all winning triplets of cell indices
  const WIN_COMBOS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    // Ignore if not empty or game finished
    if (board[idx] || result) return;
    // Place mark
    const newBoard = board.slice();
    newBoard[idx] = currentPlayer;
    setBoard(newBoard);
    // Win/Draw detection happens after state updates below
  }

  // PUBLIC_INTERFACE
  function checkWinner(b) {
    for (const combo of WIN_COMBOS) {
      const [a, bIdx, c] = combo;
      if (
        b[a] &&
        b[a] === b[bIdx] &&
        b[a] === b[c]
      )
        return b[a]; // "X" or "O"
    }
    // Draw condition: if all squares filled and no winner
    if (b.every((x) => x)) return "draw";
    return null;
  }

  // After every board change, check if game ended and manage switching players
  useEffect(() => {
    const winner = checkWinner(board);
    if (winner) {
      setResult(winner);
      if (winner === "X" || winner === "O") {
        setScore((s) => ({ ...s, [winner]: s[winner] + 1 }));
      }
      // If draw, do not increment scores
    } else {
      // Only switch turns if game not ended after last move
      setCurrentPlayer((p) => (p === "X" ? "O" : "X"));
    }
    // eslint-disable-next-line
  }, [board]);

  // When the user resets, all except the scores are cleared
  // PUBLIC_INTERFACE
  function handleResetGame() {
    setBoard(Array(9).fill(""));
    setCurrentPlayer(result === "draw"
      ? (Math.random() < 0.5 ? "X" : "O")
      : (result === "X" || result === "O" ? (result === "X" ? "O" : "X") : "X")
    );
    setResult(null);
  }

  // PUBLIC_INTERFACE
  function handleResetScores() {
    setScore({ X: 0, O: 0 });
    handleResetGame();
  }

  // Theme toggler
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Minimal styled board cell
  function Square({ value, onClick, highlight }) {
    return (
      <button
        className="ttt-square"
        style={{
          background: highlight
            ? value === "X" ? ACCENT : value === "O" ? SECONDARY : "#e3eafd"
            : "#fff",
          color: value === "X" ? PRIMARY : value === "O" ? SECONDARY : "#888",
          border: `1.5px solid #dee2e6`,
          transition: "background 0.15s, color 0.15s",
        }}
        onClick={onClick}
        aria-label={value || "empty"}
        disabled={!!value || !!result}
      >
        <span className="ttt-large">{value}</span>
      </button>
    );
  }

  // Highlight winning combo if there's a winner
  let winHighlightIndices = [];
  if (result === "X" || result === "O") {
    for (const combo of WIN_COMBOS) {
      if (
        board[combo[0]] &&
        board[combo[0]] === board[combo[1]] &&
        board[combo[1]] === board[combo[2]]
      ) {
        winHighlightIndices = combo;
        break;
      }
    }
  }

  // Status Message
  let status;
  if (result === "X" || result === "O") {
    status = (
      <span style={{ color: result === "X" ? PRIMARY : SECONDARY }}>
        Winner: <b>{result}</b>
      </span>
    );
  } else if (result === "draw") {
    status = (
      <span style={{ color: "#6c757d" }}>
        <b>Draw!</b>
      </span>
    );
  } else {
    status = (
      <>
        Next turn:{" "}
        <span style={{ color: currentPlayer === "X" ? PRIMARY : SECONDARY, fontWeight: 500 }}>
          {currentPlayer}
        </span>
      </>
    );
  }

  // Board rendering
  function renderBoard() {
    return (
      <div className="ttt-board">
        {Array(3).fill().map((_, row) =>
          <div className="ttt-row" key={row}>
            {Array(3).fill().map((_, col) => {
              const idx = row * 3 + col;
              return (
                <Square
                  key={idx}
                  value={board[idx]}
                  onClick={() => handleSquareClick(idx)}
                  highlight={winHighlightIndices.includes(idx)}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Responsive layout CSS styles (inline minimal supplement, extends App.css)
  const outerStyle = {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 0.5rem",
    fontFamily: "'Segoe UI', 'Arial', sans-serif",
  };

  return (
    <div className="App" style={outerStyle}>
      <header className="App-header" style={{ minHeight: "auto" }}>
        <button
          className="theme-toggle"
          style={{ position: "absolute", top: 20, right: 20 }}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <h1
          className="ttt-title"
          style={{
            fontSize: "2.5rem",
            margin: "0.5rem 0",
            letterSpacing: "0.07em",
            color: PRIMARY,
            fontWeight: 800,
          }}
        >
          Tic Tac Toe
        </h1>
        <div
          className="ttt-scoreboard"
          style={{
            margin: "1.5rem 0 1rem 0",
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
          }}
        >
          {/* X score */}
          <span
            style={{
              color: PRIMARY,
              fontWeight: "bold",
              fontSize: "1.2rem",
              letterSpacing: "0.05em",
            }}
          >
            X: {score.X}
          </span>
          {/* O score */}
          <span
            style={{
              color: SECONDARY,
              fontWeight: "bold",
              fontSize: "1.2rem",
              letterSpacing: "0.05em",
            }}
          >
            O: {score.O}
          </span>
        </div>
        <div className="ttt-status" style={{
          minHeight: "2.4em",
          marginBottom: "1rem",
          fontSize: "1.25rem",
          fontWeight: 600,
        }}>{status}</div>
        {renderBoard()}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            alignItems: "center",
            marginTop: "1.7rem",
          }}
        >
          <button
            style={{
              background: PRIMARY,
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              padding: "0.85em 1.4em",
              fontWeight: 600,
              marginTop: "0.2em",
              fontSize: "1rem",
              boxShadow: "0 2px 10px -8px #3f51b5",
              cursor: "pointer",
            }}
            onClick={handleResetGame}
          >
            {result ? "Play Again" : "Restart Round"}
          </button>
          <button
            style={{
              background: "#f9f9f9",
              color: "#555",
              border: "1px solid #e0e0e0",
              borderRadius: "7px",
              padding: "0.70em 1.3em",
              fontSize: "0.98rem",
              cursor: "pointer",
            }}
            onClick={handleResetScores}
            aria-label="Reset scores"
          >
            Reset Scores
          </button>
        </section>
        <footer style={{ marginTop: "2.3rem", fontSize: "0.88rem", color: "#888" }}>
          <span>
            <b>Minimal Tic Tac Toe</b> – React | Light theme | {new Date().getFullYear()}
          </span>
        </footer>
      </header>
      {/* Inline style for Tic Tac Toe board and cells */}
      <style>{`
        .ttt-board {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin: 0 auto;
          box-shadow: 0 2px 14px -8px #bfc4db;
          border-radius: 16px;
          background: #fafbfe;
          padding: 0.8rem 0.6rem;
        }
        .ttt-row {
          display: flex;
        }
        .ttt-square {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          outline: none;
          border-radius: 9px;
          margin: 4px;
          cursor: pointer;
          user-select: none;
          background: #fff;
        }
        .ttt-square:active {
          background: #ecf1fa;
        }
        .ttt-large {
          font-size: 2.15rem;
        }
        @media (max-width: 480px) {
          .ttt-board { padding: 0.2rem 0.2rem; }
          .ttt-square { width: 45px; height: 45px; font-size: 1.3rem; margin: 2.5px;}
          .ttt-title { font-size: 1.4rem!important; }
        }
      `}
      </style>
    </div>
  );
}

export default App;
