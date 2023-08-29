import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Prompt from "./Prompt";
import ChatBox from "./ChatBox";
import { Rnd } from "react-rnd";
import "./css/Drag.css";

const socket = io("http://localhost:8081"); // 올바른 서버 연결 주소

const minWidth = 300;
const minHeight = 450;
const maxWidth = 550;
const maxHeight = 800;

function Drag({ show, onClose }) {
  const calculateInitialPosition = () => {
    const x = window.innerWidth / 2 - minWidth / 2;
    const y = window.innerHeight / 2 - minHeight / 2;
    return { x, y };
  };

  const [position, setPosition] = useState(calculateInitialPosition());
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [messages, setMessages] = useState([
    "채팅방에 입장하셨습니다",
  ]);
  const chatMessagesRef = useRef(null);

  // 스크롤을 항상 맨 아래로 유지하기 위한 함수입니다.
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!show) {
      setIsClosed(false);
    }
  }, [show]);

  // 새로운 메시지가 추가될 때 스크롤을 아래로 이동시키 useEffect입니다.
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLeave = () => {
    socket.emit("leave", { sender: "사용자이름", randomRoomId: "randomRoomId" });
  };

  const trackPos = (data) => {
    setPosition({ x: data.x, y: data.y });
  };

  const handleMinimizeClick = () => {
    setIsMinimized(!isMinimized);
  };

  const handlePromptConfirm = () => {
    handleLeave(); // 퇴장 이벤트 호출
    setIsClosed(true);
    if (onClose) {
      onClose();
    }
    setShowPrompt(false);
  };

  const handlePromptCancel = () => {
    setShowPrompt(false);
  };

  // x 버튼 클릭 이벤트 수정
 const handleCloseClick = () => {
    setShowPrompt(true);
  };

  if (!show || isClosed) {
    return null;
  }

  return (
    <div className="Drag">
      {!isClosed && (
        <>
         <Rnd
            position={position}
            onDragStop={(e, data) => trackPos(data)}
            disableDragging={isMinimized}

            resizeHandleStyles={{ bottomRight: { cursor: 'se-resize' } }}
            enableResizing={{
              top: false,
              right: false,
              bottom: false,
              left: false,
              topRight: false,
              bottomRight: true,
              bottomLeft: false,
              topLeft: false,
            }}
            minWidth={minWidth}
            minHeight={minHeight}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
          >
            <div className="box">
        <div className="box-header">
          RandomChat
          <button onClick={handleMinimizeClick} className="min-btn">-</button>
          <button onClick={handleCloseClick} className="close-btn">x</button>
        </div>
        <br />
        {/* 밑으로 컨텐츠 들어올 부분 */}
        <div className="box-content"></div>
        <ChatBox
          messages={messages}
          // onSendMessage={handleSendMessage}
          chatMessagesRef={chatMessagesRef}
        />
        <div className="box-position">
          x: {position.x.toFixed(0)}, y: {position.y.toFixed(0)}
        </div>
      </div>
    </Rnd>
          {isMinimized && (
            <button
              onClick={handleMinimizeClick}
              style={{
                position: "fixed",
                left: "50%",
                bottom: "30px",
                transform: "translateX(-50%)",
              }}
            >
              +
            </button>
          )}
          {showPrompt && (
            <Prompt
              message="퇴장하시겠습니까?"
              onConfirm={handlePromptConfirm}
              onCancel={handlePromptCancel}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Drag;
