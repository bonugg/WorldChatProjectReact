import React, {useEffect, useRef, useState, useCallback} from "react";
import {Rnd} from "react-rnd";

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {Stomp, Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Profile from "../img/profile.png"

import "./css/CateChat.css";
import CateChatListItem from './CateChatListItem';
import styled, {keyframes} from "styled-components";
import axios from "axios";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Logo from "../img/logo_img.png";
import LogoutIcon from "@mui/icons-material/Logout";
import {useDispatch, useSelector} from "react-redux";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const MessageStyled = styled.p`
`;
const slideDownMenu = keyframes`
  0% {
    width: 0;
    height: 0px;
  }
  100% {
    width: 330px;
    height: 50px;
  }
`;
const slideUpMenu = keyframes`
  0% {
    width: 330px;
    height: 50px
  }
  100% {
    width: 0px;
  }
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
const MenuPanel = styled.div`
  visibility: ${props => props.visible === "visible" ? 'visible' : props.visible === "" ? "" : "hidden"};
  animation: ${props => props.visible === "visible" ? slideDownMenu : props.visible === "" ? slideUpMenu : "hidden"} 0.25s ease-in-out;
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
  background: rgba(30, 30, 30, 1);
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
  right: 100%; // 수정된 부분
  z-index: 1;
  width: ${props => props.visible ? '200px' : '0px'};
  max-height: 70%;
  height: ${props => props.height};
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  background-color: rgba(11, 11, 14, 0.8);
  border: 1px solid #222526;
  border-right-width: 0px;
  border-left-width: ${props => props.visible ? '1px' : '0px'};
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

const Drag = React.memo(({show, onClose, logoutApiCate, cateMax, isMinimize}) => {
    const dispatch = useDispatch();
    const cateDragPosition = useSelector((state) => state.chatminimumCate.position);
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
            dispatch({type: "SET_CATEDRAG_POSITION", payload: newPosition});
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

    const [isUserListVisible, setIsUserListVisible] = useState(false);
    const [isUserListVisible2, setIsUserListVisible2] = useState(false);

    const [position, setPosition] = useState(initialPosition);

    const catescroll = useRef();  //특정 DOM을 가리킬 때 사용하는 Hook함수, SecondDiv에 적용
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    //방 생성 클릭 시 실해되는 상태 변수
    const [createRoomId, setCreateRoomId] = useState('');
    const [createRoom, setCreatRoom] = useState(false);
    const [createRoom2, setCreatRoom2] = useState(false);
    const createRoomRef = useRef(null);

    const [isClosed, setIsClosed] = useState(false);

    const userNickNameRef = useRef(null);

    const [roomList, setRoomList] = useState([]);
    const [CateName, setCateName] = useState('Select Category');
    const [CateLoadingText, setCateLoadingText] = useState('No room');
    const [CateRoom, setCateRoom] = useState({});
    const [isChatDiv, setIsChatDiv] = useState(false);
    const [activeButton, setActiveButton] = useState(null);

    //채팅을 치고 있는지 안 치고 있는지 확인하는 상태 변수
    const [isTyping, setIsTyping] = useState("");
    const [Typing, setTyping] = useState([]);
    const [dots, setDots] = useState('');

    //현재 선택중인 카테고리
    const currentCate = useRef(null);
    // stompClient를 useState로 관리합니다.
    const [stompClient, setStompClient] = useState(null);
    //인풋창 비활성화 상태 변수
    const [isChatReadOnly, setIsChatReadOnly] = useState(false);
    //메세지를 담는 상태 변수
    const [messages, setMessages] = useState([]);
    const [userList, setuserList] = useState([]);

    //전송 메세지를 담는 상태 변수
    const [sendMessage, setSendMessage] = useState('');

    //현재 스크롤바의 위치를 담는 상태 변수
    const [scroll, setScroll] = useState('');
    const scrollRef = useRef(scroll);
    const [isScroll, setIsScroll] = useState('');
    const isScrollRef = useRef(isScroll);
    const [previousScrollbarState, setPreviousScrollbarState] = useState(false);
    const previousScrollbarStateRef = useRef(previousScrollbarState);

    const [formValues, setFormValues] = useState({
        cateName: '',
        maxUserCnt: 2,
        interest: ' ',
    });

    //메뉴창 비활성화 상태 변수
    const [menuDiv, setMenuDiv] = useState(false);
    const [menuDiv2, setMenuDiv2] = useState(false);
    //인풋창 파일 및 텍스트 타입 전환
    const [inputChange, setInputChange] = useState(false);
    //파일 버튼 클릭 시 인풋 파일로 값 전달
    const inputFileRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

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
    const [size, setSize] = useState({width: "450px", height: "600px"});
    //rnd
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
        if (stompClient !== null) {
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
    const toggleUserListPanel = () => {
        setIsUserListVisible((prevIsUserListVisible) => !prevIsUserListVisible);
        setIsUserListVisible2(true);
    };

    // 웹소켓 연결 함수
    const connect = () => {

        const tokenCheck = async (retry = true) => {
            try {
                const response = await fetch('/api/v1/user', {
                    method: 'GET',
                    headers: {
                        'Authorization': localStorage.getItem('Authorization'),
                        'userName': localStorage.getItem('userName'),
                    },
                });

                const accessToken = response.headers.get('Authorization');
                if (accessToken != null) {
                    localStorage.setItem('Authorization', accessToken);
                }
                if (response.headers.get('refresh') != null) {
                    logoutApiCate(true);
                    return;
                }
                if (response.ok) {
                    const responseBody = await response.text();
                    const responseBodyObject = JSON.parse(responseBody);
                    userNickNameRef.current = responseBodyObject.user.userNickName;

                } else {
                    if (retry) {
                        await tokenCheck(false);
                    }
                }
            } catch
                (error) {
                if (retry) {
                    await tokenCheck(false);
                }
            }
        };
        tokenCheck();
        setMessages([]);
        setIsChatReadOnly(false);
        const headers = {
            Authorization: localStorage.getItem("Authorization"),
        };
        const socket = new SockJS(`/CateChat`);
        const client = Stomp.over(socket);
        const onConnect = (frame) => {
            setIsChatReadOnly(true);

            client.subscribe("/cateSub/" + CateRoom.cateId, async (messageOutput) => {
                const responseData = JSON.parse(messageOutput.body);
                if (responseData.sender !== userNickNameRef.current && selectedLanguageRef.current != " ") {
                    const translatedText = await detectAndTranslate(responseData.cateChatContent);
                    if (translatedText) {
                        responseData.translatedMessage = translatedText;
                    }
                }

                if (responseData.hasOwnProperty('cateUserList')) {
                    // responseData에 cateUserList가 있는 경우
                    showMessageOutput(responseData.cateChatDTO);
                    showUserListOutput(responseData.cateUserList);
                } else {
                    // responseData에 cateUserList가 없는 경우
                    showMessageOutput(responseData);
                }
            });

            client.send("/catePub/categoryChat/" + CateRoom.cateId + "/addUser", headers, JSON.stringify({
                type: "JOIN",
                cateId: CateRoom.cateId,
            }));

            // 연결된 stompClient 객체를 저장합니다.
            setStompClient(client);
        };

        const onError = (error) => {
            connect();
        };

        client.connect(headers, onConnect, onError);
    };

    // 웹소켓 연결 종료 함수
    const disconnect = () => {
        if (stompClient !== null) {
            const headers = {
                Authorization: localStorage.getItem("Authorization"),
            };
            stompClient.send("/catePub/categoryChat/" + CateRoom.cateId + "/leaveUser", headers, JSON.stringify({
                type: "LEAVE",
                cateId: CateRoom.cateId,
            }));
            stompClient.disconnect();
        }

        setSelectedLanguage(" ");
        setSendMessage('');
        setMessages([]);
        setIsChatReadOnly(false);
        setStompClient(null);
    };

    //--------------번역----------------------
    const detectAndTranslate = async (text) => {
        const targetLanguage = selectedLanguageRef.current;

        try {
            const detectResponse = await axios.post("/language/detect", {query: text}, {
                headers: {
                    Authorization: `${localStorage.getItem('Authorization')}`
                }
            });
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

                if (translateResponse.data && translateResponse.data.message.result.translatedText) {
                    return translateResponse.data.message.result.translatedText;
                } else {
                    return null;
                }

            } else {
                return null;
            }

        } catch (error) {
            console.error("Error in detectAndTranslate:", error);
            return null;
        }
    };

    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
    };
//--------------번역----------------------

    useEffect(() => {
        if (!show) {
            setSize({width: "450px", height: "600px"});
            setIsClosed(false);
            setIsChatDiv(false);
            setActiveButton(null);
        }
    }, [show]);

    useEffect(() => {
        if (isChatDiv) {
            setCreateRoomId('');
            setTyping([]);
            setDots("");
            connect();
        } else {
            disconnect();
        }
    }, [isChatDiv]);

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

    const handleMinimizeClick = () => {
        setMenuDiv(false);
        setMenuDiv2(false);
        setCreatRoom(false);
        setCreatRoom2(false);
        setIsUserListVisible2(false);
        isMinimize(!false);
    };

    const handleCloseClick = () => {
        setMenuDiv(false);
        setMenuDiv2(false);
        setIsUserListVisible(false);
        setIsUserListVisible2(false);
        setCreatRoom(false);
        setCreatRoom2(false);
        setIsChatDiv(false);
        setRoomList([]);
        setCateName("Select Category");
        setIsClosed(true);
        dispatch({type: "SET_CATEDRAG_POSITION", payload: initialPosition});
        disconnect();
        if (onClose) {
            onClose();
        }
    };

    if (!show || isClosed) {
        return null;
    }

    //카테챗 추가 영역
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
                type: "CHAT",
                cateId: CateRoom.cateId,
                cateChatContent: sendMessage,
            };

            stompClient.send(
                `/catePub/categoryChat/${CateRoom.cateId}/sendMessage`,
                {},
                JSON.stringify(message)
            );
            // 메시지 전송 후 인풋 창을 비움
            setSendMessage('');
        }
    };

    //스크롤바 상태
    const showMessageOutput = (messageOutput) => {
        if (messageOutput.cateChatContent === 'typing...') {
            setTyping((prevMessages) => [...prevMessages, messageOutput.sender + " typing "]);
        } else if (messageOutput.cateChatContent === 'removeTyping') {
            setTyping(prevList => prevList.filter(item => !item.includes(messageOutput.sender)));
            setDots("");
        } else {
            if (messageOutput.type == "LIKE") {
                // setLikes(prevLikes => ({
                //     ...prevLikes,
                //     [messageOutput.cateChatId]: !prevLikes[messageOutput.cateChatId],
                // }));
                setLikes(prev => {
                    const prevLikes = prev[messageOutput.cateChatId] || [];

                    if (prevLikes.includes(messageOutput.sender)) { // 이미 좋아요를 눌렀다면
                        return {
                            ...prev,
                            [messageOutput.cateChatId]: prevLikes.filter(id => id !== messageOutput.sender)
                        }; // 해당 사용자 제거
                    } else { // 아직 좋아요 안 눌렀다면
                        return {...prev, [messageOutput.cateChatId]: [...prevLikes, messageOutput.sender]}; // 해당 사용자 추가
                    }
                });
            } else {
                setTyping(prevList => prevList.filter(item => !item.includes(messageOutput.sender)));
                setDots("");
                setIsTyping("f");
                setMessages((prevMessages) => [...prevMessages, messageOutput]);
            }
        }
    };
    const showUserListOutput = (messageOutput) => {
        setuserList((prevUserList) => [...messageOutput]);
    };
    const roomListAdd = (roomListadd) => {
        setRoomList((prevroomList) => [...roomListadd]);
    };
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


    const exitChatDiv = (interest) => {
        setMenuDiv(false);
        setMenuDiv2(false);
        setIsUserListVisible(false);
        setIsChatDiv(false);
    };


    // 카테고리 룸 등록 후 div 업데이트 합니다
    const setCateRoomAndHandleChatDivUpdate = (chatDivUpdateValue, cateRoomValue) => {
        setCateRoom(cateRoomValue)
        setIsChatDiv(chatDivUpdateValue);
        roomListLoad(currentCate.current);
    };
    const handleChange = (event) => {
        const {name, value} = event.target;
        setFormValues({...formValues, [name]: value});
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        cateRoomCreate();
    };

    const roomListLoad = async (category, retry = true) => {
        if (category === undefined) {
            category = "ALL";
        }
        setCateName(category);
        setCateLoadingText("Room Load...");
        currentCate.current = category;
        try {
            const response = await fetch(`/api/v1/cateChat/roomList/${category}`, {
                method: 'GET',
                headers: {
                    Authorization: localStorage.getItem('Authorization'),
                    'userName': localStorage.getItem('userName'),
                },
            });

            const accessToken = response.headers.get('Authorization');
            if (accessToken != null) {
                localStorage.setItem('Authorization', accessToken);
            }
            if (response.headers.get('refresh') != null) {
                logoutApiCate(true);
                return;
            }
            const data = await response.json();
            if (data) {
                if (data.items.length == 0) {
                    setRoomList(() => []);
                    setCateLoadingText("No room");
                } else {
                    setRoomList(() => data.items)
                }
            }
        } catch (error) {
            if (retry) {
                await roomListLoad(category, false);
            }
        }
    }

    const cateRoomCreate = async (retry = true) => {
        try {
            const response = await fetch('/api/v1/cateChat/createCateRoom', {
                method: 'POST',
                headers: {
                    'Authorization': localStorage.getItem('Authorization'),
                    'userName': localStorage.getItem('userName'),
                    'Content-Type': 'application/json', // Content-Type 추가
                },
                body: JSON.stringify(formValues), // 객체를 문자열로 변환
            });

            const accessToken = response.headers.get('Authorization');
            if (accessToken != null) {
                localStorage.setItem('Authorization', accessToken);
            }
            if (response.headers.get('refresh') != null) {
                logoutApiCate(true);
                return;
            }
            const rs_cateRoom = await response.json(); // JSON 데이터를 추출합니다.
            if (rs_cateRoom.cateId) {
                CloseCreateRoom();
                setCreateRoomId(rs_cateRoom.cateId);
                roomListAdd([rs_cateRoom]);
            } else {
                if (retry) {
                    await cateRoomCreate(false);
                }
            }
        } catch (e) {
            if (retry) {
                await cateRoomCreate(false);
            }
        }
    };
    //카테쳇 끝

    //방 만들기 버튼 클릭 시 실행
    const CreateRoom = () => {
        setCreatRoom(true);
        setCreatRoom2(true);
    }
    const CloseCreateRoom = () => {
        setCreatRoom(false);
        setCreatRoom2(true);
        setFormValues({cateName: '', maxUserCnt: 2, interest: ' '});
    }

    // 왼쪽 버튼 클릭 이벤트 핸들러
    const handleScrollLeftClick = (event) => {
        event.preventDefault();
        scrollLeft();
    };

    // 오른쪽 버튼 클릭 이벤트 핸들러
    const handleScrollRightClick = (event) => {
        event.preventDefault();
        scrollRight();
    };

    const scrollLeft = () => {
        const currentScroll = catescroll.current.scrollLeft;
        catescroll.current.scrollTo({
            behavior: 'smooth',
            left: currentScroll - 200,
        });
    };

    const scrollRight = () => {
        const currentScroll = catescroll.current.scrollLeft;
        catescroll.current.scrollTo({
            behavior: 'smooth',
            left: currentScroll + 200,
        });
    };

