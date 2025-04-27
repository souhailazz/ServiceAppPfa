import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css'; // pour le style

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Message d'accueil qui s'affiche à l'ouverture du chatbot
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { 
          text: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?", 
          fromUser: false 
        }
      ]);
    }
  }, [open, messages.length]);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { text: input, fromUser: true };
    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await fetch('http://localhost:5207/api/Chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, utilisateurId: 8 }),
      });

      const data = await response.json();
      
      const botReply = { text: data.reponse, fromUser: false };
      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error('Erreur en envoyant le message :', error);
      // Message d'erreur en cas de problème avec l'API
      setMessages(prev => [...prev, { 
        text: "Désolé, j'ai rencontré un problème de connexion. Veuillez réessayer plus tard.", 
        fromUser: false 
      }]);
    }

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // SVG de robot pour le bouton
  const RobotIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <rect x="9" y="7" width="6" height="4" />
      <line x1="10" y1="21" x2="10" y2="24" />
      <line x1="14" y1="21" x2="14" y2="24" />
      <circle cx="8" cy="15" r="1" />
      <circle cx="16" cy="15" r="1" />
    </svg>
  );

  return (
    <div className="chatbot-container">
      <button 
        className="chatbot-button" 
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fermer le chatbot" : "Ouvrir le chatbot"}
      >
        {open ? "×" : <RobotIcon />}
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span className="chatbot-title">Assistant virtuel</span>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={msg.fromUser ? 'user-message' : 'bot-message'}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              aria-label="Message"
            />
            <button onClick={handleSend}>Envoyer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;