
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import Draggable from "react-draggable";
import { Stomp, Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Profile from "../img/profile.png";
import "./css/RandomChat.css";
import CateChatListItem from "./CateChatListItem";
import styled, { keyframes } from "styled-components";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const MessageStyled = styled.p``;

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
  visibility: ${props =>
        props.visible === "visible"
            ? "visible"
            : props.visible === ""
                ? ""
                : "hidden"};
  animation: ${props =>
        props.visible === "visible"
            ? slideDown
            : props.visible === ""
                ? slideUp
                : (element) => element.setAttribute("visibility", "")} 0.25s ease-in-out;
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  z-index: 2;
  transform: ${props =>
        props.visible === "visible"
            ? "translate(-50%, -50%) scaleY(1)"
            : "translate(-50%, -50%) scaleY(0)"};
`;

const UserListPanel = styled.div`
  visibility: ${props =>
        props.visible === "visible"
            ? "visible"
            : props.visible === ""
                ? ""
                : "hidden"};
  animation: ${props =>
        props.visible === "visible" ? slideDownUserList : slideUpUserList} 0.25s
    ease-in-out;
  position: absolute;
  top: 0;
  right: ${props =>
        props.visible === "visible" ? "0" : `-${props.width}px`};
  z-index: 1;
  width: ${props => props.width}px;
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

const RandomChatDrag = React.memo(({ show, onClose, logoutApiCate }) => {


    const [isMinimized, setIsMinimized] = useState(false);
    const [isChatDiv, setIsChatDiv] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    //랜덤 채팅 입장 후
    //인풋창 비활성화 상태 변수
    const [isChatReadOnly, setIsChatReadOnly] = useState(false);
    const [messages, setMessages] = useState([]);
    const [sendMessage, setSendMessage] = useState("");
    const { randomRoomId } = useParams();
    const [room, setRoom] = useState({});

    const client = useRef({});

    //현재 스크롤바의 위치를 담는 상태 변수
    const [scroll, setScroll] = useState("");
    const [isScroll, setIsScroll] = useState("");
    const [previousScrollbarState, setPreviousScrollbarState] = useState(false);


    // 위치 및 상태 설정
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [size, setSize] = useState({ width: "300px", height: "450px" });

    useEffect(() => {
        if (isChatDiv) {
            setSize({ width: "450px", height: "650px" });
        } else {
            setSize({ width: "400px", height: "300px" });
        }
    }, [isChatDiv]);


    const [position, setPosition] = useState(() => ({
        x: (window.innerWidth / 2) - 150,
        y: (window.innerHeight / 2) - 225,
    }));

    useEffect(() => {
        const handleResize = () => {
            setPosition(prevPos => ({
                x: Math.min(prevPos.x, window.innerWidth - parseInt(size.width)),
                y: Math.min(prevPos.y, window.innerHeight - parseInt(size.height))
            }));

            if (position.x + parseInt(size.width) > window.innerWidth) {
                setPosition((prevPos) => ({
                    ...prevPos,
                    x: window.innerWidth - parseInt(size.width),
                }));
            }

            if (position.y + parseInt(size.height) > window.innerHeight) {
                setPosition((prevPos) => ({
                    ...prevPos,
                    y: window.innerHeight - parseInt(size.height),
                }));
            }
        };

        handleResize(); // initial call

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [size]);

    const onDragStop = (e, d) => {
        let newPosition = {
            x: Math.max(0, Math.min(d.x, window.innerWidth - parseInt(size.width))),
            y: Math.max(0, Math.min(d.y, window.innerHeight - parseInt(size.height))),
        };

        setPosition(newPosition);
    };


    const onResizeStop = (e, direction, ref, delta, position) => {
        let newWidth = parseInt(ref.style.width);
        let newHeight = parseInt(ref.style.height);

        if (position.x + newWidth > window.innerWidth) {
            newWidth = window.innerWidth - position.x;
        }

        if (position.y + newHeight > window.innerHeight) {
            newHeight = window.innerHeight - position.y;
        }

        if (position.y < 0) {
            newHeight = parseInt(ref.style.height) + position.y;
            position.y = 0;
        }

        setSize({ width: `${newWidth}px`, height: `${newHeight}px` });
        setPosition(position);
    };


    useEffect(() => {
        if (show) {
            setIsClosed(false);
        }
    }, [show]);

    useEffect(() => {
        const scrollElement = document.querySelector(".EnterRoomChat_content_2");

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

    const connect = useCallback(() => {
        setIsChatReadOnly(false);
        const socket = new SockJS("/random");
        const stompClient = Stomp.over(socket);
        client.current = stompClient;
        const headers = {
            Authorization: localStorage.getItem("Authorization"),
            userName: localStorage.getItem("username"),
        };
        stompClient.connect(
            headers,
            () => onConnected(),
            (error) => onError(error)
        );
    }, []);

    const disconnect = useCallback(() => {
        if (client.current && typeof client.current.disconnect === "function") {
            client.current.disconnect(() => {
                setMessages([]);
                setIsChatReadOnly(false);
                console.log("websocket disconnected");
                setIsChatDiv(false);
            });
        }
    }, []);

    const onConnected = useCallback(() => {
        setIsChatReadOnly(true);
        console.log("Connected to Websocket Server");
        client.current.userName = localStorage.getItem("userName");
        client.current.subscribe(
            `/randomSub/randomChat/${room.randomRoomId}`,
            (message) => onReceived(message)
        );
        joinEvent();
    }, [room.randomRoomId]);

    const onError = useCallback(
        (error) => {
            console.log("WebSocket 에러: ", error);
        },
        []
    );

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
        client.current.send(
            `/randomPub/randomChat/${randomRoomId}/enter`,
            {},
            JSON.stringify(joinMessage)
        );
    }

    const sendChatMessage = useCallback(
        (msgText) => {
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
                client.current.send(
                    `/randomPub/randomChat/${room.randomRoomId}`,
                    {},
                    JSON.stringify(messageData)
                );
            }
        },
        [room.randomRoomId]
    );

    useEffect(() => {
        if (isChatDiv) {
            console.log("랜덤 채팅방 정보");
            console.log(room);
            connect();
        } else {
            disconnect();
        }

        return () => disconnect();
    }, [isChatDiv, connect, disconnect]);

    const handleMinimizeClick = () => {
        setIsMinimized(!isMinimized);
    };

    const handleCloseClick = () => {
        setIsChatDiv(false);
        setSendMessage('');
        setIsChatReadOnly(true);
        setIsClosed(true);
        onClose();
    };

    const handleSendMessage = useCallback(
        (event) => {
            event.preventDefault();
            if (sendMessage.trim() !== "") {
                const scrollElement = document.querySelector(".EnterRoomChat_content_2");
                if (isScrollbarAtBottom(scrollElement)) {
                    setIsScroll(true);
                } else {
                    setIsScroll(false);
                }

                sendChatMessage(sendMessage);
                setSendMessage("");
            } else {
                return;
            }
        },
        [sendMessage, sendChatMessage]
    );

    const isScrollbarAtBottom = (element) => {
        return scroll + element.clientHeight === element.scrollHeight;
    };

    const handleScroll = useCallback((event) => {
        const element = event.target;
        setScroll(element.scrollTop);
    }, []);

    const startRandomChat = async (e) => {
        e.preventDefault();
        const authorization = localStorage.getItem("Authorization");
        const username = localStorage.getItem("userName");
        if (!authorization) {
            return console.log("authorization token not found");
        }
        const startRandomC = async (retry = true) => {
            try {
                const response = await fetch("/random/room", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: localStorage.getItem("Authorization"),
                        userName: localStorage.getItem("userName"),
                    },
                    body: JSON.stringify({ userName: username }),
                });

                const accessToken = response.headers.get("Authorization");
                if (accessToken != null) {
                    localStorage.setItem("Authorization", accessToken);
                }
                if (response.headers.get("refresh") != null) {
                    alert("로그아웃 startRandomC");
                    return;
                }

                if (!response.ok) {
                    if (retry) {
                        await startRandomC(false);
                    }
                    return console.error(`Error: ${response.status}`);
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
                setIsClosed(false); // isClosed 상태 변수를 false로 변경
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
    };

    const exitChatDiv = useCallback(() => {
        setIsChatDiv(false);
    }, []);

    return (
        <>
            {isMinimized && (
                <Button
                    onClick={handleMinimizeClick}
                    style={{
                        position: "absolute",
                        left: "46.2%",
                        bottom: "80px",
                        transform: "translateX(-50%)",
                    }}
                    className={"maximum_btn"}
                >
                    R
                </Button>
            )}

            {show && (
                <Rnd

                    size={size}
                    minWidth={400}
                    minHeight={300}
                    maxWidth={600}
                    maxHeight={750}
                    position={position}
                    onDragStop={onDragStop}
                    onResizeStop={onResizeStop}
                    default={{ x: position.x, y: position.y }}
                    style={{
                        background: "rgba(50, 50, 50, 0.8)",
                        borderRadius: "15px",
                        zIndex: "9999",
                        position: "fixed",
                        display: isMinimized ? "none" : "block",
                    }}
                    enableResizing={{
                        top: false,
                        right: true,
                        bottom: true,
                        left: false,
                        topRight: true,
                        bottomRight: true,
                        bottomLeft: false,
                        topLeft: false,
                    }}
                    dragHandleClassName="draggable-header"
                    bounds="window"
                >
                    <div
                        style={{
                            top: "0",
                            color: "black",
                            width: "100%",
                            height: "100%",
                            borderRadius: "15px",
                            borderTopLeftRadius: "15px",
                            borderBottomLeftRadius: "15px",
                            padding: "1em",
                            margin: "auto",
                            userSelect: "none",
                            zIndex: "0",
                            background: "rgb(50, 50, 50,0.8)",
                        }}
                    >
                        <div className={"header"}>
                            <div className={"btnDiv_create"}></div>
                            <div className={"title_cate"}>Random Chat</div>
                            <div className={"btnDiv"} style={{ zIndex: "2" }}>
                                <Button
                                    onClick={handleMinimizeClick}
                                    className={"minimum"}
                                    style={{ width: "auto" }}
                                >
                                    _
                                </Button>
                                <Button
                                    onClick={handleCloseClick}
                                    className={"close"}
                                    style={{ width: "auto" }}
                                >
                                    X
                                </Button>
                            </div>
                        </div>
                        {isChatDiv ? (
                            <div className={"chat"}>
                                <div className="draggable-header">
                                    <div className={"EnterRoom"}>
                                        <div className={"EnterRoom_2"}>
                                            <div className={"EnterRoomCate"}></div>
                                            <div className={"EnterRoomName"}>
                                                <span className={"EnterRoomName_2"}></span>
                                            </div>
                                            <div className={"EnterRoomClose"}>
                                                <Button
                                                    className={"Close_btn"}
                                                    onClick={exitChatDiv}
                                                    style={{ width: "100%" }}
                                                >
                                                    Back
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={"EnterRoomChat"}>
                                    <div className={"EnterRoomChat_2"}>
                                        <div className={"EnterRoomChat_content"}>
                                            <div
                                                className="EnterRoomChat_content_2"
                                                onScroll={handleScroll}
                                            >
                                                {messages.map((message, index) => {
                                                    const isMyMessage =
                                                        message.sender === localStorage.getItem("userName");
                                                    return (
                                                        <MessageStyled
                                                            key={index}
                                                            className={
                                                                message.type !== "CHAT"
                                                                    ? "userJoin"
                                                                    : isMyMessage
                                                                        ? "userY"
                                                                        : "userX"
                                                            }
                                                        >
                                                            {message.type !== "CHAT" ? (
                                                                <div>
                                                                    <span className="content_join">
                                                                        {message.content}
                                                                    </span>
                                                                    <p className="message-regdate_Join">
                                                                        {message.time}
                                                                    </p>
                                                                </div>
                                                            ) : isMyMessage ? (
                                                                <div>
                                                                    <div className={"message-user"}>
                                                                        <span className="userName">
                                                                            {message.sender}
                                                                        </span>
                                                                    </div>
                                                                    <span className="content_user">
                                                                        {message.content}
                                                                    </span>
                                                                    <span className="message-regdate">
                                                                        {message.time}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <div className={"message-other"}>
                                                                        <span className="userName">
                                                                            {message.sender}
                                                                        </span>
                                                                    </div>
                                                                    <span className="content_other">
                                                                        {message.content}
                                                                    </span>
                                                                    <span className="message-regdate_other">
                                                                        {message.time}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </MessageStyled>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className={"EnterRoomChat_input"}>
                                            <form
                                                className={"EnterRoomChat_input_form"}
                                                onSubmit={handleSendMessage}
                                            >
                                                <input
                                                    placeholder={
                                                        !isChatReadOnly
                                                            ? "Connecting, please wait"
                                                            : "Please enter your message"
                                                    }
                                                    type="text"
                                                    className={"inputchat"}
                                                    required
                                                    value={sendMessage}
                                                    readOnly={!isChatReadOnly}
                                                    onChange={(e) => setSendMessage(e.target.value)}
                                                />
                                                <Button
                                                    className={"btnSend"}
                                                    type="submit"
                                                    onClick={handleSendMessage}
                                                    style={{ padding: "0.5em" }}
                                                >
                                                    SEND
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={"select"}>
                                <div className={"random_start"}>
                                    <div className={"random_start_2"} style={{ margin: "auto" }}>
                                        Start a random chat
                                    </div>
                                    <div className={"random_start_3"}>
                                        <Button
                                            style={{ marginRight: "20px" }}
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
                </Rnd>
            )}
        </>
    );
});
export default RandomChatDrag;