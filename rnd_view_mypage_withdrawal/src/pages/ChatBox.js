import React, { useState } from "react";
import './css/ChatBox.css';
import { io } from "socket.io-client";

const socket = io("http://localhost:8081");

function ChatBox({ messages, onSendMessage, chatMessagesRef }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputValue.trim()) {
      onSendMessage({text: inputValue.trim(), type: 'user'});
      socket.emit("send_message", inputValue.trim());
    }

    setInputValue("");
  };

  const getMessageClassName = (messageType) => {
    if (messageType === 'user') {
      return 'message user';
    } else {
      return 'message partner';
    }
  };

  return (
    <div className="ChatBox">
      <div className="messages" ref={chatMessagesRef}>
        {messages.map((message, index) => (
          <div key={index} className={getMessageClassName(message.type)}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="input-field"
          />
          <button type="submit" className="submit-button">Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;