//--------------파일 버튼 클릭 시 동작----------------------
    const handleFileButtonClick = () => {
        setSendMessage("");
        setInputChange(true);
        inputFileRef.current.click();
    };
//--------------파일 버튼 클릭 시 동작----------------------
//--------------인풋창 클릭 시 파일에서 일반 텍스트 채팅으로 전환----------------------
    const handleInputChange = (e) => {
        setInputChange(false);
    };
//--------------인풋창 클릭 시 파일에서 일반 텍스트 채팅으로 전환----------------------
    //좋아요
    const likeOn = (data) => {
        // setLikes({
        //     ...likes,
        //     [data]: !likes[data],  // 기존에 좋아요가 눌러져 있었다면 false로, 아니라면 true로 설정
        // });
        if (stompClient) {
            const headers = {
                Authorization: localStorage.getItem("Authorization"),
            };
            const messageData = {
                type: "LIKE",
                cateChatId: data,
                cateId: CateRoom.cateId,
            };
            stompClient.send(
                `/catePub/categoryChat/${CateRoom.cateId}/like`,
                {},
                JSON.stringify(messageData)
            );
        }
    };

//--------------텍스트 채팅 시 입력 메시지 보여주기----------------------
    const handleMessageChange = (e) => {
        if (e.target.value.trim() !== '') {
            setIsTyping("y");
        } else {
            setIsTyping("n");
        }
        setSendMessage(e.target.value);

    };

    //입력중...메시지 띄우기
    const sendTypingMessage = () => {
        // 메시지 전송 처리를 여기서 수행
        const message = {
            type: "CHAT",
            cateId: CateRoom.cateId,
            cateChatContent: "typing...",
        };

        stompClient.send(
            `/catePub/categoryChat/${CateRoom.cateId}/sendMessage`,
            {},
            JSON.stringify(message)
        );
    }
    //백스페이스로 입력값을 지웠을 때 입력중...없애기
    const removeTypingMessage = () => {
        const message = {
            type: "CHAT",
            cateId: CateRoom.cateId,
            cateChatContent: "removeTyping",
        };

        stompClient.send(
            `/catePub/categoryChat/${CateRoom.cateId}/sendMessage`,
            {},
            JSON.stringify(message)
        );
    }


