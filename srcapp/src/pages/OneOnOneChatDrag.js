import React, {useEffect, useRef, useState, useCallback} from "react";
import { Rnd } from "react-rnd";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import axios from "axios";
import {Stomp, Client} from "@stomp/stompjs";
import * as SockJS from "sockjs-client";
import Profile from "../img/profile.png"
import FolderIcon from '@mui/icons-material/Folder';
import "./css/OneOnOneChat.css";
import styled, {keyframes} from "styled-components";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import Picker from '@emoji-mart/react'  // <-- 추가
import data from '@emoji-mart/data'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Logo from "../img/logo_img.png";

const MessageStyled = styled.p`
`;
const slideDownUserList = keyframes`
  0% {
    width: 0;
    height: 0px;
  }
  100% {
    width: 330px;
    height: 50px;
  }
`;
const slideUpUserList = keyframes`
  0% {
    width: 330px;
    height: 50px;
  }
  100% {
    width: 0px;
  }
`;
// 사용자 목록 패널 스타일
const MenuPanel = styled.div`
  visibility: ${props => props.visible === "visible" ? 'visible' : props.visible === "" ? "" : "hidden"};
  animation: ${props => props.visible === "visible" ? slideDownUserList : props.visible === "" ? slideUpUserList : "hidden"} 0.25s ease-in-out;
  position: absolute;
  top: 95%;
  left: 10px; // 수정된 부분
  z-index: 1;
  width: ${props => props.visible ? '330px' : '0px'}; // 기존 속성
  height: ${props => props.visible ? '50px' : '0px'}; // 기존 속성
  overflow-y: hidden;
  overflow-x: hidden;
  transition: all 0.25s ease-in-out;
  border-radius: 4px;
  background: rgba(130, 130, 130, 0.7);
`;

