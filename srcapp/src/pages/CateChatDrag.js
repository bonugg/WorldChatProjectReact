import React, {useEffect, useRef, useState, useCallback} from "react";
import Draggable from 'react-draggable';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {Stomp, Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Profile from "../img/profile.png"

import "./css/CateChat.css";
import CateChatListItem from './CateChatListItem';
import styled, {keyframes} from "styled-components";

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

const Drag = React.memo(({show, onClose, logoutApiCate}) => {
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

        const [isUserListVisible, setIsUserListVisible] = useState(false);
        const [isUserListVisible2, setIsUserListVisible2] = useState(false);

        const [position, setPosition] = useState(initialPosition);
        const handleDrag = useCallback((e, data) => trackPos(data), []);

        const catescroll = useRef();  //특정 DOM을 가리킬 때 사용하는 Hook함수, SecondDiv에 적용

        //방 생성 클릭 시 실해되는 상태 변수
        const [createRoomId, setCreateRoomId] = useState('');
        const [createRoom, setCreatRoom] = useState(false);
        const [createRoom2, setCreatRoom2] = useState(false);
        const createRoomRef = useRef(null);

        const [isMinimized, setIsMinimized] = useState(false);
        const [isClosed, setIsClosed] = useState(false);

        const [UserNickName, setUserNickName] = useState('');

        const [roomList, setRoomList] = useState([]);
        const [CateName, setCateName] = useState('Select Category');
        const [CateChatList, setCateChatList] = useState([]);
        const [CateRoom, setCateRoom] = useState({});
        const [isChatDiv, setIsChatDiv] = useState(false);

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
        const [isScroll, setIsScroll] = useState('');
        const [previousScrollbarState, setPreviousScrollbarState] = useState(false);

        const [formValues, setFormValues] = useState({
            cateName: '',
            maxUserCnt: 2,
            interest: ' ',
        });

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
                        const userNickName = responseBodyObject.user.userNickName;
                        setUserNickName(userNickName);
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
                console.log("Connected: " + frame);

                client.subscribe("/cateSub/" + CateRoom.cateId, (messageOutput) => {
                    const responseData = JSON.parse(messageOutput.body);
                    console.log(responseData);
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
                console.log("Error: " + error);
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
                setSendMessage('');
                setIsChatReadOnly(false);
                setMessages([]);
                setIsUserListVisible(false);
                setIsUserListVisible2(false);
                setStompClient(null);
            }
            console.log('Disconnected');
        };

        useEffect(() => {
            if (!show) {
                setIsClosed(false);
                setIsChatDiv(false);
            }
        }, [show]);

        useEffect(() => {
            if (isChatDiv) {
                setCreateRoomId('');
                connect();
            } else {
                setSendMessage('');
                setMessages([]);
                setIsUserListVisible(false);
                setIsUserListVisible2(false);
                disconnect();
                if (isUserListVisible) {
                    setIsUserListVisible2(true);
                }
            }
        }, [isChatDiv]);

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

        const handleMinimizeClick = () => {
            setCreatRoom(false);
            setCreatRoom2(false);
            setIsMinimized(!isMinimized);
        };

        const handleCloseClick = () => {
            setIsUserListVisible(false);
            setIsUserListVisible2(false);
            setCreatRoom(false);
            setCreatRoom2(false);

            setIsClosed(true);
            setPosition(initialPosition);

            setIsChatDiv(false);
            setIsChatReadOnly(false);
            setSendMessage('');
            setMessages([]);
            setRoomList([]);
            setCateName("Select Category");
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
            setMessages((prevMessages) => [...prevMessages, messageOutput]);
        };
        const showUserListOutput = (messageOutput) => {
            setuserList((prevUserList) => [...messageOutput]);
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


        const exitChatDiv = () => {
            setIsChatDiv(false);
        };


        // useEffect(() => {
        //     // isChatDiv가 true가 될 때 접속하고 false가 될 때 끊습니다.
        //     if (!CateChatDiv) {
        //         setIsChatDiv(false);
        //     }
        // }, [CateChatDiv]);
        //
        // useEffect(() => {
        //     if (CateChatDiv) {
        //         roomListLoad();
        //     }
        // }, [CateChatDiv]);

        // 카테고리 룸 등록 후 div 업데이트 합니다
        const setCateRoomAndHandleChatDivUpdate = (chatDivUpdateValue, cateRoomValue) => {
            setCateRoom(cateRoomValue)
            setIsChatDiv(chatDivUpdateValue);
        };
        const handleCateChatList = (value) => {
            setCateChatList(value);
        };
        const handleChange = (event) => {
            const {name, value} = event.target;
            setFormValues({...formValues, [name]: value});
        };

        const handleSubmit = (event) => {
            event.preventDefault();
            cateRoomCreate();
            // if (validateForm()) {
            //     // 여기서 formValues를 서버에 전송하거나 처리
            //     cateRoomCreate();
            // }
        };

        // const validateForm = () => {
        //     // 여기에서 유효성 검사를 수행하고, 결과에 따라 true 또는 false를 반환
        //     return true;
        // };

        const roomListLoad = async (category, retry = true) => {
            if (category === undefined) {
                category = "ALL";
            }
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
                        setCateName(category);
                    } else {
                        setRoomList(() => data.items)
                        setCateName(category);
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
                console.log(rs_cateRoom); // rs_cateRoom 객체를 출력합니다.

                if (rs_cateRoom.cateId) {
                    CloseCreateRoom();
                    setCreateRoomId(rs_cateRoom.cateId);
                    roomListLoad(formValues.interest);
                } else {
                    console.log("cateRoomCreate 재시도")
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
                                    borderTopLeftRadius: isUserListVisible ? '0px' : '15px',
                                    borderBottomLeftRadius: '15px',
                                    padding: '1em',
                                    margin: 'auto',
                                    userSelect: 'none',
                                    zIndex: '2',
                                    background: 'rgb(50, 50, 50,0.8)',
                                    transition: isUserListVisible ? 'border-top-left-radius 0s ease-in-out, border-bottom-left-radius 0s ease-in-out' : 'border-top-left-radius 1s ease-in-out, border-bottom-left-radius 1s ease-in-out'
                                }}
                            >
                                <UserListPanel visible={isUserListVisible ? "visible" : isUserListVisible2 ? "" : "hidden"}
                                >
                                    <div className={"userList_title"}>
                                        <span className={"userList_title_2"}>User List&nbsp;
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
                                            <Button
                                                className={"CreateClose"}
                                                onClick={CloseCreateRoom}
                                            >

                                            </Button>
                                        </div>
                                        <div className={"creatRoom_Div_3"}>
                                            <form onSubmit={handleSubmit} className={"creatRoom_Div_form"}>
                                                <div className={"creatRoom_Div_4"}>
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
                                                </div>
                                                <div className={"creatRoom_Div_5"}>
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
                                                </div>
                                                <div className={"creatRoom_Div_6"}>
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
                                                </div>
                                                <div className={"creatRoom_Div_7"}>
                                                    <Button
                                                        className={"roomCreate2"}
                                                        type="submit"
                                                    >CREATE
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </DivStyled>
                                <div className={"header"}>
                                    <div className={"btnDiv_create"}>
                                        {isChatDiv ? (
                                            <Button
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
                                {/* 밑으로 컨텐츠 들어갈 부분*/}
                                {/*<div style={{color:'white', fontSize: '22px'}}>x: {position.x.toFixed(0)}, y: {position.y.toFixed(0)}</div>*/}
                                {isChatDiv ? (
                                    <div className={"chat"}>
                                        <div className={"EnterRoom"}>
                                            <div className={"EnterRoom_2"}>
                                                <div className={"EnterRoomCate"}>
                                                    <div className={"EnterRoomCate_text"}>
                                                        {CateRoom.interest}</div>
                                                </div>
                                                <div className={"EnterRoomName"}>
                                                    <span className={"EnterRoomName_2"}>
                                                        {CateRoom.cateName}
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
                                                            const isMyMessage = message.sender === UserNickName;
                                                            return (
                                                                <MessageStyled
                                                                    key={index}
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
                                                                            <span
                                                                                className="content_user">{message.cateChatContent}</span>
                                                                            <span
                                                                                className="message-regdate">{message.cateChatRegdate}</span>
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
                                                                            <span
                                                                                className="content_other">{message.cateChatContent}</span>
                                                                            <span
                                                                                className="message-regdate_other">{message.cateChatRegdate}</span>
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
                                                        <Button
                                                            className={"btnSend"}
                                                            type="submit"
                                                            onClick={handleSendMessage}
                                                        >+
                                                        </Button>
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

                                        <div className={"CateChat_Room_List"}>
                                            <div className={"CateChat_Room_category_2"}>
                                                <Button id="scrollLeft" type="button" onClick={handleScrollLeftClick}
                                                        className={"left_btn"}
                                                >
                                                    L
                                                </Button>
                                                <div className={"CateChat_Room_category"} ref={catescroll}>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('ALL')}
                                                    >
                                                        ALL
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('romantic')}
                                                    >
                                                        romantic relationship
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('friendship')}
                                                    >
                                                        friendship
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('sports')}
                                                    >
                                                        sports
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('music')}
                                                    >
                                                        music
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('movie')}
                                                    >
                                                        movie
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('photo')}
                                                    >
                                                        photo
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('food')}
                                                    >
                                                        food
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('trip')}
                                                    >
                                                        trip
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('interior')}
                                                    >
                                                        interior
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('game')}
                                                    >
                                                        game
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn"}
                                                        onClick={() => roomListLoad('knowledge')}
                                                    >
                                                        knowledge
                                                    </Button>
                                                    <Button
                                                        className={"Cate_btn_R"}
                                                        onClick={() => roomListLoad('Pets')}
                                                    >
                                                        Pets
                                                    </Button>
                                                </div>
                                                <Button id="scrollLeft" type="button" onClick={handleScrollRightClick}
                                                        className={"right_btn"}
                                                >
                                                    R
                                                </Button>
                                            </div>
                                            <div className={"roomCate"}>
                                                {CateName}
                                            </div>
                                            <div className={"RoomList"}>
                                                <div className={"RoomList_2"}>
                                                    {roomList && roomList.length === 0 ? (
                                                        <div className={"noRoom"}>No Room</div>
                                                    ) : (
                                                        roomList.map((room) => (
                                                            <CateChatListItem
                                                                key={room.cateId}
                                                                room={room}
                                                                onCateRoomAndChatDivUpdate={setCateRoomAndHandleChatDivUpdate}
                                                                cateChatList={handleCateChatList}
                                                                shouldImmediatelyEnter={room.cateId === createRoomId}
                                                            ></CateChatListItem>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/*</div>*/}
                            </div>
                        </Draggable>
                        {isMinimized && (
                            <Button
                                onClick={handleMinimizeClick}
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    bottom: '80px',
                                    transform: 'translateX(-50%)',
                                }}
                                className={"maximum_btn"}
                            >
                                C
                            </Button>
                        )}
                    </>
                )}
            </div>
        );
    })
;

export default Drag;