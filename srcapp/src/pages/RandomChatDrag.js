import React, {useEffect, useRef, useState, useCallback} from "react";
import {Rnd} from "react-rnd";
import Logo from "../img/logo_img.png";
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FolderIcon from '@mui/icons-material/Folder';
import MenuItem from '@mui/material/MenuItem';
import {Stomp, Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./css/RandomChat.css";
import styled, {keyframes} from "styled-components";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {useDispatch, useSelector} from "react-redux";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
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
    height: 50px
  }
  100% {
    width: 0px;
  }
`;
// 메뉴 패널 스타일
const MenuPanel = styled.div`
  visibility: ${props => props.visible === "visible" ? 'visible' : props.visible === "" ? "" : "hidden"};
  animation: ${props => props.visible === "visible" ? slideDownUserList : props.visible === "" ? slideUpUserList : "hidden"} 0.25s ease-in-out;
  position: absolute;
  top: 95%;
  left: 10px; // 수정된 부분
  z-index: 9999;
  width: ${props => props.visible ? '330px' : '0px'}; // 기존 속성
  height: ${props => props.visible ? '50px' : '0px'}; // 기존 속성
  overflow-y: hidden;
  overflow-x: hidden;
  transition: all 0.25s ease-in-out;
  border-radius: 4px;
  background: rgba(30, 30, 30, 1);
