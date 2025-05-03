import React, { useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import './App.css'; // Ensure this import is present

const funMessages = [
  (n) => `👉 You are visitor #${n}... the chosen one.`,
  (n) => `There are ${n - 1} other developers here. Probably better than you. Or not.`,
  (n) => `🎉 Welcome! You're #${n}. That's a lucky number!`,
  (n) => `👀 ${n} curious minds are here right now.`,
  (n) => `🚀 Visitor #${n}, prepare for liftoff!`
];

const funFacts = [
  "🍯 Did you know? Honey never spoils.",
  "🐙 Octopuses have three hearts!",
  "🍌 Bananas are berries, but strawberries aren't.",
  "🦩 A group of flamingos is called a 'flamboyance'!",
  "🦄 Unicorns are the national animal of Scotland.",
  "🌈 Rainbows are actually full circles.",
  "🦕 The chicken is the closest living relative to the T-Rex.",
  "🧠 Your brain is sometimes more active when you're asleep."
];

function getRandomMessage(n) {
  const idx = Math.floor(Math.random() * funMessages.length);
  return funMessages[idx](n);
}

function getRandomFact() {
  const idx = Math.floor(Math.random() * funFacts.length);
  return funFacts[idx];
}

function Confetti({ trigger }) {
  // Simple confetti using emojis, re-renders on trigger change
  if (!trigger) return null;
  return (
    <div className="confetti">
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random()}s`
        }}>
          🎊
        </span>
      ))}
    </div>
  );
}

function App() {
  const [visitorCount, setVisitorCount] = useState(1);
  const [message, setMessage] = useState('');
  const [fact, setFact] = useState(getRandomFact());
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch Farcaster user profile on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const userProfile = await sdk.getUser();
        setUser(userProfile);
      } catch (e) {
        // Not in Farcaster Mini App or user not authenticated
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const ws = new WebSocket('wss://live-counter-backend.onrender.com');
    ws.onmessage = (event) => {
      const { visitorCount } = JSON.parse(event.data);
      setVisitorCount(visitorCount);
      setMessage(getRandomMessage(visitorCount));
      setFact(getRandomFact());
      setConfettiTrigger(false);
      setTimeout(() => setConfettiTrigger(true), 50);
    };
    return () => ws.close();
  }, []);

  // Personalized greeting
  const greeting = user?.displayName
    ? `👋 Welcome, ${user.displayName}! You are visitor #${visitorCount}.`
    : message;

  // Share handler
  const handleShare = async () => {
    try {
      await sdk.share({
        text: `I'm visitor #${visitorCount} on the Live Counter Mini App! 🎈`,
      });
    } catch (e) {
      alert("Sharing is only available inside Farcaster Mini Apps.");
    }
  };

  return (
    <div className="app-bg">
      <div className="fun-ui">
        <div className="header-balloons">
          <span role="img" aria-label="balloon" className="balloon">🎈</span>
          <h1 className="animated-title">Live Counter</h1>
          <span role="img" aria-label="balloon" className="balloon">🎈</span>
        </div>
        <Confetti trigger={confettiTrigger} />
        <p className="main-message">{greeting}</p>
        <div className="fact-box">
          <span role="img" aria-label="lightbulb">💡</span> <span>{fact}</span>
        </div>
        <button className="share-btn" onClick={handleShare}>
          📣 Share your visitor number!
        </button>
        <div className="footer">
          <span role="img" aria-label="sparkles">✨</span> Enjoy your visit! <span role="img" aria-label="sparkles">✨</span>
        </div>
      </div>
    </div>
  );
}

export default App;
