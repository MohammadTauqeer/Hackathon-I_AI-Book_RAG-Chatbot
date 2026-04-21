import React, { useState } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I am your AI assistant for Physical AI & Humanoid Robotics. Ask me anything about the textbook.', sender: 'bot' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMsg = { id: Date.now(), text: userInput, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    
    const queryToSend = userInput;
    setUserInput('');
    setLoading(true);

    try {
        // --- UPDATED URLS ---
        const LOCAL_API_URL = 'http://127.0.0.1:7860/api/query';
        const PROD_API_URL = 'https://mohammadtouqeer-physical-ai-chatbot-new.hf.space/api/query';

        const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? LOCAL_API_URL
            : PROD_API_URL;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Backend "question" field mang raha hai
            body: JSON.stringify({ question: queryToSend }), 
        });

        const data = await response.json();
        
        // Backend "response" key mein data bhej raha hai
        const botAnswer = data.response || data.answer || data.text;

        if (botAnswer) {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                text: botAnswer, 
                sender: 'bot',
                sources: data.sources || [] 
            }]);
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error("API Error:", error);
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: "Server se rabta nahi ho pa raha. Check karein ke Hugging Face Space running hai?", 
            sender: 'bot' 
        }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Physical AI Assistant</h3>
            <button className="close-button" onClick={toggleChat}>×</button>
          </div>
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="content">
                  {message.text}
                  {message.sources && message.sources.length > 0 && (
                    <div className="sources-section">
                      <hr />
                      <small><strong>Sources:</strong></small>
                      {message.sources.map((src, i) => (
                        <div key={i} style={{fontSize: '10px', color: '#666'}}>
                          • {src.text_preview || src.text || "Textbook segment"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="message bot"><div className="thinking">Thinking...</div></div>}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Ask a question..."
              className="chat-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="send-button" onClick={handleSendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <button className="chat-toggle-button" onClick={toggleChat}>💬</button>
      )}
    </div>
  );
};

export default ChatWidget;