`;

const RandomChatDrag = React.memo(({randomMax, show, onClose, logoutApiCate, isMinimize}) => {
        const dispatch = useDispatch();
        const randomDragPosition = useSelector((state) => state.chatminimum.position);
        const [isChatDiv, setIsChatDiv] = useState(false);

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
                dispatch({type: "SET_RANDOMDRAG_POSITION", payload: newPosition});
            };

            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }, []);

        const initialPosition = {
            x: (windowSize.width / 2) - (450 / 2), // 450은 Draggable 컴포넌트의 너비
            y: (windowSize.height / 2) - (250 / 2), // 200은 Draggable 컴포넌트의 높이
        };
        const [showEmojiPicker, setShowEmojiPicker] = useState(false);

        const [isClosed, setIsClosed] = useState(false);

//랜덤 채팅 입장 후
//인풋창 비활성화 상태 변수
        const [isChatReadOnly, setIsChatReadOnly] = useState(false);
        const [messages, setMessages] = useState([]);
        const [sendMessage, setSendMessage] = useState('');
        //랜덤채팅 시작 시 텍스트
        const [randomStartText, setRandomStartText] = useState('start a random chat');
        const {randomRoomId} = useParams();
        const [room, setRoom] = useState({});

        const client = useRef({});
        const LoginUserNickName = useRef({});
        const otherUserId = useRef(null);

        //현재 스크롤바의 위치를 담는 상태 변수
        const [scroll, setScroll] = useState('');
        const scrollRef = useRef(scroll);
        const [isScroll, setIsScroll] = useState('');
        const isScrollRef = useRef(isScroll);
        const [previousScrollbarState, setPreviousScrollbarState] = useState(false);
        const previousScrollbarStateRef = useRef(previousScrollbarState);

        //메뉴창 비활성화 상태 변수
        const [menuDiv, setMenuDiv] = useState(false);
        const [menuDiv2, setMenuDiv2] = useState(false);
        //파일 버튼 클릭 시 인풋 파일로 값 전달
        const inputFileRef = useRef(null);
        //인풋창 파일 및 텍스트 타입 전환
        const [inputChange, setInputChange] = useState(false);
        //파일 담는 상태 변수
        const [files, setFiles] = useState([]);

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

        const [size, setSize] = useState({width: "450px", height: "250px"});
        const [resizing, setResizing] = useState(false);

        const [likes, setLikes] = useState({});  // likes라는 state 생성
        const handleResizeStart = () => {
            // 사이즈 결정
            setResizing(true);
        };
        const handleResizeStop = (e, direction, ref) => {
            // 사이즈 결정
            setSize({width: ref.style.width, height: ref.style.height});
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
                } else if (isTyping === "n") {
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

//--------------드래그 창 보임/숨김-----------------------
        useEffect(() => {
            console.log(show + " show")
            if (!show) {
                setMenuDiv(false);
                setMenuDiv2(false);
                setIsChatDiv(false);
                setIsClosed(false);
            }
        }, [show]);

//--------------드래그 창 보임/숨김-----------------------

//--------------메뉴 오픈-----------------------
        const handleMenuOpen = () => {
            setMenuDiv((prevIsUserListVisible) => !prevIsUserListVisible);
            setMenuDiv2(true);
        };
//--------------메뉴 오픈-----------------------

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

        const connect = () => {
            setMessages([]);
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

        const leaveRandom = async (retry = true) => {
            console.log("leaveRandom 실행");
            try {
                const response = await fetch("/randomRoom/leave", {
                    method: 'DELETE',
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': localStorage.getItem('Authorization'),
                        'userName': localStorage.getItem('userName'),
                    },
                });

                const accessToken = response.headers.get('Authorization');
                if (accessToken != null) {
                    localStorage.setItem('Authorization', accessToken);
                }
                if (response.headers.get('refresh') != null) {
                    //로그아웃 처리
                    alert("로그아웃 leaveRandom");
                    return;
                }

                if (!response.ok) {
                    if (retry) {
                        await leaveRandom(false);
                    }
                    return console.error(`Error: ${response.status}`)
                }

                const result = await response.json();
                if (!result) {
                    if (retry) {
                        await leaveRandom(false);
                    }
                    return console.error(result.errorMessage);
                }
                console.log(`leaved random room name: ${result}`);
                if (result.status == 'success') {
                    console.log("방 삭제 완료");
                } else {
                    console.log("방 삭제 실패");
                }

                return result;
                // navigate(`/random/${result.randomRoomId}`, {state: {room: result}});

            } catch (error) {
                console.log(error);
                if (retry) {
                    await leaveRandom(false);
                }
                return;
            }
        };
        const disconnect = () => {
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@")
            if (client.current && typeof client.current.disconnect === "function") {
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!")
                leaveEvent();
                client.current.disconnect(() => {
                    console.log("33333333333333333333333333")
                    leaveRandom();
                    setMessages([]);
                    setSelectedLanguage(" ");
                    setIsChatReadOnly(false);
                    console.log("websocket disconnected");
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

        async function onReceived(payload) {
            let payloadData = JSON.parse(payload.body);
            if (payloadData.type == "LEAVE") {
                if (payloadData.sender != LoginUserNickName.current) {
                    if (otherUserId.current != null) {
                        setRandomStartText("A stranger has left");
                    }
                }
                setIsChatDiv(false);
            } else if (payloadData.type == "CHAT") {
                if (payloadData.sender !== LoginUserNickName.current) {
                    otherUserId.current = payloadData.userId;
                }
            }

            if (payloadData.sender !== LoginUserNickName.current && selectedLanguageRef.current != " ") {
                console.log(payloadData);
                const translatedText = await detectAndTranslate(payloadData.content);
                if (translatedText) {
                    payloadData.translatedMessage = translatedText;
                }
            }
            if (payloadData.content === 'typing...') {
                setTyping((prevMessages) => [...prevMessages, payloadData.sender + " typing "]);
            } else if (payloadData.content === 'removeTyping') {
                setTyping(prevList => prevList.filter(item => !item.includes(payloadData.sender)));
                setDots("");
            } else {
                if(payloadData.type == "LIKE"){
                    setLikes(prevLikes => ({
                        ...prevLikes,
                        [payloadData.randomChatId]: !prevLikes[payloadData.randomChatId],
                    }));
                }else {
                    setTyping(prevList => prevList.filter(item => !item.includes(payloadData.sender)));
                    setDots("");
                    setIsTyping("f");
                    setMessages((prev) => [...prev, payloadData]);
                }
            }
        }

        function joinEvent() {
            const headers = {
                Authorization: localStorage.getItem("Authorization"),
            };
            const joinMessage = {
                type: "ENTER",
                randomRoomId: room.randomRoomId,
            };
            client.current.send(`/randomPub/randomChat/${randomRoomId}/enter`, headers, JSON.stringify(joinMessage));
        }

        function leaveEvent() {
            const headers = {
                Authorization: localStorage.getItem("Authorization"),
            };
            const leaveMessage = {
                type: "LEAVE",
                randomRoomId: room.randomRoomId,
            };
            client.current.send(`/randomPub/randomChat/${randomRoomId}/leave`, headers, JSON.stringify(leaveMessage));
            otherUserId.current = null;
        }

        const sendChatMessage = (msgText) => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const second = now.getSeconds();

            if (client.current) {
                const headers = {
                    Authorization: localStorage.getItem("Authorization"),
                };
                const messageData = {
                    type: "CHAT",
                    content: msgText,
                    time: `${hour}:${minute}:${second}`,
                    randomRoomId: room.randomRoomId,
                };
                console.log("Sending message: ", JSON.stringify(messageData));
                client.current.send(`/randomPub/randomChat/${room.randomRoomId}`, headers, JSON.stringify(messageData));
            }
        };

        useEffect(() => {
            if (isChatDiv) {
                setSize({width: "450px", height: "600px"});
                console.log("랜덤 채팅방 정보");
                console.log(room);
                setMenuDiv(false);
                setMenuDiv2(false);
                setSendMessage('');
                setRandomStartText("start a random chat");
                connect();
            } else {
                setSize({width: "450px", height: "250px"});
                disconnect();
            }
        }, [isChatDiv]);
        const handleMinimizeClick = () => {
            setMenuDiv(false);
            setMenuDiv2(false);
            isMinimize(!false);
        };

        const handleCloseClick = () => {
            console.log("-=-=-")
            disconnect();
            setIsChatDiv(false);
            dispatch({type: "SET_RANDOMDRAG_POSITION", payload: initialPosition});
            if (onClose) {
                console.log("-=-45233=-")
                setIsClosed(true);
                onClose();
                console.log("-=-=1-")
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
                    const response = await fetch("/randomRoom/enter", {
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
                    console.log(`Created random room name: ${result}`);
                    console.log(`Created random room name: ${result.randomRoomDTO}`);
                    setRoom(result.randomRoomDTO);
                    LoginUserNickName.current = result.userNickName;
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
            setRandomStartText("start a random chat");
            setIsChatDiv(false);

        };
        const friendAddClick = (otherId) => {
            const requestFrdAxios = async () => {
                try {
                    const response = await axios.post('/friends/request', {userId: otherId},
                        {
                            headers: {
                                Authorization: `${localStorage.getItem('Authorization')}`
                            }
                        });
                    console.log(response);
                    console.log(response.data.item.msg)
                    if (response.data.item.msg === "request ok") {
                        alert("친구 신청이 완료되었습니다")
                    } else if (response.data.item.msg === "already frds") {
                        alert("이미 친구이거나 응답 대기중입니다.")
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            requestFrdAxios();
        };

        //입력중...메시지 띄우기
        const sendTypingMessage = () => {
            // 메시지 전송 처리를 여기서 수행
            const messageData = {
                type: "CHAT",
                content: "typing...",
                randomRoomId: room.randomRoomId,
            };
            client.current.send(`/randomPub/randomChat/${room.randomRoomId}`, {}, JSON.stringify(messageData));
        }
        //백스페이스로 입력값을 지웠을 때 입력중...없애기
        const removeTypingMessage = () => {
            const messageData = {
                type: "CHAT",
                content: "removeTyping",
                randomRoomId: room.randomRoomId,
            };
            client.current.send(`/randomPub/randomChat/${room.randomRoomId}`, {}, JSON.stringify(messageData));
        }

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
//--------------인풋창 클릭 시 파일에서 일반 텍스트 채팅으로 전환---------------------
        //좋아요
        const likeOn = (data) => {
            console.log(data)
            // setLikes({
            //     ...likes,
            //     [data]: !likes[data],  // 기존에 좋아요가 눌러져 있었다면 false로, 아니라면 true로 설정
            // });
            if (client.current) {
                const headers = {
                    Authorization: localStorage.getItem("Authorization"),
                };
                const messageData = {
                    type: "LIKE",
                    randomChatId: data,
                    randomRoomId: room.randomRoomId,
                };
                client.current.send(`/randomPub/randomChat/${room.randomRoomId}/like`, headers, JSON.stringify(messageData));
            }
        };

//--------------파일 버튼 클릭 시 동작----------------------
        const handleFileButtonClick = () => {
            setSendMessage("");
            setInputChange(true);
            inputFileRef.current.click();
        };
//--------------파일 버튼 클릭 시 동작----------------------
//--------------파일 버튼 클릭 후 파일 첨부 시에 파일 명 인풋창에 표시----------------------
        const handleFileChange = (e) => {
            setFiles(e.target.files);

            // 파일 이름 및 경로를 저장하는 로직을 추가
            const files = e.target.files;
            if (files && files.length > 0) {
                const fileNames = Array.from(files).map(file => file.name).join(', ');
                setSendMessage(fileNames);
            }
        };
//--------------파일 버튼 클릭 후 파일 첨부 시에 파일 명 인풋창에 표시----------------------
//--------------파일 폼 데이터----------------------
        const createFormData = (filess, roomIdd) => {
            const formData = new FormData();

            formData.append("file", filess);

            formData.append("roomId", roomIdd);
            return formData;
        };
//--------------파일 폼 데이터----------------------
//--------------업로드 파일----------------------
        const uploadFiles = async () => {
            if (files.length === 0) {
                console.log("파일을 선택해주세요.");
                return;
            }

            try {
                // 각 파일을 순회하며 업로드합니다.
                console.log("1");
                for (let i = 0; i < files.length; i++) {
                    console.log("2");
                    const file = files[i];
                    console.log(file);
                    const formData = createFormData(file, room.randomRoomId);
                    const config = {headers: {"Content-Type": "multipart/form-data"}};

                    axios.post("/randomFile/upload", formData, config)
                        .then((response) => {
                            const data = response.data;
                            console.log(data[0]);
                            console.log(data.randomFileName);
                            console.log(data.randomFileOrigin);
                            const now = new Date();
                            const hour = now.getHours();
                            const minute = now.getMinutes();
                            const second = now.getSeconds();

                            const chatMessage = {
                                type: "CHAT",
                                content: "File upload",
                                time: `${hour}:${minute}:${second}`,
                                randomRoomId: room.randomRoomId,
                                sender: client.current.userName,
                                fileName: data[0].randomFileName,
                                fileOrigin: data[0].randomFileOrigin,
                            };
                            // 여기서 stompClient.send를 사용하여 메시지를 전송합니다.
                            client.current.send(`/randomPub/randomChat/${room.randomRoomId}`, {}, JSON.stringify(chatMessage));
                        })
                        .catch((error) => {
                            alert(error);
                        });

                    setSendMessage("");
                }

            } catch (error) {
                console.log("파일 업로드 실패:", error);
            }
        };
//--------------업로드 파일----------------------
//--------------다운로드 파일----------------------
        const downloadFile = async (fileName, fileDir) => {
            try {
                const response = await axios.get(`/randomFile/download/${fileName}`, {
                    params: {fileDir},
                    responseType: 'blob',
                });

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
            } catch (error) {
                console.error("파일 다운로드 실패:", error);
            }
        };
//--------------다운로드 파일----------------------
//--이모지

        const toggleEmojiPicker = () => {
            setShowEmojiPicker(!showEmojiPicker);
        }

        const addEmoji = (e) => {
            let emoji = e.native;
            setSendMessage(prevMessage => prevMessage + emoji);
        }
        return (
            <>
                {!isClosed && (
                    <>
                        <Rnd
                            size={size}
                            minWidth={450}
                            minHeight={!isChatDiv ? 250 : 600}
                            maxWidth={600}
                            maxHeight={750}
                            disabled={!randomMax}
                            onResizeStop={handleResizeStop}
                            onResizeStart={handleResizeStart}
                            default={{x: randomDragPosition.x, y: randomDragPosition.y}}
                            onDragStop={(e, d) => {
                                dispatch({type: "SET_RANDOMDRAG_POSITION", payload: {x: d.x, y: d.y}});
                            }}
                            enableResizing={{
                                top: false,
                                right: isChatDiv ? true : false,
                                bottom: isChatDiv ? true : false,
                                left: false,
                                topRight: isChatDiv ? true : false,
                                bottomRight: isChatDiv ? true : false,
                                bottomLeft: false,
                                topLeft: false,
                            }}
                            style={{
                                borderRadius: "15px",
                                zIndex: "3",
                                position: "fixed",
                                visibility: !randomMax ? "hidden" : "visible",
                                opacity: !randomMax ? "0" : "1",
                                transition: resizing ? 'none' : 'opacity 0.25s ease-in-out, width 0.25s ease-in-out, height 0.25s ease-in-out'
                            }}
                            dragHandleClassName="headerChat"
                            bounds="window"
                            // bounds="window"
                        >
                            <div
                                style={{
                                    display: !randomMax ? 'none' : 'block',
                                    cursor: 'auto',
                                    color: 'black',
                                    width: '100%',
                                    height: isChatDiv ? '100%' : '250px',
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
                                <div className={isChatDiv ? "contentChat_true" : "contentChat"}>
                                    {isChatDiv ? (
                                        <div className={"chatR"}>
                                            <div className={"EnterRoom"}>
                                                <div className={"EnterRoom_2"}>
                                                    <div className={"EnterRoomCate"}>

                                                    </div>
                                                    <div className={"EnterRoomName"}>

                                                    </div>
                                                    <div className={"EnterRoomClose"}>
                                                        {otherUserId.current !== null ? (
                                                            <Button
                                                                className={"userAdd_btn"}
                                                                onClick={() => {
                                                                    friendAddClick(otherUserId.current)
                                                                }}
                                                            >
                                                                <PersonAddIcon style={{fontSize: 'small'}}/>
                                                            </Button>
                                                        ) : (
                                                            <>
                                                            </>
                                                        )}
                                                        <Button
                                                            className={"Close_btn"}
                                                            onClick={exitChatDiv}
                                                        >
                                                            <LogoutIcon style={{fontSize: 'small'}}/>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={"EnterRoomChat"}>
                                                <div className={"EnterRoomChat_2"}>
                                                    <div className={"EnterRoomChat_content"}>
                                                        <div className="EnterRoomChat_content_2" onScroll={handleScroll}>
                                                            {messages.map((message, index) => {
                                                                const isMyMessage = message.sender === LoginUserNickName.current;
                                                                return (
                                                                    <MessageStyled
                                                                        key={message.randomChatId}
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
                                                                                    {/*<img className={"message-chatRandom-profile"}*/}
                                                                                    {/*     src={message.userProfile ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + message.userProfile : Profile}*/}
                                                                                    {/*/>*/}
                                                                                    <span
                                                                                        className="userName">{message.sender}</span>
                                                                                </div>
                                                                                {message.fileName && (
                                                                                    <div className={"down_div"}>
                                                                                        {message.fileOrigin.match(/\.(jpg|jpeg|png|gif)$/i)
                                                                                            ? <img
                                                                                                src={"https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/" + message.fileName}
                                                                                                alt="uploaded"
                                                                                                className={"message_img"}/>
                                                                                            : message.fileOrigin.match(/\.(mp4|webm|ogg)$/i)
                                                                                                ? <video
                                                                                                    src={"https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/" + message.fileName}
                                                                                                    controls
                                                                                                    className={"message_img"}/> // 동영상 렌더링
                                                                                                : <div
                                                                                                    className={"message_other"}>
                                                                                            <span
                                                                                                className={"message_other_text"}>
                                                                                                     {message.fileOrigin}
                                                                                            </span>
                                                                                                </div> // 파일 이름 렌더링
                                                                                        }
                                                                                        <Button
                                                                                            onClick={() => downloadFile(message.fileOrigin, message.fileName)}
                                                                                            className={message.fileOrigin.match(/\.(jpg|jpeg|png|gif)$/i) ? "downBtn" : message.fileOrigin.match(/\.(mp4|webm|ogg)$/i) ? "downBtn" : "downBtn2"}
                                                                                        >
                                                                                            <FileDownloadIcon/>
                                                                                        </Button> {/* 다운로드 버튼 */}
                                                                                    </div>
                                                                                )}
                                                                                <span
                                                                                    className="content_user">{message.content}
                                                                                </span>
                                                                                <span
                                                                                    className="message-regdate">{message.time}</span>
                                                                                {likes[message.randomChatId] ?
                                                                                    (
                                                                                        <FavoriteIcon
                                                                                            className={"like_btn2"}
                                                                                        />
                                                                                    ) : (
                                                                                        <FavoriteBorderIcon
                                                                                            className={"like_btn2 one"}
                                                                                        />
                                                                                    )}
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
                                                                                {message.fileName && (
                                                                                    <div className={"down_div"}>
                                                                                        {message.fileOrigin.match(/\.(jpg|jpeg|png|gif)$/i)
                                                                                            ? <img
                                                                                                src={"https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/" + message.fileName}
                                                                                                alt="uploaded"
                                                                                                className={"message_img2"}/>
                                                                                            : message.fileOrigin.match(/\.(mp4|webm|ogg)$/i)
                                                                                                ? <video
                                                                                                    src={"https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/" + message.fileName}
                                                                                                    controls
                                                                                                    className={"message_img2"}/> // 동영상 렌더링
                                                                                                : <div
                                                                                                    className={"message_other2"}>
                                                                                            <span
                                                                                                className={"message_other_text2"}>
                                                                                                     {message.fileOrigin}
                                                                                            </span>
                                                                                                </div> // 파일 이름 렌더링
                                                                                        }
                                                                                        <Button
                                                                                            onClick={() => downloadFile(message.fileOrigin, message.fileName)}
                                                                                            className={message.fileOrigin.match(/\.(jpg|jpeg|png|gif)$/i) ? "downBtn_other" : message.fileOrigin.match(/\.(mp4|webm|ogg)$/i) ? "downBtn_other" : "downBtn_other2"}
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
                                                                                <span style={{position: 'relative'}}
                                                                                      className="content_other">{message.content}
                                                                                </span>
                                                                                <span
                                                                                    className="message-regdate_other">{message.time}</span>
                                                                                {likes[message.randomChatId] ?
                                                                                    (
                                                                                        <FavoriteIcon
                                                                                            className={"like_btn"}
                                                                                            onClick={() => likeOn(message.randomChatId)}
                                                                                        />
                                                                                    ) : (
                                                                                        <FavoriteBorderIcon
                                                                                            className={"like_btn one"}
                                                                                            onClick={() => likeOn(message.randomChatId)}
                                                                                        />
                                                                                    )}
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
                                                                            <FolderIcon style={{fontSize: 'small'}}/>
                                                                        </Button>
                                                                    </div>
                                                                    <div className={"trans"}>
                                                                        <Select className={"trans_select"}
                                                                                onChange={handleLanguageChange}
                                                                                value={selectedLanguage}
                                                                        >
                                                                            <MenuItem className={"trans_li_select"}
                                                                                      value={" "}>Not translated</MenuItem>
                                                                            {Object.entries(languages).map(([code, name]) => (
                                                                                <MenuItem className={"trans_li_select"}
                                                                                          key={code}
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
                                                                <Button disabled={!isChatReadOnly} className={"emoji"}
                                                                        type="button" onClick={toggleEmojiPicker}>😃</Button>
                                                                {showEmojiPicker && (
                                                                    <Picker data={data} onEmojiSelect={addEmoji}/>
                                                                )}
                                                                <Button
                                                                    disabled={!isChatReadOnly}
                                                                    className={"add"}
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
                                    ) : (
                                        <div className={"selectR"}>
                                            <div className={"random_start"}>
                                                <div className={"random_start_2"}>
                                                    {randomStartText}
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

export default RandomChatDrag;