//--------------텍스트 채팅 시 입력 메시지 보여주기----------------------
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
//--------------메뉴 오픈-----------------------
    const handleMenuOpen = () => {
        setMenuDiv((prevIsUserListVisible) => !prevIsUserListVisible);
        setMenuDiv2(true);
    };
//--------------메뉴 오픈-----------------------
//--------------업로드 파일----------------------
    const uploadFiles = () => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        // 각 파일을 순회하며 업로드합니다.
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];

            const formData = new FormData();
            formData.append("file", file);
            formData.append("roomId", CateRoom.cateId);

            axios.post('/cateChat/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => {
                    const data = response.data;
                    const chatMessage = {
                        type: "CHAT",
                        cateId: CateRoom.cateId,
                        cateChatContent: "File upload",
                        "s3DataUrl": data.s3DataUrl,
                        "fileName": file.name,
                        "fileDir": data.fileDir
                    };
                    stompClient.send(
                        `/catePub/categoryChat/${CateRoom.cateId}/sendMessage`,
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
//--------------다운로드 파일----------------------
    const downloadFile = (name, dir) => {
        const url = `/catechat/download/${name}`;

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
                minHeight={600}
                maxWidth={600}
                maxHeight={750}
                disabled={!cateMax}
                onResizeStop={handleResizeStop}
                onResizeStart={handleResizeStart}
                default={{x: cateDragPosition.x, y: cateDragPosition.y}}
                onDragStop={(e, d) => {
                    dispatch({type: "SET_CATEDRAG_POSITION", payload: {x: d.x, y: d.y}});
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
                style={{
                    zIndex: "3",
                    position: "fixed",
                    visibility: !cateMax ? "hidden" : "visible",
                    opacity: !cateMax ? "0" : "1",
                    transition: resizing ? 'none' : 'opacity 0.25s ease-in-out, width 0.25s ease-in-out, height 0.25s ease-in-out'
                }}
                dragHandleClassName="headerCate"
                bounds="window"
            >
                <div
                    className="box"
                    style={{
                        display: !cateMax ? 'none' : 'block',
                        top: '0',
                        cursor: 'auto',
                        color: 'black',
                        width: '100%',
                        height: '100%',
                        borderRadius: '4px',
                        borderTopLeftRadius: isUserListVisible ? '0px' : '4px',
                        borderBottomLeftRadius: '4px',
                        padding: '0px',
                        margin: 'auto',
                        userSelect: 'none',
                        zIndex: '3',
                        transition: isUserListVisible ? 'border-top-left-radius 0s ease-in-out, border-bottom-left-radius 0s ease-in-out' : 'border-top-left-radius 1s ease-in-out, border-bottom-left-radius 1s ease-in-out'
                    }}
                >
                    <UserListPanel visible={isUserListVisible ? "visible" : isUserListVisible2 ? "" : "hidden"}
                    >
                        <div className={"userList_title"}>
                                        <span className={"userList_title_2"}>User&nbsp;
                                            <span className={"userList_title_cnt"}>{userList.length}</span>
                                        </span>

                        </div>
                        {userList.map((user, index) => (
                            <div className={"userList_content"}>
                                <div className={"userList_content_2"}>
                                    {user}
                                </div>
                            </div>
                        ))}
                    </UserListPanel>
                    <DivStyled visible={createRoom ? "visible" : createRoom2 ? "" : "hidden"}
                               ref={createRoomRef}>
                        <div className={"creatRoom_Div"}>
                            <div className={"creatRoom_Div_2"}>
                                <div className={"creatRoom_Div_2_1"}>

                                </div>
                                <div className={"creatRoom_Div_2_2"}>
                                    Room Create

                                </div>
                                <div className={"creatRoom_Div_2_3"}>
                                    <Button
                                        className={"close"}
                                        onClick={CloseCreateRoom}
                                    >
                                    </Button>
                                </div>

                            </div>
                            <div className={"creatRoom_Div_3"}>
                                <form onSubmit={handleSubmit} className={"creatRoom_Div_form"}>
                                    <input
                                        style={{marginLeft: '0px'}}
                                        placeholder={"Please enter Roomname"}
                                        type="text"
                                        className={"roomName"}
                                        name="cateName"
                                        required
                                        value={formValues.cateName}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="number"
                                        name="maxUserCnt"
                                        min="2"
                                        max="20"
                                        className={"roomNameNumber"}
                                        required
                                        value={formValues.maxUserCnt}
                                        onChange={handleChange}
                                    />
                                    <Select
                                        name="interest"
                                        required
                                        className={"roomNameSelect"}
                                        value={formValues.interest}
                                        onChange={handleChange}
                                    >
                                        <MenuItem className={"menu_li_select_place"} value={" "} disabled>Please
                                            select a CATEGORY</MenuItem>
                                        <MenuItem className={"menu_li_select"}
                                                  value="romantic">romantic</MenuItem>
                                        <MenuItem className={"menu_li_select"}
                                                  value="friendship">friendship</MenuItem>
                                        <MenuItem className={"menu_li_select"}
                                                  value="sports">sports</MenuItem>
                                        {/* 캐나다 추가 */}
                                        <MenuItem className={"menu_li_select"}
                                                  value="music">music</MenuItem>
                                        <MenuItem className={"menu_li_select"}
                                                  value="movie">movie</MenuItem>
                                        <MenuItem className={"menu_li_select"}
                                                  value="photo">photo</MenuItem>
                                        {/* 필리핀 추가 */}
                                        <MenuItem className={"menu_li_select"} value="food">food</MenuItem>
                                        {/* 러시아 추가 */}
                                        <MenuItem className={"menu_li_select"} value="trip">trip</MenuItem>
                                        {/* 대만 추가 */}
                                        <MenuItem className={"menu_li_select"}
                                                  value="interior">interior</MenuItem>
                                        {/* 우크라이나 추가 */}
                                        <MenuItem className={"menu_li_select"} value="game">game</MenuItem>
                                        {/* 호주 추가 */}
                                        <MenuItem className={"menu_li_select"}
                                                  value="knowledge">knowledge</MenuItem>
                                        <MenuItem className={"menu_li_select"} value="Pets">Pets</MenuItem>
                                        {/* 이탈리아 추가 */}
                                    </Select>
                                    <Button
                                        className={"roomCreate2"}
                                        type="submit"
                                    >CREATE
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </DivStyled>
                    <div className={"headerCate"}>
                        <div className={isUserListVisible ? "headerChatCate_true" : "headerChatCate"}
                        >
                            <div className={"btnDiv_create"}>
                                <img
                                    className={"logo_img"}
                                    src={Logo}
                                ></img>
                                {isChatDiv ? (
                                    <Button
                                        type={'button'}
                                        className={"userList"}
                                        onClick={toggleUserListPanel}
                                        disabled={!isChatReadOnly}
                                    >USER LIST
                                    </Button>
                                ) : (
                                    <Button
                                        className={"roomCreate"}
                                        onClick={CreateRoom}
                                    >CREATE
                                    </Button>
                                )}
                            </div>
                            <div className={"title_cate"}>
                                Category Chat

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
                    </div>

                    {/* 밑으로 컨텐츠 들어갈 부분*/}
                    <div className={isChatDiv ? "contentChat_true" : "CatecontentChat"}>
                        {isChatDiv ? (
                            <div className={"chatR"}>
                                <div className={"EnterRoom"}>
                                    <div className={"EnterRoom_2"}>
                                        <div className={"EnterRoomNameCate"}>
                                                    <span className={"EnterRoomName_2"}>
                                                        {CateRoom.cateName}
                                                    </span>
                                        </div>
                                        <div className={"EnterRoomClose"}>
                                            <div className={"EnterRoomCate_text"}>
                                                {CateRoom.interest}</div>
                                            <Button
                                                className={"Close_btn"}
                                                onClick={() => exitChatDiv(CateRoom.interest)}
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
                                                    const isMyMessage = message.sender === userNickNameRef.current;
                                                    return (
                                                        <MessageStyled
                                                            key={message.cateChatId}
                                                            className={message.type !== 'CHAT' ? "userJoin" : isMyMessage ? "userY" : "userX"}
                                                        >
                                                            {message.type !== 'CHAT' ? (
                                                                <div>
                                                                            <span
                                                                                className="content_join">{message.cateChatContent}</span>
                                                                    <p className="message-regdate_Join">{message.cateChatRegdate}</p>
                                                                </div>
                                                            ) : isMyMessage ? (
                                                                <div>
                                                                    <div className={"message-user"}>
                                                                        <img className={"message-user-profile"}
                                                                             src={message.userProfile ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + message.userProfile : Profile}
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
                                                                                    ? <video
                                                                                        src={message.s3DataUrl}
                                                                                        controls
                                                                                        className={"message_img"}/> // 동영상 렌더링
                                                                                    : <div
                                                                                        className={"message_other"}>
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
                                                                        className="content_user">{message.cateChatContent}</span>
                                                                    <span
                                                                        className="message-regdate">{message.cateChatRegdate}</span>
                                                                    {(likes[message.cateChatId] && likes[message.cateChatId].length > 0) ?
                                                                        (
                                                                            <>
                                                                                <FavoriteIcon
                                                                                    className={"like_btn2"}
                                                                                />
                                                                                <span
                                                                                    className={"like_cnt2"}>{likes[message.cateChatId].length}</span>
                                                                            </>
                                                                        ) : (
                                                                            <FavoriteBorderIcon
                                                                                className={"like_btn2 one"}
                                                                            />
                                                                        )}
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <div className={"message-other"}>
                                                                        <img className={"message-other-profile"}
                                                                             src={message.userProfile ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + message.userProfile : Profile}
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
                                                                                    ? <video
                                                                                        src={message.s3DataUrl}
                                                                                        controls
                                                                                        className={"message_img2"}/> // 동영상 렌더링
                                                                                    : <div
                                                                                        className={"message_other2"}>
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
                                                                        className="content_other">{message.cateChatContent}</span>
                                                                    <span
                                                                        className="message-regdate_other">{message.cateChatRegdate}</span>
                                                                    {(likes[message.cateChatId] && likes[message.cateChatId].includes(userNickNameRef.current)) ?
                                                                        (
                                                                            <>
                                                                                <div className={"like_cnt_div"}>

                                                                                    <FavoriteIcon
                                                                                        className={"like_btn"}
                                                                                        onClick={() => likeOn(message.cateChatId)}
                                                                                    />
                                                                                    <span
                                                                                        className={"like_cnt"}>{likes[message.cateChatId].length}</span>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <div className={"like_cnt_div"}>

                                                                                    <FavoriteBorderIcon
                                                                                        className={"like_btn one"}
                                                                                        onClick={() => likeOn(message.cateChatId)}
                                                                                    />
                                                                                    <span
                                                                                        className={"like_cnt"}>{(likes[message.cateChatId] && likes[message.cateChatId].length > 0) ? likes[message.cateChatId].length : ""}</span>
                                                                                </div>
                                                                            </>
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
                <div className={"EnterRoomChat_input_cate"}>
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
                                                  value={" "}>Not
                                            translated</MenuItem>
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
            <div className={"roomCate"}>
        {CateName}
            </div>
            <div className={"selectC"}>

            <div className={"CateChat_Room_List"}>

            <div className={"CateChat_Room_category_2"}>
            <Button id="scrollLeft" type="button"
            onClick={handleScrollLeftClick}
            className={"left_btn"}
            >
            L
            </Button>
            <div className={"CateChat_Room_category"} ref={catescroll}>
            <Button
            className={`Cate_btn one ${activeButton === 'ALL' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('ALL');
            setActiveButton('ALL');
        }}

            >
            ALL
            </Button>
            <Button
            className={`Cate_btn two ${activeButton === 'romantic' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('romantic');
            setActiveButton('romantic');
        }}
            >
            romantic relationship
            </Button>
            <Button
            className={`Cate_btn one ${activeButton === 'friendship' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('friendship');
            setActiveButton('friendship');
        }}
            >
            friendship
            </Button>
            <Button
            className={`Cate_btn two ${activeButton === 'sports' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('sports');
            setActiveButton('sports');
        }}
            >
            sports
            </Button>
            <Button
            className={`Cate_btn one ${activeButton === 'music' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('music');
            setActiveButton('music');
        }}
            >
            music
            </Button>
            <Button
            className={`Cate_btn two ${activeButton === 'movie' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('movie');
            setActiveButton('movie');
        }}
            >
            movie
            </Button>
            <Button
            className={`Cate_btn one ${activeButton === 'photo' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('photo');
            setActiveButton('photo');
        }}
            >
            photo
            </Button>
            <Button
            className={`Cate_btn two ${activeButton === 'food' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('food');
            setActiveButton('food');
        }}
            >
            food
            </Button>
            <Button
            className={`Cate_btn one ${activeButton === 'trip' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('trip');
            setActiveButton('trip');
        }}
            >
            trip
            </Button>
            <Button
            className={`Cate_btn two ${activeButton === 'interior' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('interior');
            setActiveButton('interior');
        }}
            >
            interior
            </Button>
            <Button
            className={`Cate_btn one ${activeButton === 'game' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('game');
            setActiveButton('game');
        }}
            >
            game
            </Button>
            <Button
            className={`Cate_btn two ${activeButton === 'knowledge' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('knowledge');
            setActiveButton('knowledge');
        }}
            >
            knowledge
            </Button>
            <Button
            className={`Cate_btn_R ${activeButton === 'Pets' ? 'active' : ''}`}
            onClick={() => {
            roomListLoad('Pets');
            setActiveButton('Pets');
        }}
            >
            Pets
            </Button>
            </div>
            <Button id="scrollLeft" type="button"
            onClick={handleScrollRightClick}
            className={"right_btn"}
            >
            R
            </Button>
            </div>
            <div className={"RoomList"}>
            <div className={"RoomList_2"}>
        {roomList && roomList.length === 0 ? (
            <div className={"noRoom"}>{CateLoadingText}</div>
            ) : (
            roomList.map((room) => (
            <CateChatListItem
            key={room.cateId}
            room={room}
            onCateRoomAndChatDivUpdate={setCateRoomAndHandleChatDivUpdate}
            shouldImmediatelyEnter={room.cateId === createRoomId}
            ></CateChatListItem>
            ))
            )}
            </div>
            </div>
            </div>
            </div>
            </div>
            )}
        </div>
</div>
</Rnd>
</>
)}
</>
)
    ;
})
    ;

    export default Drag;