const OneOnOneChatDrag = React.memo(({show, onClose, logoutApiCate, oneOnOneUserId, oneOnOneUserNickName, friendMax, isMinimize}) => {
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
        const [isClosed, setIsClosed] = useState(false);
        const [isChatDiv, setIsChatDiv] = useState(false);

        //메뉴창 비활성화 상태 변수
        const [menuDiv, setMenuDiv] = useState(false);
        const [menuDiv2, setMenuDiv2] = useState(false);

        const [isChatReadOnly, setIsChatReadOnly] = useState(false);

        const [messages, setMessages] = useState([]);
        //전송 메세지를 담는 상태 변수
        const [sendMessage, setSendMessage] = useState('');
        const [selectedFiles, setSelectedFiles] = useState([]);

        const [translate, setTranslate] = useState(false);
        const [showEmojiPicker, setShowEmojiPicker] = useState(false);

        const [room, setRoom] = useState({});

        const client = useRef({});

        //다른 유저 닉네임 가져와서 상태 변수에 저장
        const [userNickNameOther, setUserNickNameOther] = useState('');

        //파일 버튼 클릭 시 인풋 파일로 값 전달
        const inputFileRef = useRef(null);
        //인풋창 파일 및 텍스트 타입 전환
        const [inputChange, setInputChange] = useState(false);

        //현재 스크롤바의 위치를 담는 상태 변수
        const [scroll, setScroll] = useState('');
        const scrollRef = useRef(scroll);
        const [isScroll, setIsScroll] = useState('');
        const isScrollRef = useRef(isScroll);
        const [previousScrollbarState, setPreviousScrollbarState] = useState(false);
        const previousScrollbarStateRef = useRef(previousScrollbarState);

        const roomIdRef = useRef(null); // roomId 참조 변수 생성
        const userNickNameRef = useRef(null)
        const userProfileRef = useRef(null);
        const userProfileOtherRef = useRef(null);
        // stompClient를 useState로 관리
        const [stompClient, setStompClient] = useState(null);

        //번역 상태 변수
        const [selectedLanguage, setSelectedLanguage] = useState(" ");
        const selectedLanguageRef = useRef(selectedLanguage);
        const languages = {
            "en": "English",
            "ko": "Korean (한국어)",
            "ja": "Japanese (日本語)",
            "zh-CN": "Chinese Simplified (简体中文)",
            "zh-TW": "Chinese Traditional (中國傳統語言)",
            "vi": "Vietnamese (Tiếng Việt)",
            "id": "Indonesian (bahasa Indonésia)",
            "th": "Thai (ภาษาไทย)",
            "de": "German (das Deutsche)",
            "ru": "Russian (Русский язык)",
            "es": "Spanish (español)",
            "it": "Italian (Italia)",
            "fr": "French (Français)"

        };

        //채팅을 치고 있는지 안 치고 있는지 확인하는 상태 변수
        const [isTyping, setIsTyping] = useState("");
        const [Typing, setTyping] = useState([]);
        const [dots, setDots] = useState('');

        const [size, setSize] = useState({ width: "450px", height: "600px"});
        //rnd
        const [resizing, setResizing] = useState(false);
        const handleResizeStart  = () => {
            // 사이즈 결정
            setResizing(true);
        };
        const handleResizeStop = (e, direction, ref) => {
            // 사이즈 결정
            setSize({ width: ref.style.width, height: ref.style.height });
            setResizing(false); // resizing 상태 업데이트
        };

        useEffect(() => {
            selectedLanguageRef.current = selectedLanguage;
        }, [selectedLanguage]);

        useEffect(() => {
            scrollRef.current = scroll;
        }, [scroll]);
        useEffect(() => {
            previousScrollbarStateRef.current = previousScrollbarState;
        }, [previousScrollbarState]);
        useEffect(() => {
            isScrollRef.current = isScroll;
        }, [isScroll]);
        useEffect(() => {
            if (!inputChange) {
                setSendMessage("");
            }
        }, [inputChange]);
        useEffect(() => {
            if (client !== null) {
                if (isTyping === "y") {
                    sendTypingMessage();
                } else if(isTyping === "n"){
                    removeTypingMessage();
                }
            }
        }, [isTyping]);
        useEffect(() => {
            if (Typing.length != 0) {
                // 타이머 설정
                const timerId = setInterval(() => {
                    // dots의 길이에 따라 다음 상태 설정
                    setDots(dots => dots.length < 3 ? dots + '.' : '');
                }, 800);

                // 컴포넌트가 언마운트되거나 업데이트되기 전에 타이머 제거
                return () => clearInterval(timerId);
            } else {
                setDots("");
            }

        }, [Typing]);
        const getChatMessageFromDB = async () => {
            try {
                const response = await axios.get(`/chatroom/${roomIdRef.current}`, {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                });

                if (response.data && response.data.items) {
                    console.log(response.data.items);
                    // checkRead가 false인 객체만 골라서 해당 속성을 true로 변경
                    const updatedItems = response.data.items.reduce((acc, item) => {
                        if (item.checkRead === false && item.sender != userNickNameRef.current) {
                            acc.push({...item, checkRead: true});
                        } else {
                            acc.push(item);
                        }
                        return acc;
                    }, []);

                    setMessages(() => updatedItems);
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
                roomId: roomIdRef.current,
                friendChat: 'on'
            };
            const socket = new SockJS(`/friendchat`);
            const client = Stomp.over(socket);
            const onConnect = (frame) => {
                setIsChatReadOnly(true);
                getChatMessageFromDB();
                client.subscribe("/frdSub/" + roomIdRef.current, async (messageOutput) => {
                    const responseData = JSON.parse(messageOutput.body);// 이 부분 추가
                    if(responseData.msg === "updated") {
                        const updatedMessages = responseData.updatedMsgList;
                        console.log("업데이트된 메시지 리스트")
                        console.log(updatedMessages);
                        setMessages(prevMessages => prevMessages.map(msg => {
                            const updateMsg = updatedMessages.find(uMsg => uMsg.id === msg.id);
                            return updateMsg ? updateMsg : msg;
                        }));
                    } else {
                        if (responseData.sender !== userNickNameRef.current && selectedLanguageRef.current != " ") {
                            const translatedText = await detectAndTranslate(responseData.message);
                            if (translatedText) {
                                responseData.translatedMessage = translatedText;
                            }
                        }
                        showMessageOutput(responseData);
                    }
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
                setSelectedLanguage(" ");
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

//--------------번역----------------------
        const detectAndTranslate = async (text) => {

            console.log(text);
            console.log("선택된 언어 제발요");
            console.log(selectedLanguage);
            const targetLanguage = selectedLanguageRef.current;
            console.log(targetLanguage);

            try {
                const detectResponse = await axios.post("/language/detect", {query: text}, {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                });

                console.log(detectResponse);
                console.log(detectResponse.data);

                console.log("여기에 문제가 있을거같긴해 나도. 이게 제일 못미더워");

                if (detectResponse.data && detectResponse.data.langCode) {
                    const detectedLanguage = detectResponse.data.langCode;

                    const translateResponse = await axios.post("/language/translate", {
                        text: text,
                        sourceLanguage: detectedLanguage,
                        targetLanguage: targetLanguage
                    }, {
                        headers: {
                            Authorization: `${localStorage.getItem('Authorization')}`
                        }
                    });

                    console.log("번역해주세여~~~~");
                    console.log(translateResponse);
                    console.log(translateResponse.data.message.result.translatedText)

                    if (translateResponse.data && translateResponse.data.message.result.translatedText) {
                        return translateResponse.data.message.result.translatedText;
                    } else {
                        console.error("Error translating text");
                        return null;
                    }

                } else {
                    console.error("Error detecting language");
                    return null;
                }

            } catch (error) {
                console.error("Error in detectAndTranslate:", error);
                return null;
            }
        };

        const handleLanguageChange = (e) => {
            setSelectedLanguage(e.target.value);
            console.log("언어선택 했어요. 진짜로 했어요");
            console.log(e.target.value);
        };
//--------------번역----------------------

        //채팅창 업데이트
        const updateReads = async () => {
            try {
                const response = await axios.put(`/chatroom/${roomIdRef.current}`, null, {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                });
                console.log(response.data.items);
                console.log("안읽은거 읽음처리 됐냐???")
                if (response.data && response.data.items) {
                    const updatedMessages = response.data.items;
                    setMessages(prevMessages => prevMessages.map(msg => {
                        const updateMsg = updatedMessages.find(uMsg => uMsg.id == msg.id);
                        return updateMsg ? updateMsg : msg;
                    }));
                }
            } catch (e) {
                console.log(e);
            }
        }



//--------------파일 버튼 클릭 후 파일 첨부 시에 파일 명 인풋창에 표시----------------------
        const handleFileChange = (e) => {
            setSelectedFiles(e.target.files);

            // 파일 이름 및 경로를 저장하는 로직을 추가
            const files = e.target.files;
            if (files && files.length > 0) {
                const fileNames = Array.from(files).map(file => file.name).join(', ');
                setSendMessage(fileNames);
            }
        };
//--------------파일 버튼 클릭 후 파일 첨부 시에 파일 명 인풋창에 표시----------------------

//--------------텍스트 채팅 시 입력 메시지 보여주기----------------------
        const handleMessageChange = (e) => {
            if (e.target.value.trim() !== '') {
                setIsTyping("y");
            } else {
                setIsTyping("n");
            }
            setSendMessage(e.target.value);
        };
//--------------텍스트 채팅 시 입력 메시지 보여주기----------------------

//--------------인풋창 클릭 시 파일에서 일반 텍스트 채팅으로 전환----------------------
        const handleInputChange = (e) => {
            setInputChange(false);
        };
//--------------인풋창 클릭 시 파일에서 일반 텍스트 채팅으로 전환----------------------

//--------------업로드 파일----------------------
        const uploadFiles = () => {
            if (!selectedFiles || selectedFiles.length === 0) return;

            // 각 파일을 순회하며 업로드합니다.
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];

                const formData = new FormData();
                formData.append("file", file);
                formData.append("roomId", roomIdRef.current);

                axios.post('/chatroom/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                    .then((response) => {
                        const data = response.data;
                        console.log(data);
                        console.log("---");
                        const chatMessage = {
                            "roomId": roomIdRef.current,
                            "message": "File upload",
                            "s3DataUrl": data.s3DataUrl,
                            "fileName": file.name,
                            "fileDir": data.fileDir
                        };
                        // 여기서 stompClient.send를 사용하여 메시지를 전송합니다.
                        stompClient.send(
                            "/frdPub/friendchat",
                            {},
                            JSON.stringify(chatMessage)
                        );
                    })
                    .catch((error) => {
                        alert(error);
                    });
                setSendMessage("");
            }
        };
//--------------업로드 파일----------------------

//--------------파일 버튼 클릭 시 동작----------------------
        const handleFileButtonClick = () => {
            setSendMessage("");
            setInputChange(true);
            inputFileRef.current.click();
        };
//--------------파일 버튼 클릭 시 동작----------------------

//--------------다운로드 파일----------------------
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
//--------------다운로드 파일----------------------

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

//--------------채팅 창 오픈----------------------
        useEffect(() => {
            if (!show) {
                setSize({ width: "450px", height: "600px"});
                setMenuDiv(false);
                setMenuDiv2(false);
                setUserNickNameOther("");
                disconnect();
                setIsClosed(false);
            } else {
                if (userNickNameOther == "") {
                    setUserNickNameOther(oneOnOneUserNickName);
                }
                connect();
            }
            return () => {
                console.log(client.current);
                if (client.current && client.current.disconnect) {
                    client.current.deactivate();
                }
            };
        }, [show]);
//--------------채팅 창 오픈----------------------

//--------------메세지 추가 될 때마다 현재 위치 구해서 스크롤바 내리기----------------------
        useEffect(() => {
            const scrollElement = document.querySelector('.EnterRoomChat_content_2');

            if (scrollElement) {
                const hasScrollbar = scrollElement.scrollHeight > scrollElement.clientHeight;

                if (!previousScrollbarStateRef.current && hasScrollbar) {
                    scrollElement.scrollTop = scrollElement.scrollHeight;
                } else if (isScrollRef.current) {
                    scrollElement.scrollTop = scrollElement.scrollHeight;
                } else if (!isScrollRef.current) {
                }

                // 스크롤바 상태 업데이트
                setPreviousScrollbarState(hasScrollbar);
            }
        }, [messages]);
//--------------메세지 추가 될 때마다 현재 위치 구해서 스크롤바 내리기----------------------


//--------------창 위치 조절-----------------------
        const trackPos = (data) => {
            setPosition({x: data.x, y: data.y});
        };
//--------------창 위치 조절-----------------------

//--------------메세지 배열에 추가----------------------
        const showMessageOutput = (messageOutput) => {
            if (messageOutput.message === 'typing...') {
                setTyping((prevMessages) => [...prevMessages, messageOutput.sender + " typing "]);
            } else if (messageOutput.message === 'removeTyping') {
                setTyping(prevList => prevList.filter(item => !item.includes(messageOutput.sender)));
                setDots("");
            } else {
                setTyping(prevList => prevList.filter(item => !item.includes(messageOutput.sender)));
                setDots("");
                setIsTyping("f");
                setMessages((prevMessages) => [...prevMessages, messageOutput]);
            }
        };
//--------------메세지 배열에 추가----------------------


//--------------채팅창 최소화 -----------------------
        const handleMinimizeClick = () => {
            setMenuDiv(false);
            setMenuDiv2(false);
            isMinimize(!false);
        };
//--------------채팅창 최소화 -----------------------

//--------------채팅창 닫기 -----------------------
        const handleCloseClick = () => {
            setIsClosed(true);
            setPosition(initialPosition);
            if (onClose) {
                onClose();
            }
        };

        if (!show || isClosed) {
            return null;
        }
//--------------채팅창 닫기 -----------------------


//--------------메뉴 오픈-----------------------
        const handleMenuOpen = () => {
            setMenuDiv((prevIsUserListVisible) => !prevIsUserListVisible);
            setMenuDiv2(true);
        };
//--------------메뉴 오픈-----------------------

        //입력중...메시지 띄우기 아아그럼 이건 컴파일 문제다
        const sendTypingMessage = () => {
            // 메시지 전송 처리를 여기서 수행
            const message = {
                roomId: roomIdRef.current,
                message: "typing..."
            };

            stompClient.send(
                "/frdPub/friendchat",
                {},
                JSON.stringify(message)
            );
        }
        //백스페이스로 입력값을 지웠을 때 입력중...없애기
        const removeTypingMessage = () => {
            // 메시지 전송 처리를 여기서 수행
            const message = {
                roomId: roomIdRef.current,
                message: "removeTyping"
            };

            stompClient.send(
                "/frdPub/friendchat",
                {},
                JSON.stringify(message)
            );
        }

//--------------메시지 전송 -----------------------
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
//--------------메시지 전송 -----------------------

//--------------스크롤 바 -----------------------
        const isScrollbarAtBottom = (element) => {
            // 현재 스크롤 위치 + 클라이언트 높이가 스크롤 영역의 전체 높이와 동일한지 확인
            const scrollThreshold = 199; // 스크롤 바가 바닥에 있는 것으로 판단할 수 있는 임계 값
            return element.scrollHeight - element.scrollTop - element.clientHeight <= scrollThreshold;

        };
        //현재스크롤바 위치 구하기
        const handleScroll = (event) => {
            const element = event.target;
            setScroll(element.scrollTop);
        };
//--------------스크롤 바 -----------------------
        return (
            <>
                {!isClosed && (
                    <>
                        <Rnd
                            size={size}
                            minWidth={450}
                            minHeight={600}
                            maxWidth={600}
                            maxHeight={750}
                            disabled={!friendMax}
                            onResizeStop={handleResizeStop}
                            onResizeStart={handleResizeStart}
                            default={{ x: position.x, y: position.y }}
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
                            style={{
                                borderRadius: "15px",
                                zIndex: "3",
                                position: "fixed",
                                left: position.x,
                                top: position.y,
                                display: !friendMax ? "none" : "block",
                                transition: resizing ? 'none' : 'width 0.25s ease-in-out, height 0.25s ease-in-out'
                            }}
                            dragHandleClassName="headerChat"
                        >
                            <div
                                className="box"
                                style={{
                                    position: !friendMax ? 'absolute' : 'fixed',
                                    display: !friendMax ? 'none' : 'block',
                                    top: '0',
                                    cursor: 'auto',
                                    color: 'black',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '15px',
                                    borderTopLeftRadius: '15px',
                                    borderBottomLeftRadius: '15px',
                                    padding: '0px',
                                    margin: 'auto',
                                    userSelect: 'none',
                                    zIndex: '3',
                                    transition: 'height 0.25s ease-in-out'
                                }}
                            >
                                <div className={"headerChat"}>
                                    <div className={"btnDiv_create"}>
                                        <img
                                            className={"logo_img"}
                                            src={Logo}
                                        ></img>
                                    </div>
                                    <div className={"title_cate"}>
                                        {userNickNameOther}

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
                                            <div className={"EnterRoomChat_content_one"}>

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
                                                                        {message.s3DataUrl && (
                                                                            <div className={"down_div"}>
                                                                                {message.fileName.match(/\.(jpg|jpeg|png|gif)$/i)
                                                                                    ? <img src={message.s3DataUrl}
                                                                                           alt="uploaded"
                                                                                           className={"message_img"}/>
                                                                                    : message.fileName.match(/\.(mp4|webm|ogg)$/i)
                                                                                        ? <video src={message.s3DataUrl}
                                                                                                 controls
                                                                                                 className={"message_img"}/> // 동영상 렌더링
                                                                                        : <div className={"message_other"}>
                                                                                            <span
                                                                                                className={"message_other_text"}>
                                                                                                     {message.fileName}
                                                                                            </span>
                                                                                        </div> // 파일 이름 렌더링
                                                                                }
                                                                                <Button
                                                                                    onClick={() => downloadFile(message.fileName, message.fileDir)}
                                                                                    className={message.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? "downBtn" : message.fileName.match(/\.(mp4|webm|ogg)$/i) ? "downBtn" : "downBtn2"}
                                                                                >
                                                                                    <FileDownloadIcon/>
                                                                                </Button> {/* 다운로드 버튼 */}
                                                                            </div>
                                                                        )}
                                                                        <span
                                                                            className="content_user">{message.message}</span>
                                                                        <span
                                                                            className="message-regdate">{message.createdAt}&nbsp;&nbsp;&nbsp;{message.checkRead ? (<div className={"on"}></div>) : (<div className={"off"}></div>)}</span>
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
                                                                        {message.s3DataUrl && (
                                                                            <div className={"down_div"}>
                                                                                {message.fileName.match(/\.(jpg|jpeg|png|gif)$/i)
                                                                                    ? <img src={message.s3DataUrl}
                                                                                           alt="uploaded"
                                                                                           className={"message_img2"}/>
                                                                                    : message.fileName.match(/\.(mp4|webm|ogg)$/i)
                                                                                        ? <video src={message.s3DataUrl}
                                                                                                 controls
                                                                                                 className={"message_img2"}/> // 동영상 렌더링
                                                                                        : <div className={"message_other2"}>
                                                                                            <span
                                                                                                className={"message_other_text2"}>
                                                                                                     {message.fileName}
                                                                                            </span>
                                                                                        </div> // 파일 이름 렌더링
                                                                                }
                                                                                <Button
                                                                                    onClick={() => downloadFile(message.fileName, message.fileDir)}
                                                                                    className={message.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? "downBtn_other" : message.fileName.match(/\.(mp4|webm|ogg)$/i) ? "downBtn_other" : "downBtn_other2"}
                                                                                >
                                                                                    <FileDownloadIcon/>
                                                                                </Button> {/* 다운로드 버튼 */}
                                                                            </div>
                                                                        )}
                                                                        {message.translatedMessage ?
                                                                            <span
                                                                                className="content_other_trans"
                                                                            >(translate) {message.translatedMessage}</span>
                                                                            :
                                                                            <>
                                                                            </>
                                                                        }
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
                                                <div className="EnterRoomChat_content_typing">
                                                    {Typing.length == 0 ? Typing[0] : Typing[Typing.length - 1]}{dots}
                                                </div>
                                            </div>
                                            <div className={"EnterRoomChat_input_one"}>
                                                <form className={"EnterRoomChat_input_form_one"}
                                                      onSubmit={handleSendMessage}>
                                                    <MenuPanel
                                                        visible={menuDiv ? "visible" : menuDiv2 ? "" : "hidden"}
                                                    >
                                                        <div className={"menu_div"}>
                                                            <div className={"file"}>
                                                                <Button
                                                                    className={"menu_btn"}
                                                                    type="button"
                                                                    onClick={handleFileButtonClick}
                                                                >
                                                                    <FolderIcon style={{fontSize : 'small'}}/>
                                                                </Button>
                                                            </div>
                                                            <div className={"trans"}>
                                                                <Select className={"trans_select"}
                                                                        onChange={handleLanguageChange}
                                                                        value={selectedLanguage}
                                                                >
                                                                    <MenuItem className={"trans_li_select"} value={" "}>Not
                                                                        translated</MenuItem>
                                                                    {Object.entries(languages).map(([code, name]) => (
                                                                        <MenuItem className={"trans_li_select"} key={code}
                                                                                  value={code}>{name}</MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </MenuPanel>
                                                    <div className={"input_menu"}>
                                                        <input
                                                            placeholder={!isChatReadOnly ? "Connecting, please wait" : "Please enter your message"}
                                                            type="text"
                                                            className={inputChange ? "inputchat_one2" : "inputchat_one"}
                                                            required
                                                            value={sendMessage}
                                                            onClick={handleInputChange}
                                                            readOnly={!isChatReadOnly} // isChatDiv가 false일 때 readOnly를 true로 변경
                                                            onChange={handleMessageChange}
                                                        />
                                                        <input
                                                            type="file"
                                                            id="file"
                                                            ref={inputFileRef}
                                                            onChange={handleFileChange}
                                                            multiple
                                                            style={{display: 'none'}}
                                                        />
                                                        <Button
                                                            className={menuDiv ? "add_now" : "add"}
                                                            type="button"
                                                            onClick={handleMenuOpen}
                                                        >{menuDiv ? "-" : "+"}
                                                        </Button>
                                                    </div>

                                                    {inputChange ? (
                                                        <Button
                                                            className={"btnSend2"}
                                                            type="button"
                                                            onClick={uploadFiles}
                                                        >UPLOAD
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            className={"btnSend"}
                                                            type="submit"
                                                            onClick={handleSendMessage}
                                                        >SEND
                                                        </Button>
                                                    )}


                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* 밑으로 컨텐츠 들어갈 부분*/}
                            {/*<div style={{color:'white', fontSize: '22px'}}>x: {position.x.toFixed(0)}, y: {position.y.toFixed(0)}</div>*/}
                            {/*</div>*/}
                        </Rnd>
                    </>
                )}
            </>
        );
    })
;

export default OneOnOneChatDrag;