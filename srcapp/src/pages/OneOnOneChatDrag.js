import React, {useEffect, useRef, useState, useCallback} from "react";
import Draggable from 'react-draggable';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import axios from "axios";
import {Stomp, Client} from "@stomp/stompjs";
import * as SockJS from "sockjs-client";
import Profile from "../img/profile.png"

import "./css/OneOnOneChat.css";
import CateChatListItem from './CateChatListItem';
import styled, {keyframes} from "styled-components";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import Picker from '@emoji-mart/react'  // <-- 추가
import data from '@emoji-mart/data'
import ChatHistoryItem from "../pages/friends/ChatHistoryItem";

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
// 사용자 목록 패널 스타일
const MenuPanel = styled.div`
  visibility: ${props => props.visible === "visible" ? 'visible' : props.visible === "" ? "" : "hidden"};
  animation: ${props => props.visible === "visible" ? slideDownUserList : props.visible === "" ? slideUpUserList : "hidden"} 0.25s ease-in-out;
  position: absolute;
  top: 77%;
  left: 0px; // 수정된 부분
  z-index: 1;
  width: ${props => props.visible ? '200px' : '0px'}; // 기존 속성
  max-height: 70%;
  height: ${props => props.visible ? '200px' : '0px'}; // 기존 속성
  border: ${props => props.visible ? '1px solid white' : '0px'}; // 기존 속성
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  border-top-left-radius: 0px;
  background-color: rgba(50, 50, 50, 0.8);
  overflow-y: hidden;
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

const RandomChatDrag = React.memo(({show, onClose, logoutApiCate, oneOnOneUserId, oneOnOneUserNickName}) => {
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
                    y: (window.innerHeight / 2) - (600 / 2), //230은 Draggable 컴포넌트의 높이
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
            y: (windowSize.height / 2) - (600 / 2), // 200은 Draggable 컴포넌트의 높이
        };
        const [position, setPosition] = useState(initialPosition);
        const handleDrag = useCallback((e, data) => trackPos(data), []);
        const [isMinimized, setIsMinimized] = useState(false);
        const [isClosed, setIsClosed] = useState(false);
        const [isChatDiv, setIsChatDiv] = useState(false);

//랜덤 채팅 입장 후
//인풋창 비활성화 상태 변수
        const [menuDiv, setMenuDiv] = useState(false);
        const [menuDiv2, setMenuDiv2] = useState(false);

        const [isChatReadOnly, setIsChatReadOnly] = useState(false);

        const [messages, setMessages] = useState([]);
        //전송 메세지를 담는 상태 변수
        const [sendMessage, setSendMessage] = useState('');
        const [chatHistory, setChatHistory] = useState([]);
        const [selectedFiles, setSelectedFiles] = useState([]);

        const [translate, setTranslate] = useState(false);
        const [showEmojiPicker, setShowEmojiPicker] = useState(false);

        const [room, setRoom] = useState({});

        const client = useRef({});
        const [userNickNameApi, setUserNickNameApi] = useState('');

//현재 스크롤바의 위치를 담는 상태 변수
        const [scroll, setScroll] = useState('');
        const [isScroll, setIsScroll] = useState('');
        const [previousScrollbarState, setPreviousScrollbarState] = useState(false);

        const roomIdRef = useRef(null); // roomId 참조 변수 생성
        const userNickNameRef = useRef(null); // roomId 참조 변수 생성
        const userProfileRef = useRef(null); // roomId 참조 변수 생성
        const userProfileOtherRef = useRef(null); // roomId 참조 변수 생성
        // stompClient를 useState로 관리
        const [stompClient, setStompClient] = useState(null);


        const getChatMessageFromDB = async () => {
            try {
                const response = await axios.get(`/chatroom/${roomIdRef.current}`, {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                });

                if (response.data && response.data.items) {
                    console.log(response.data.items);
                    setMessages(() => response.data.items);
                }
            } catch (e) {
                console.log(e);
            }
        }

        const createChatAxios = async (retry = true) => {
            try {
                const response = await fetch('/chat/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', //Content-Type 헤더 추가
                        'Authorization': localStorage.getItem('Authorization'),
                        'userName': localStorage.getItem('userName'),
                    },
                    body: JSON.stringify({userId: oneOnOneUserId})
                });

                const accessToken = response.headers.get('Authorization');
                if (accessToken != null) {
                    localStorage.setItem('Authorization', accessToken);
                }
                if (response.headers.get('refresh') != null) {
                    logoutApiCate(true);
                    return;
                }
                console.log("실행");
                const responseData = await response.json();
                if (responseData.item && responseData.item.chatroom.id) {
                    roomIdRef.current = responseData.item.chatroom.id;
                    userNickNameRef.current = responseData.item.userNickName;
                    userProfileRef.current = responseData.item.userProfile;
                    userProfileOtherRef.current = responseData.item.userProfileOther;
                } else {
                    if (retry) {
                        await createChatAxios(false);
                    }
                }
            } catch (e) {
                console.log(e);
                if (retry) {
                    await createChatAxios(false);
                }
            }
        }
        const connect = async () => {
            await createChatAxios();

            setMessages([]);
            setIsChatReadOnly(false);
            const headers = {
                Authorization: localStorage.getItem("Authorization"),
            };
            const socket = new SockJS(`/friendchat`);
            const client = Stomp.over(socket);
            console.log("12223")
            const onConnect = (frame) => {
                setIsChatReadOnly(true);
                console.log("room11111: " + roomIdRef.current)
                console.log("Connected: " + frame);
                getChatMessageFromDB();
                console.log("room22222: " + roomIdRef.current)
                client.subscribe("/frdSub/" + roomIdRef.current, (messageOutput) => {
                    const responseData = JSON.parse(messageOutput.body);
                    console.log(responseData);
                    showMessageOutput(responseData);
                });

                // 연결된 stompClient 객체를 저장합니다.
                setStompClient(client);
            };


            const onError = (error) => {
                console.log("Error: " + error);
                // connect();
            };

            client.connect(headers, onConnect, onError);
        };

        // 웹소켓 연결 종료 함수
        const disconnect = () => {
            if (stompClient !== null) {
                const headers = {
                    Authorization: localStorage.getItem("Authorization"),
                };
                stompClient.disconnect();
                setSendMessage('');
                setIsChatReadOnly(false);
                setMessages([]);
                setStompClient(null);
            }
            console.log('Disconnected');
        };

        // const publish = (msg) => {
        //     if(!client.current.connected) {
        //         return;
        //     }
        //     client.current.publish({
        //         destination: "/app/wss",
        //         body: JSON.stringify({
        //             "roomId": roomId,
        //             "sender": userName,
        //             "message": msg,
        //         })
        //     });
        // };

        const handleFileChange = (e) => {
            setSelectedFiles(e.target.files);
        };

        // const uploadFiles = () => {
        //     if (!selectedFiles || selectedFiles.length === 0) return;
        //
        //     // 각 파일을 순회하며 업로드합니다.
        //     for(let i = 0; i < selectedFiles.length; i++) {
        //         const file = selectedFiles[i];
        //
        //         const formData = new FormData();
        //         formData.append("file", file);
        //         formData.append("roomId", roomId);
        //
        //         axios.post('/chatroom/upload', formData, {
        //             headers: {
        //                 'Content-Type': 'multipart/form-data'
        //             }
        //         })
        //             .then((response) => {
        //                 const data = response.data;
        //                 const chatMessage = {
        //                     "roomId": roomId,
        //                     "sender": userName,
        //                     "message": "파일을 보냈습니다.",
        //                     "s3DataUrl": data.s3DataUrl,
        //                     "fileName": file.name,
        //                     "fileDir": data.fileDir
        //                 };
        //
        //                 client.current.publish({
        //                     destination: "/app/wss",
        //                     body: JSON.stringify(chatMessage)
        //                 });
        //             })
        //             .catch((error) => {
        //                 alert(error);
        //             });
        //     }
        // };

        const downloadFile = (name, dir) => {
            const url = `/download/${name}`;

            axios({
                method: 'get',
                url: url,
                params: {"fileDir": dir},
                responseType: 'blob'
            })
                .then((response) => {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(new Blob([response.data]));
                    link.download = name;
                    link.click();
                })
                .catch((error) => {
                    console.error("Download error", error);
                });
        };

        const getTranslation = async (textToTranslate) => {
            try {
                const response = await axios.post('/translate', {
                    text: textToTranslate,
                    frdChatRoomId: roomIdRef.current
                }, {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                });
                console.log("이거는 번역response")
                console.log(response)
                return response.data.message.result.translatedText; // API 응답에 따라 경로를 조정해야 할 수 있습니다.

            } catch (error) {
                console.error("Error during translation:", error);
            }
        }

        const toggleEmojiPicker = () => {
            setShowEmojiPicker(!showEmojiPicker);
        }

        const addEmoji = (e) => {
            let emoji = e.native;
            setMessages(prevMessage => prevMessage + emoji);
        }

        useEffect(() => {
            console.log(show + " show")
            if (!show) {
                disconnect();
                setIsClosed(false);
            } else {
                console.log("랜덤 채팅방 정보");
                console.log(room);
                connect();
            }
            return () => {
                console.log(client.current);
                if (client.current && client.current.disconnect) {
                    client.current.deactivate();
                }
            };
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

        const trackPos = (data) => {
            setPosition({x: data.x, y: data.y});
        };
        const showMessageOutput = (messageOutput) => {
            setMessages((prevMessages) => [...prevMessages, messageOutput]);
        };
        const handleMinimizeClick = () => {
            setIsMinimized(!isMinimized);
        };

        const handleCloseClick = () => {
            setIsChatDiv(false);
            setIsClosed(true);
            setPosition(initialPosition);
            if (isChatDiv) {
                // disconnect();
            }
            if (onClose) {
                onClose();
            }
        };

        if (!show || isClosed) {
            return null;
        }

        //메뉴 오픈
        const handleMenuOpen = () => {
            setMenuDiv((prevIsUserListVisible) => !prevIsUserListVisible);
            setMenuDiv2(true);
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

                // 메시지 전송 처리를 여기서 수행
                const message = {
                    roomId: roomIdRef.current,
                    message: sendMessage
                };

                stompClient.send(
                    "/frdPub/friendchat",
                    {},
                    JSON.stringify(message)
                );
                // 메시지 전송 후 인풋 창을 비움
                setSendMessage('');
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
                                    height: '600px',
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
                                        {oneOnOneUserNickName}

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
                                <div className={"chat_one"}>
                                    <div className={"EnterRoomChat_one"}>
                                        <div className={"EnterRoomChat_2"}>
                                            <div className={"EnterRoomChat_content"}>
                                                <div className="EnterRoomChat_content_2" onScroll={handleScroll}>
                                                    {messages.map((message, index) => {
                                                        const isMyMessage = message.sender === userNickNameRef.current;
                                                        return (
                                                            <MessageStyled
                                                                key={index}
                                                                className={isMyMessage ? "userY" : "userX"}
                                                            >
                                                                {isMyMessage ? (
                                                                    <div>
                                                                        <div className={"message-user"}>
                                                                            <img className={"message-user-profile"}
                                                                                 src={userProfileRef.current ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + userProfileRef.current : Profile}
                                                                            />
                                                                            <span
                                                                                className="userName">{message.sender}</span>
                                                                        </div>
                                                                        <span
                                                                            className="content_user">{message.message}</span>
                                                                        <span
                                                                            className="message-regdate">{message.createdAt}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div className={"message-other"}>
                                                                            <img className={"message-other-profile"}
                                                                                 src={userProfileOtherRef.current ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + userProfileOtherRef.current : Profile}
                                                                            />
                                                                            <span
                                                                                className="userName">{message.sender}</span>
                                                                        </div>
                                                                        <span
                                                                            className="content_other">{message.message}</span>
                                                                        <span
                                                                            className="message-regdate_other">{message.createdAt}</span>
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
                                                    <div className={"OneChat_menu_div"}>
                                                        <Button
                                                            className={menuDiv ? "add_now" : "add"}
                                                            type="button"
                                                            onClick={handleMenuOpen}
                                                        >{menuDiv ? "-" : "+"}
                                                        </Button>
                                                        <MenuPanel
                                                            visible={menuDiv ? "visible" : menuDiv2 ? "" : "hidden"}
                                                        >
                                                            <div className={"menu_div"}>

                                                            </div>
                                                        </MenuPanel>
                                                    </div>
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
                                    left: '53.8%',
                                    bottom: '80px',
                                    transform: 'translateX(-50%)',
                                }}
                                className={"maximum_btn"}
                            >
                                O
                            </Button>
                        )}
                    </>
                )}
            </div>
        );
    })
;

export default RandomChatDrag;