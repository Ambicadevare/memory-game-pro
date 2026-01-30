import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const emojiSets = {
  easy: ["🍎", "🍌", "🍇", "🍓"],
  medium: ["🍎", "🍌", "🍇", "🍓", "🍉", "🥭"],
  hard: ["🍎", "🍌", "🍇", "🍓", "🍉", "🥭", "🥑", "🍒"]
};

export default function App() {
  const [player, setPlayer] = useState("");
  const [level, setLevel] = useState("easy");
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [musicOn, setMusicOn] = useState(true);

  // Audio refs
  const bgMusic = useRef(null);
  const flipSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    bgMusic.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    flipSound.current = new Audio("https://www.soundjay.com/button/sounds/button-16.mp3");
    winSound.current = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");

    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.2;
  }, []);

  // TIMER
  useEffect(() => {
    if (started) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [started]);

  // START GAME
  function startGame() {
    const emojis = emojiSets[level];
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));

    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setStarted(true);

    // Start music after user click
    if (musicOn && bgMusic.current) {
      bgMusic.current.play().catch(() => { });
    }
  }

  // MUSIC TOGGLE
  function toggleMusic() {
    setMusicOn(prev => {
      if (!prev) {
        bgMusic.current.play().catch(() => { });
      } else {
        bgMusic.current.pause();
      }
      return !prev;
    });
  }

  // FLIP CARD
  function handleFlip(index) {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index]?.emoji)) return;

    flipSound.current.currentTime = 0;
    flipSound.current.play();

    setFlipped(prev => [...prev, index]);
  }

  // MATCH LOGIC
  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;

      if (cards[a]?.emoji === cards[b]?.emoji) {
        setMatched(prev => [...prev, cards[a].emoji]);
      }

      setMoves(prev => prev + 1);

      setTimeout(() => {
        setFlipped([]);
      }, 700);
    }
  }, [flipped, cards]);

  // WIN SOUND
  useEffect(() => {
    if (matched.length === emojiSets[level].length && started) {
      winSound.current.play();
    }
  }, [matched]);

  return (
    <div className="app">
      <h1>🧠 Memory Game PRO</h1>

      {/* MUSIC BUTTON */}
      <button onClick={toggleMusic}>
        {musicOn ? "🔊 Music ON" : "🔇 Music OFF"}
      </button>

      {!started && (
        <div className="setup">
          <input
            placeholder="Enter Name"
            value={player}
            onChange={e => setPlayer(e.target.value)}
          />

          <select value={level} onChange={e => setLevel(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button onClick={startGame} disabled={!player}>
            Start Game
          </button>
        </div>
      )}

      {started && (
        <>
          <div className="stats">
            <p>👤 {player}</p>
            <p>🎯 {level}</p>
            <p>🧮 Moves: {moves}</p>
            <p>⏱ {time}s</p>
          </div>

          <div className="grid">
            {cards.map((card, index) => {
              const show = flipped.includes(index) || matched.includes(card.emoji);

              return (
                <div key={index} className="card" onClick={() => handleFlip(index)}>
                  <div className={`inner ${show ? "flip" : ""}`}>
                    <div className="front">❓</div>
                    <div className="back">{card.emoji}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
