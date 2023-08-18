import React, {useEffect, useRef, useState, useCallback} from "react";
import Draggable from 'react-draggable';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {Stomp, Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Profile from "../img/profile.png"

import "./css/RandomChat.css";
import CateChatListItem from './CateChatListItem';
import styled, {keyframes} from "styled-components";
import {useLocation, useNavigate, useParams} from "react-router-dom";

const MessageStyled = styled.p`
`;
const slideDownUserList = keyframes`
  0% {
    width: 0;
  }
  100% {
    width: 200px;
  }
`;
const slideUpUserList = keyframes`
  0% {
    width: 200px;
  }
  100% {
    width: 0px;
  }
`;
const slideDown = keyframes`
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
`;
const slideUp = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
`;
const DivStyled = styled.div`
  visibility: ${props => props.visible === "visible" ? 'visible' : props.visible === "" ? "" : "hidden"};
  animation: ${props => props.visible === "visible" ? slideDown : props.visible === "" ? slideUp : 'hidden'} 0.25s ease-in-out;
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  z-index: 2;
  transform: ${props => props.visible === "visible" ? 'translate(-50%, -50%) scaleY(1)' : 'translate(-50%, -50%) scaleY(0)'};
  /* Add other CSS properties for the loginDiv here */
`;

// 사용자 목록 패널 스타일
const UserListPanel = styled.div`
  visibility: ${props => props.visible === "visible" ? 'visible' : props.visible === "" ? "" : "hidden"};
  animation: ${props => props.visible === "visible" ? slideDownUserList : props.visible === "" ? slideUpUserList : "hidden"} 0.25s ease-in-out;
  position: absolute;
  top: 0;
  right: 450px; // 수정된 부분
  z-index: 1;
  width: ${props => props.visible ? '200px' : '0px'}; // 기존 속성
  max-height: 70%;
  height: ${props => props.height};
  border-bottom-left-radius: 15px;
  border-top-left-radius: 15px;
  background-color: rgba(50, 50, 50, 0.8);
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.25s ease-in-out;

  &::-webkit-scrollbar {
    width: 3px;
    height: 0px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(50, 50, 50, 0.8);
  }

  &::-webkit-scrollbar-thumb:hover {
    cursor: pointer;
    background-color: rgba(50, 50, 50, 0.6);
  }

  &::-webkit-scrollbar-track {
    background-color: rgba(50, 50, 50, 0.5);
  }
`;

const RandomChatDrag = React.memo(({show, onClose, logoutApiCate}) => {
    // 위치 및 상태 설정
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
        useEffect(() => {
            const handleResize = () => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });

                const newPosition = {
                    x: (window.innerWidth / 2) - (450 / 2),  //450은 Draggable 컴포넌트의 너비
                    y: (window.innerHeight / 2) - (230 / 2), //230은 Draggable 컴포넌트의 높이
                };
                setPosition(newPosition);
            };

            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }, []);
const initialPosition = {
    x: (windowSize.width / 2) - (450 / 2), // 450은 Draggable 컴포넌트의 너비
    y: (windowSize.height / 2) - (230 / 2), // 200은 Draggable 컴포넌트의 높이
};
const [position, setPosition] = useState(initialPosition);
const handleDrag = useCallback((e, data) => trackPos(data), []);
const [isMinimized, setIsMinimized] = useState(false);
const [isClosed, setIsClosed] = useState(false);
const [isChatDiv, setIsChatDiv] = useState(false);

//랜덤 채팅 입장 후
//인풋창 비활성화 상태 변수
const [isChatReadOnly, setIsChatReadOnly] = useState(false);
const [messages, setMessages] = useState([]);
const [sendMessage, setSendMessage] = useState('');
const {randomRoomId} = useParams();
const [room, setRoom] = useState({});

const client = useRef({});

//현재 스크롤바의 위치를 담는 상태 변수
const [scroll, setScroll] = useState('');
const [isScroll, setIsScroll] = useState('');
const [previousScrollbarState, setPreviousScrollbarState] = useState(false);

useEffect(() => {
    console.log(show + " show")
    if (!show) {
        setIsClosed(false);
    }
}, [show]);

useEffect(() => {
    const scrollElement = document.querySelector('.EnterRoomChat_content_2');

    if (scrollElement) {
        const hasScrollbar = scrollElement.scrollHeight > scrollElement.clientHeight;

        if (!previousScrollbarState && hasScrollbar) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
        } else if (isScroll) {

            scrollElement.scrollTop = scrollElement.scrollHeight;
        } else if (!isScroll) {

        }

        // 스크롤바 상태 업데이트
        setPreviousScrollbarState(hasScrollbar);
    }
}, [messages]);


const connect = () => {
    //endpoint 소켓 생성
    setIsChatReadOnly(false);
    const socket = new SockJS("/random");
    //Stomp client 초기화
    const stompClient = Stomp.over(socket);
    client.current = stompClient;
    const headers = {
        "Authorization": localStorage.getItem('Authorization'),
        "userName": localStorage.getItem('username'),
    }
    stompClient.connect(headers,
        () => onConnected(),
        (error) => onError(error)
    );
};
const disconnect = () => {
    if (client.current && typeof client.current.disconnect === "function") {
        client.current.disconnect(() => {
            setMessages([]);
            setIsChatReadOnly(false);
            console.log("websocket disconnected");
            setIsChatDiv(false);
        });
    }
};
const onConnected = () => {
    setIsChatReadOnly(true);
    console.log("Connected to Websocket Server");
    client.current.userName = localStorage.getItem("userName");
    //발송, 수신할 구독 경로 정의
    client.current.subscribe(`/randomSub/randomChat/${room.randomRoomId}`, (message) => onReceived(message));
    joinEvent();
}
const onError = (error) => {
    console.log('WebSocket 에러: ', error);
}

function onReceived(payload) {
    let payloadData = JSON.parse(payload.body);
    setMessages((prev) => [...prev, payloadData]);
}

function joinEvent() {
    const joinMessage = {
        type: "ENTER",
        sender: client.current.userName,
        randomRoomId: room.randomRoomId,
    };
    client.current.send(`/randomPub/randomChat/${randomRoomId}/enter`, {}, JSON.stringify(joinMessage));
}

const sendChatMessage = (msgText) => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    if (client.current) {
        const messageData = {
            type: "CHAT",
            content: msgText,
            time: `${hour}:${minute}:${second}`,
            randomRoomId: room.randomRoomId,
            sender: client.current.userName,
        };
        console.log("Sending message: ", JSON.stringify(messageData));
        client.current.send(`/randomPub/randomChat/${room.randomRoomId}`, {}, JSON.stringify(messageData));
    }
};

useEffect(() => {
    if (isChatDiv) {
        console.log("랜덤 채팅방 정보");
        console.log(room);
        connect();
    } else {
        disconnect();
    }

    //socket 연결 해제
    return () => disconnect();
}, [isChatDiv]);

const trackPos = (data) => {
    setPosition({x: data.x, y: data.y});
};

const handleMinimizeClick = () => {
    setIsMinimized(!isMinimized);
};

const handleCloseClick = () => {
    setIsChatDiv(false);
    setIsClosed(true);
    setPosition(initialPosition);
    if (isChatDiv) {
        disconnect();
    }
    if (onClose) {
        onClose();
    }
};

if (!show || isClosed) {
    return null;
}

//랜덤챗 코드
const startRandomChat = async (e) => {
    e.preventDefault();
    const authorization = localStorage.getItem('Authorization');
    const username = localStorage.getItem('userName');
    if (!authorization) {
        return console.log("authorization token not found");
    }
    const startRandomC = async (retry = true) => {
        try {
            const response = await fetch("/random/room", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': localStorage.getItem('Authorization'),
                    'userName': localStorage.getItem('userName'),
                },
                body: JSON.stringify({userName: username})
            });

            const accessToken = response.headers.get('Authorization');
            if (accessToken != null) {
                localStorage.setItem('Authorization', accessToken);
            }
            if (response.headers.get('refresh') != null) {
                //로그아웃 처리
                alert("로그아웃 startRandomC");
                return;
            }

            if (!response.ok) {
                if (retry) {
                    await startRandomC(false);
                }
                return console.error(`Error: ${response.status}`)
            }

            const result = await response.json();
            if (!result) {
                if (retry) {
                    await startRandomC(false);
                }
                return console.error(result.errorMessage);
            }

            console.log(`Created random room name: ${result.randomRoomName}`);
            setRoom(result);
            setIsChatDiv(true);
            return result;
            // navigate(`/random/${result.randomRoomId}`, {state: {room: result}});

        } catch (error) {
            console.log(error);
            if (retry) {
                await startRandomC(false);
            }
            return;
        }
    };
    startRandomC();
}
const exitChatDiv = () => {
    setIsChatDiv(false);
};


const handleSendMessage = (event) => {
    event.preventDefault();
    if (sendMessage.trim() !== '') {
        const scrollElement = document.querySelector('.EnterRoomChat_content_2');
        if (isScrollbarAtBottom(scrollElement)) {
            setIsScroll(true);
        } else {
            setIsScroll(false);
        }

        sendChatMessage(sendMessage);
        // 메시지 전송 후 인풋 창을 비움
        setSendMessage('');
    } else {
        return;
    }
};


const isScrollbarAtBottom = (element) => {
    // 현재 스크롤 위치 + 클라이언트 높이가 스크롤 영역의 전체 높이와 동일한지 확인
    return scroll + element.clientHeight === element.scrollHeight;
};
//현재스크롤바 위치 구하기
const handleScroll = (event) => {
    const element = event.target;
    setScroll(element.scrollTop);
};

return (
    <div className="Drag">
        {!isClosed && (
            <>
                <Draggable defaultPosition={position} onDrag={handleDrag} disabled={isMinimized}>
                    <div
                        className="box"
                        style={{
                            position: isMinimized ? 'absolute' : 'fixed',
                            display: isMinimized ? 'none' : 'block',
                            top: '0',
                            cursor: 'auto',
                            color: 'black',
                            width: '450px',
                            height: isChatDiv ? '600px' : '230px',
                            borderRadius: '15px',
                            borderTopLeftRadius: '15px',
                            borderBottomLeftRadius: '15px',
                            padding: '1em',
                            margin: 'auto',
                            userSelect: 'none',
                            zIndex: '2',
                            background: 'rgb(50, 50, 50,0.8)',
                            transition: 'height 0.25s ease-in-out'
                        }}
                    >
                        <div className={"header"}>
                            <div className={"btnDiv_create"}>

                            </div>
                            <div className={"title_cate"}>
                                Random Chat

                            </div>
                            <div className={"btnDiv"}>
                                <Button
                                    onClick={handleMinimizeClick}
                                    className={"minimum"}
                                >
                                </Button>
                                <Button
                                    onClick={handleCloseClick}
                                    className={"close"}
                                >
                                </Button>
                            </div>

                        </div>
                        {isChatDiv ? (
                            <div className={"chat"}>
                                <div className={"EnterRoom"}>
                                    <div className={"EnterRoom_2"}>
                                        <div className={"EnterRoomCate"}>
                                        </div>
                                        <div className={"EnterRoomName"}>
                                                    <span className={"EnterRoomName_2"}>

                                                    </span>
                                        </div>
                                        <div className={"EnterRoomClose"}>
                                            <Button
                                                className={"Close_btn"}
                                                onClick={exitChatDiv}
                                            >
                                                Back
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className={"EnterRoomChat"}>
                                    <div className={"EnterRoomChat_2"}>
                                        <div className={"EnterRoomChat_content"}>
                                            <div className="EnterRoomChat_content_2" onScroll={handleScroll}>
                                                {messages.map((message, index) => {
                                                    const isMyMessage = message.sender === localStorage.getItem('userName');
                                                    return (
                                                        <MessageStyled
                                                            key={index}
                                                            className={message.type !== 'CHAT' ? "userJoin" : isMyMessage ? "userY" : "userX"}
                                                        >
                                                            {message.type !== 'CHAT' ? (
                                                                <div>
                                                                            <span
                                                                                className="content_join">{message.content}</span>
                                                                    <p className="message-regdate_Join">{message.time}</p>
                                                                </div>
                                                            ) : isMyMessage ? (
                                                                <div>
                                                                    <div className={"message-user"}>
                                                                        {/*<img className={"message-user-profile"}*/}
                                                                        {/*     src={message.userProfile ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + message.userProfile : Profile}*/}
                                                                        {/*/>*/}
                                                                        <span
                                                                            className="userName">{message.sender}</span>
                                                                    </div>
                                                                    <span
                                                                        className="content_user">{message.content}</span>
                                                                    <span
                                                                        className="message-regdate">{message.time}</span>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <div className={"message-other"}>
                                                                        {/*<img className={"message-other-profile"}*/}
                                                                        {/*     src={message.userProfile ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + message.userProfile : Profile}*/}
                                                                        {/*/>*/}
                                                                        <span
                                                                            className="userName">{message.sender}</span>
                                                                    </div>
                                                                    <span
                                                                        className="content_other">{message.content}</span>
                                                                    <span
                                                                        className="message-regdate_other">{message.time}</span>
                                                                </div>
                                                            )}
                                                        </MessageStyled>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className={"EnterRoomChat_input"}>
                                            <form className={"EnterRoomChat_input_form"}
                                                  onSubmit={handleSendMessage}>
                                                <input
                                                    placeholder={!isChatReadOnly ? "Connecting, please wait" : "Please enter your message"}
                                                    type="text"
                                                    className={"inputchat"}
                                                    required
                                                    value={sendMessage}
                                                    readOnly={!isChatReadOnly} // isChatDiv가 false일 때 readOnly를 true로 변경
                                                    onChange={(e) => setSendMessage(e.target.value)}
                                                />
                                                <Button
                                                    className={"btnSend"}
                                                    type="submit"
                                                    onClick={handleSendMessage}
                                                >SEND
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={"select"}>
                                <div className={"random_start"}>
                                    <div className={"random_start_2"}>
                                        start a random chat
                                    </div>
                                    <div className={"random_start_3"}>
                                        <Button
                                            style={{marginRight: '20px'}}
                                            className={"random_btn"}
                                            onClick={startRandomChat}
                                        >
                                            START
                                        </Button>
                                        <Button
                                            className={"random_btn"}
                                            onClick={handleCloseClick}
                                        >
                                            CLOSE
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                    {/* 밑으로 컨텐츠 들어갈 부분*/}
                    {/*<div style={{color:'white', fontSize: '22px'}}>x: {position.x.toFixed(0)}, y: {position.y.toFixed(0)}</div>*/}
                    {/*</div>*/}
                </Draggable>
                {isMinimized && (
                    <Button
                        onClick={handleMinimizeClick}
                        style={{
                            position: 'absolute',
                            left: '46.2%',
                            bottom: '80px',
                            transform: 'translateX(-50%)',
                        }}
                        className={"maximum_btn"}
                    >
                        R
                    </Button>
                )}
            </>
        )}
    </div>
);
})
;

export default RandomChatDrag;