import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import "./css/Home.css";
import React, {useRef, useState, useEffect} from "react";
import styled from "styled-components";
import {useFrame, useThree, Canvas} from "@react-three/fiber";
import {Suspense} from "react";
import * as THREE from "three";
import {keyframes} from 'styled-components';
import Logo from "../img/logo.png";
import Background from "../img/background.jpg";
import Logo_no_text from "../img/logo_no_text.png";
import Logo_text from "../img/logo_text.png";

import Earth from "../components/earth/index";
import MyPage from './MyPage';
import FreindsList from './FreindsList';
import PasswordChange from './PasswordChange';
import ChatComponent from "../components/rtc/rtcChat";
import ChatVoiceComponent from "../components/rtc/rtcVoiceChat"
import UserListContext from '../context/UserListContext';
import SockJS from 'sockjs-client';
// import socket from "ws/lib/websocket";

import CateChatDrag from "./CateChatDrag";
import RandomChatDrag from "./RandomChatDrag";
import OneOnOneChatDrag from "./OneOnOneChatDrag";
import NotificationModal from "../components/rtc/NotificationModal.js";
import NotificationDeclineModal from '../components/rtc/NotificationDeclineModal.js';
import { type } from '@testing-library/user-event/dist/type';

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  //background: rgba(50, 50, 50, 0.3);
  overflow: hidden;
    // background-image: url(${Background});
  // background-repeat: no-repeat;
  // background-position: top center;
  // background-size: cover;
  // background-attachment: fixed;
`;

const slideDown = keyframes`
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
`;

const slideDownFriends = keyframes`
  0% {
    height: 0;
  }
  100% {
    height: 650px;
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

const DivStyledMenu = styled.div`
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  animation: ${props => props.visible ? slideDown : ""} 0.35s ease-in-out;
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  transform: ${props => props.visible ? 'translate(-50%, -50%) scaleY(1)' : 'translate(-50%, -50%) scaleY(0)'};
`;
const DivStyledMenu2 = styled.div`
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  animation: ${props => props.visible ? slideDownFriends : ""} 0.35s ease-in-out;
  position: absolute;
  right: 20px;
  bottom: 20px;
  overflow: hidden; // 새로 추가된 속성
  height: ${props => props.visible ? '650px' : '0'}; // 새로 추가된 속성
`;
const DivStyled = styled.div`
  visibility: ${props => props.visible === "visible" ? 'visible' : props.visible === "" ? "" : "hidden"};
  animation: ${props => props.visible === "visible" ? slideDown : props.visible === "" ? slideUp : 'hidden'} 0.35s ease-in-out;
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  transform: ${props => props.visible === "visible" ? 'translate(-50%, -50%) scaleY(1)' : 'translate(-50%, -50%) scaleY(0)'};
  /* Add other CSS properties for the loginDiv here */
`;

const Home = React.memo(() => {
        //드래그 채팅창 기능
        const [showDrag, setShowDrag] = useState(false);
        const [oneOnOneUserId, setOneOnOneUserId] = useState('');
        const [oneOnOneUserNickName, setOneOnOneUserNickName] = useState('');
        const [randomChatDrag, setRandomChatDrag] = useState(false);
        const [oneononeChatDrag, setOneononeChatDrag] = useState(false);
        const [rtcChatDrag, setRtcChatDrag] = useState(false);
        //드래그 이벤트
        const handleShowDrag = () => {
            setShowDrag(true);
        };
        const handleRandomShowDrag = () => {
            setRandomChatDrag(true);
        };
        const handleRtcShowDrag = () => {
            setShowRtcChat(true);
        };
        const isOneOnOneChatDiv = (isDiv, userId, userNickName) => {
            setOneononeChatDrag(isDiv);
            setOneOnOneUserId(userId);
            setOneOnOneUserNickName(userNickName);
        };

        const handleDragClose = () => {
            setShowDrag(false);
        };
        const handleRandomShowDragClose = () => {
            setRandomChatDrag(false);
        };
        const handleOneOnOneShowDragClose = () => {
            setOneononeChatDrag(false);
        };
        const handleRtcShowDragClose = () => {
            setRtcChatDrag(false);
        };
        //계정 기억 상태 변수
        const [rememberAccount, setRememberAccount] = useState(false);

        const [mainCamera, setMainCamera] = useState(new THREE.Vector3(0, 0, 3));
        const [isLoginZoom, setIsLoginZoom] = useState(false);
        const [isSignUpZoom, setIsSignUpZoom] = useState(false);
        const [isMapageZoom, setIsMapageZoom] = useState(false);
        const [LoginZoom, setLoginZoom] = useState(0);
        const [mouseLock, setMouseLock] = useState(false);

        const [targetPosition, setTargetPosition] = useState(null);
        const [cameraPosition, setCameraPosition] = useState(null);
        //카메라 초기 위치로 돌아갔는지 확인
        const [isAtInitialPosition, setIsAtInitialPosition] = useState(false);

        //도시 클릭 시 친구목록 띄우기
        const [FriendsList, setFriendsList] = useState(false);
        //도시 클릭 시 나라 이름 출력
        const [FriendNationally, setFriendNationally] = useState('');

        //로그인 및 회원가입 화면 창 띄우기
        const [LoginDiv, setLoginDiv] = useState(false);
        const [SignUpDiv, setSignUpDiv] = useState(false);
        const [MyPageDiv, setMyPageDiv] = useState(false);
        //로그인
        const [loggedIn, setLoggedIn] = useState(false); //로그인 상태확인
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const [buttonText, setButtonText] = useState("LOGIN");

        //로그아웃
        const [loggedOut, setLoggedOut] = useState(false); //로그아웃 상태확인

        //회원가입
        const [SginuserName, setSignUsername] = useState('');
        const [SignuserPwd, setSignPassword] = useState('');
        const [SignuserEmail, setSignEmail] = useState('');
        const [SignuserNickName, setSignuserNickName] = useState('');
        const [SignuserNationality, setSignuserNationality] = useState('');
        const [SignuserPhone, setSignuserPhone] = useState('');
        const [IdCheckError, setIdCheckError] = useState(false);
        const [IdCheckError2, setIdCheckError2] = useState(false);
        const [isIdCheckDisabled, setisIdCheckDisabled] = useState(true);
        const [PasswordCheck, setPasswordCheck] = useState("At least 8 characters consisting of English and numbers, including 2 special characters");
        const [emailCheckError, setEmailCheckError] = useState(false);
        const [emailCheckError2, setEmailCheckError2] = useState(false);
        const [NickNameCheckError, setNickNameCheckError] = useState(false);
        const [NickNameCheckError2, setNickNameCheckError2] = useState(false);
        const [isNickNameCheckError, setisNickNameCheckError] = useState(true);
        const [phoneCheckError, setPhoneCheckError] = useState(false);
        const [phoneCheckError2, setPhoneCheckError2] = useState(false);

        //패스워드 수정 버튼 클릭 상태
        const [isPasswordChangeDiv, setIsPasswordChangeDiv] = useState(false);
        const [isPasswordChangeDiv2, setIsPasswordChangeDiv2] = useState(false);
        //패스워드 수정 창 외의 화면 클릭 시 상태
        const passwordChangeDivRef = useRef(null);

        // rtc
        const [showRtcChat, setShowRtcChat] = useState(false); // RtcChat 상태를 boolean으로 관리
        const [showRtcVoiceChat,setShowRtcVoiceChat] = useState(false);
        const [rtcUserName, setRtcUserName] = useState(null);
        const [sendUser, setSendUser] = useState(null);
        const [receiverUser, setReceiverUser] = useState(null);
        // let rtcUserName = "";
        // const Rtc = () => {
        //     console.log("Rtc실행됨");
        //     setShowRtcChat(true); // RtcChat 상태를 true로 설정
        // }
        const [socket, setSocket] = useState(null);
        const [lang, setLang] = useState(localStorage.getItem("language")?localStorage.getItem("language"):"Eng");

        //friendList Context API
        const [userList, setUserList] = useState([]);

        const [showModal, setShowModal] = useState(false);
        const [showDeclineModal,setShowDeclineModal] = useState(false);
        const [modalContent, setModalContent] = useState("");

        const handleModalConfirm = () => {
            setShowModal(false);
            setSendUser(modalContent.split("님이")[0]);
            setReceiverUser(rtcUserName);

            if (modalContent.includes("영상통화")) {
                setShowRtcChat(true);
                setShowRtcVoiceChat(false);
            } else if (modalContent.includes("음성통화")) {
                setShowRtcVoiceChat(true);
                setShowRtcChat(false);
            }
        };

        const handleModalDecline = () => {
            //setSendUser(modalContent.split("님이")[0]);
            handleDecline();

        }

        const handleSendDeclineModal = () => {
            setShowRtcVoiceChat(false);
            setShowDeclineModal(false);
        }


        // let socket;
        // useEffect(() => {
        //     console.log("receiver1");
        //     if (socket) {
        //         socket.onmessage = function (event) {
        //             const receivedMessage = event.data;
        //
        //             console.log("receivedMessage ::::" + receivedMessage );
        //             //일단 여기서 한 번 거르기
        //             setModalContent(receivedMessage);
        //             setShowModal(true);
        //
        //         };
        //     }
        // }, [socket]);

        const onPasswordChange = (newValue) => {
            setIsPasswordChangeDiv(newValue);
            setIsPasswordChangeDiv2(true);
        };

        const isPasswordChangeDivClose = (newValue) => {
            setIsPasswordChangeDiv(newValue);
            setIsPasswordChangeDiv2(true);
        };

        const isFriendsListZoom = (newValue) => {
            if (newValue) {
                setFriendsList(true);
            } else {
                setFriendsList(false);
            }
        };
        const FriendsNationally = (newValue) => {
            setFriendNationally(newValue);
        };
        const logoutApi = (newValue) => {
            if (newValue) {
                logout();
            }
        };
        const logoutApi2 = (newValue) => {
            if (newValue) {
                setIsPasswordChangeDiv(false);
                setIsPasswordChangeDiv2(true);
                logout();
            }
        };
        const logoutApi3 = (newValue) => {
            if (newValue) {
                logout();
            }
        };
        const logoutApiCate = (newValue) => {
            if (newValue) {
                logout();
            }
        };
        //패스워드 수정 창 띄우고 창 밖 클릭 시 창 닫힘
        useEffect(() => {
            if (isPasswordChangeDiv) {
                const onClick = (event) => {
                    handleOutsideClick(event);
                }
                setTimeout(() => document.addEventListener("click", onClick), 0);

                return () => {
                    document.removeEventListener("click", onClick);
                };
            }
        }, [isPasswordChangeDiv]);
        const handleOutsideClick = (event) => {
            if (passwordChangeDivRef.current && !passwordChangeDivRef.current.contains(event.target)) {
                setIsPasswordChangeDiv(false);
            }
        };

        const [dataFromChild, setDataFromChild] = useState(null);
        const [type2, setType2] = useState('');

        useEffect(() => {
            if (type2) {
                sendRequestToServer();
                console.log('유즈이펙트' + type2);
            }
        }, [type2]);


        useEffect(() => {
            const userName = localStorage.getItem('userName');
            let host = "";
            host = window.location.host;
            console.log(host)
            host = host.slice(0, -4);
            if (userName) {
                //const ws = new WebSocket(`wss://localhost:9002/test`)
                const ws = new WebSocket(`wss://${host}9002/test?userName=${userName}`);
                console.log("새로고침 - " + `wss://${host}9002/test?userName=${userName}`);
                setRtcUserName(userName);

                ws.onopen = (event) => {
                    console.log("WebSocket 연결 성공:", event);
                };

                ws.onmessage = (event) => {
                    console.log("서버로부터 메시지 수신:", event.data);
                };

                ws.onerror = (event) => {
                    console.error("WebSocket 오류 발생:", event);
                };

                ws.onclose = (event) => {
                    console.log("WebSocket 연결 종료:", event);
                };

                setSocket(ws);
            }
        }, []);  // 이 배열이 비어 있으므로 이 useEffect는 컴포넌트가 마운트될 때만 실행되게


        const localRoom = sendUser + "님과 " + receiverUser + "님의 음성채팅방"

        const handleDecline = async () => {

            try {
                const response = await fetch('/webrtc/decline', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sender: localStorage.getItem('userName'),  // 현재 유저 (거절한 사람)
                        receiver: sendUser, // 통화를 요청한 사람
                        roomId:localRoom,

                    })
                });

                if (response.ok) {
                    //setShowDeclineModal(true);
                    console.log("decline샌드유저 " + sendUser);
                    console.log("decline리시버유저" + receiverUser);
                    console.log("decline리시버유저 " + localStorage.getItem('userName'));
                    setChatType('');
                    console.log(type2);
                    console.log(localRoom);
                } else {
                    throw new Error(`Decline request failed with status: ${response.status}`);
                }
            } catch (error) {
                console.error("Error during decline request:", error);
            }

            // 모달 닫기
            setShowModal(false);
            setShowDeclineModal(false);
        };

        useEffect(() => {
            console.log("receiver2");
            if (socket) {
                socket.onmessage = function (event) {
                    let receivedMessage = event.data;
                    let sendLang = "";
                    console.log("receivedMessage ::::" + receivedMessage );
                    if (receivedMessage.includes("번역")) {
                        receivedMessage = receivedMessage.substring(2);
                        sendLang = receivedMessage.slice(0, 3);
                        receivedMessage = receivedMessage.substring(3);
                        console.log("번역 들어옴!");
                        const response = async () => {
                            try {
                            console.log("번역 요청 들어옴! : " + localStorage.getItem("language")?localStorage.getItem("language").toString():"Eng");
                                const response = await fetch('/rtc/translate', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        text: receivedMessage,
                                        lang: localStorage.getItem("language") ? localStorage.getItem("language").toString() : "Eng",
                                        sendLang: sendLang
                                    })
                                });

                                if (response.ok) {
                                    const blob = await response.blob(); // response를 blob으로 변환
                                    const audioUrl = URL.createObjectURL(blob); // Blob 객체를 사용하여 Object URL을 생성한다.

                                    // Object URL을 audio 태그의 src에 설정한다.
                                    const audioElement = document.createElement('audio');
                                    audioElement.src = audioUrl;
                                    audioElement.controls = true;  // 재생, 일시정지 등의 컨트롤을 활성화한다.

                                    // audio 태그를 DOM에 추가한다.
                                    document.body.appendChild(audioElement);

                                    // 재생한다.
                                    audioElement.play();
                                } else {
                                    throw new Error(`Decline request failed with status: ${response.status}`);
                                }
                            } catch (error) {
                                console.error("Error during decline request:", error);
                            }
                        }
                        response();
                    }
                    else if (receivedMessage.includes("거절")) {
                        // 거절 메시지를 받았을 때의 로직
                        setShowRtcChat(false);
                        setShowRtcVoiceChat(false);
                        setModalContent(receivedMessage);
                        //setShowModal(false);
                        setShowDeclineModal(true);
                        setChatType('');
                    } else {
                        // 기존의 메시지 처리 로직
                        setModalContent(receivedMessage);
                        setShowModal(true);
                    }
                };
            }
        }, [socket]);

        console.log("샌드유저 스테이트 확인값 @@@@@@@@@@@@@@@@@" + sendUser);
        console.log("리시버유버 스테이트 확인값 @@@@@@@@@@@@@@@@" + receiverUser);


        const sendRequestToServer = async () => {
            try {
                const response = await fetch('/webrtc/request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sender: localStorage.getItem('userName'),
                        receiver: receiverUser,
                        type:type2
                    })
                });

                console.log("요청샌더 " + sendUser);
                console.log("요청리시버 " + receiverUser);

                if (response.ok) {
                    console.log(type2+"타입ㅂㅂㅂㅂㅂㅂㅂㅂ");
                    console.log("api 호출 완료 request@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2")
                    if (type2 === "video") {
                        console.log("비디오테스트");
                        setShowRtcChat(true);
                        setShowRtcVoiceChat(false);
                    } else if (type2 === "voice") {
                        setShowRtcVoiceChat(true);
                        setShowRtcChat(false);
                    }
                } else {
                    throw new Error(`Logout failed with status: ${response.status}`);
                }
            } catch (error) {
                console.error("Error during logout:", error);
            }
        };

        const setChatType = (type) => {
            setType2(type);
        };

        const handleGrandchildData = (data) => {
            console.log(data+"1232132121");
            setDataFromChild(data);
            setReceiverUser(data);
            setSendUser(rtcUserName);
        };



        //로그인 로직
        const handleSubmit = async (e) => {
            let host = "";
            host = window.location.host;
            console.log(host)
            host = host.slice(0, -4);
            e.preventDefault();
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password}),
            });

            if (response.ok) {
                // 로그인 성공시 accessToken과 userName 저장
                const accessToken = response.headers.get('Authorization');
                const userName = response.headers.get('userName');
                localStorage.setItem('Authorization', accessToken);
                localStorage.setItem('userName', userName);
                console.log("로그인 사용자: " + userName);
                setRtcUserName(userName);

                if(username){
                    //const ws = new WebSocket(`wss://localhost:9002/test`)
                    const ws = new WebSocket(`wss://${host}9002/test?userName=${userName}`);

                    setSocket(ws)
                    // const ws = new WebSocket(`wss://localhost:9002/test?userName=${userName}`);
                    ws.onopen = (event) => {
                        console.log("WebSocket 연결 성공:", event);
                    };

                    // 다른 이벤트 리스너들도 추가할 수 있습니다.
                    ws.onmessage = (event) => {
                        console.log("서버로부터 메시지 수신:", event.data);
                    };

                    ws.onerror = (event) => {
                        console.error("WebSocket 오류 발생:", event);
                    };

                    ws.onclose = (event) => {
                        console.log("WebSocket 연결 종료:", event);
                    };
                }

                // setSocket(ws);
                // 페이지 이동
                setUsername('');
                setPassword('');
                setLoggedIn(true);
                setLoggedOut(false);
                if (rememberAccount) {
                    localStorage.setItem('savedUsername', username);
                    localStorage.setItem('savedPassword', password);
                } else {
                    localStorage.removeItem('savedUsername');
                    localStorage.removeItem('savedPassword');
                }
                home();
            } else {
                // 실패시 오류 메시지 설정
                setUsername('');
                setPassword('');
                setButtonText("ID OR PASSWORD ERROR");
                setLoggedIn(false);
                setLoggedOut(true);
            }
        };

        //회원가입 로직
        const handleSubmitSignUp = async (e) => {
            e.preventDefault();
            let userName = SginuserName;
            let userPwd = SignuserPwd;
            let userEmail = SignuserEmail;
            let userNickName = SignuserNickName;
            let userNationality = SignuserNationality;
            let userPhone = SignuserPhone;
            const response = await fetch('api/v1/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userName, userPwd, userEmail, userNickName, userNationality, userPhone}),
            });
            if (response.ok) {
                // 페이지 이동
                login();
            }
        };
        // 중복 확인 로직
        const idCheck = async () => {
            const IdCheck = await fetch('/api/v1/idCheck', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain', // 변경한 Content-Type
                },
                body: SginuserName, // JSON.stringify 제거
            });
            if (IdCheck.ok) {
                const response = await IdCheck.text();
                if (response == "ok") {
                    setIdCheckError(true);
                    setIdCheckError2(false);
                    // setIsSubmitDisabled(false); // 성공한 경우
                    setisIdCheckDisabled(false);
                } else if (response == "fail") {
                    setIdCheckError(false);
                    setIdCheckError2(true);
                    // setIsSubmitDisabled(true); // 실패한 경우
                    setisIdCheckDisabled(true);
                }
            }
        };
        //닉네임 중복 확인
        const NickNameCheck = async () => {
            const NickNameCheck = await fetch('/api/v1/nickNameCheck', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain', // 변경한 Content-Type
                },
                body: SignuserNickName, // JSON.stringify 제거
            });
            if (NickNameCheck.ok) {
                const response = await NickNameCheck.text();
                if (response == "ok") {
                    setNickNameCheckError(true);
                    setNickNameCheckError2(false);
                    setisNickNameCheckError(false);
                } else if (response == "fail") {
                    setNickNameCheckError(false);
                    setNickNameCheckError2(true);
                    setisNickNameCheckError(true);
                }
            }
        };
        const handleUsernameChange = (e) => {
            setIdCheckError(false);
            setIdCheckError2(false);
            setisIdCheckDisabled(true);

            const newUsername = e.target.value;
            setSignUsername(newUsername);
            // 아이디가 유효하지 않은 경우
            if (newUsername == "") {
                setIdCheckError(false);
                setIdCheckError2(false);
                setisIdCheckDisabled(true);
            } else if (!isValidId(newUsername)) {
                setIdCheckError(false);
                setIdCheckError2(true);
                // setIsSubmitDisabled(true);
                setisIdCheckDisabled(true);
            } else {
                setIdCheckError(false);
                setIdCheckError2(false);
                setisIdCheckDisabled(false);
            }
        };
        const handlePasswordChange = (e) => {
            const newPassword = e.target.value;
            setSignPassword(newPassword);

            // 비밀번호가 유효하지 않은 경우
            if (newPassword == "") {
                setPasswordCheck("At least 8 characters consisting of English and numbers, including 2 special characters");
            } else if (!isValidPassword(newPassword)) {
                setPasswordCheck("Validation Pass Failed");
                // setIsSubmitDisabled(true);
            } else {
                setPasswordCheck("Available PASSWORD");
            }
        };
        const handleEmailChange = (e) => {
            const newEmail = e.target.value;
            setSignEmail(newEmail);

            // 이메일이 유효하지 않은 경우
            if (newEmail == "") {
                setEmailCheckError(false);
                setEmailCheckError2(false);
            } else if (!isValidEmail(newEmail)) {
                setEmailCheckError(false);
                setEmailCheckError2(true);
                // setIsSubmitDisabled(true);
            } else {
                setEmailCheckError(true);
                setEmailCheckError2(false);

            }
        };
        const handleNickNameChange = (e) => {
            setNickNameCheckError(false);
            setNickNameCheckError2(false);
            setisNickNameCheckError(true);

            const newUserNickName = e.target.value;
            setSignuserNickName(newUserNickName);
            // 아이디가 유효하지 않은 경우
            if (newUserNickName == "") {
                setNickNameCheckError(false);
                setNickNameCheckError2(false);
                setisNickNameCheckError(true);
            } else if (!isValidNickName(newUserNickName)) {
                setNickNameCheckError(false);
                setNickNameCheckError2(true);
                // setIsSubmitDisabled(true);
                setisNickNameCheckError(true);
            } else {
                setNickNameCheckError(false);
                setNickNameCheckError2(false);
                setisNickNameCheckError(false);
            }
        };
        const handleCountryChange = (e) => {
            setSignuserNationality(e.target.value); // 선택된 나라 값을 상태변수에 저장
        };
        const handlePhoneChange = (e) => {
            const newPhone = e.target.value;
            setSignuserPhone(newPhone);

            // 핸드폰 번호가 유효하지 않은 경우
            if (newPhone == "") {
                setPhoneCheckError(false);
                setPhoneCheckError2(false);
            } else if (!isValidPhone(newPhone)) {
                setPhoneCheckError(false);
                setPhoneCheckError2(true);
            } else {
                setPhoneCheckError(true);
                setPhoneCheckError2(false);
            }
        };

        //아이디 유효성 검사
        const isValidId = (id) => {
            const idPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{7,10}$/;
            return idPattern.test(id);
        };
        //패스워드 유효성 검사
        const isValidPassword = (password) => {
            const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
            const countSpecialChar = (password.match(/[!@#$%^&*]/g) || []).length;
            return passwordPattern.test(password) && countSpecialChar >= 2;
        };
        //이메일 유효성 검사

        const isValidEmail = (email) => {
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailPattern.test(email);
        };
        const isValidPhone = (phone) => {
            const phonePattern = /^\d{9,12}$/
            return phonePattern.test(phone);
        };
        //닉네임 유효성 검사
        const isValidNickName = (nickName) => {
            const nickNamePattern = /^[a-zA-Z0-9]{1,10}$/;
            return nickNamePattern.test(nickName);
        };

        //에러 후에 인풋창 클릭 시 다시 로그인 버튼 텍스트 변경
        const resetButton = () => {
            setButtonText("LOGIN");
        };
        useEffect(() => {
            const token = localStorage.getItem('Authorization');
            setLoggedIn(!!token);
            setLoggedOut(!token);
        }, []);
        //토큰 검증 로직
        useEffect(() => {
            const verifyToken = async (retry = true) => {
                let islogin = false;

                if (localStorage.getItem('Authorization') === null) {
                    islogin = false;
                } else {
                    try {
                        const response = await fetch('/api/v1/accessToken', {
                            method: 'POST',
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
                            islogin = false;
                            logout();
                            return;
                        }
                        if (response.ok) {
                            islogin = true;
                        }
                    } catch (error) {
                        if (retry) {
                            await verifyToken(false);
                        }
                    }
                }
                setLoggedIn(islogin);
                setLoggedOut(!islogin);
            };

            verifyToken();
        }, []);

        //로그아웃 로직
        const logout = async () => {
            try {
                const response = await fetch('/api/v1/user/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': localStorage.getItem('Authorization'),
                    },
                });

                if (response.ok) {
                    localStorage.removeItem('Authorization');

                    alert("Logout");
                    setLoggedIn(false);
                    setLoggedOut(true);
                    try {
                        const response = await fetch('/webrtc/logout', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'text/plain'
                            },
                            body: localStorage.getItem('userName')
                        });

                        if (!response.ok) {
                            throw new Error(`Logout failed with status: ${response.status}`);
                        }

                        console.log("Logout successful");
                    } catch (error) {
                        console.error("Error during logout:", error);
                    }
                    localStorage.removeItem('userName');
                    home();

                } else {
                    throw new Error('Logout Fail');
                }
            } catch (error) {
                alert("Logout Fail");
            }
        };


        const CameraControl = ({targetPosition, cameraPosition}) => {
            const {camera} = useThree();
            const target = useRef(null);
            const position = useRef(null);

            useEffect(() => {
                if (targetPosition && cameraPosition) {
                    target.current = targetPosition.clone();
                    position.current = cameraPosition.clone();
                }
            }, [targetPosition, cameraPosition]);

            useFrame(() => {
                    if (target.current && position.current) {
                        if (!isAtInitialPosition) {
                            const EarthPosition = new THREE.Vector3(0, 0, 3);
                            const MypagePosition = new THREE.Vector3(0, -60, -30);
                            if (position.current.z == EarthPosition.z) {
                                camera.position.lerp(target.current, 0.06);
                                camera.lookAt(position.current);
                                if (camera.position.distanceTo(target.current) < 0.05) {
                                    setLoginZoom(0);
                                    setIsAtInitialPosition(true);
                                    setMouseLock(false);
                                } else {
                                    setIsAtInitialPosition(false);
                                }

                            } else if (position.current.y == MypagePosition.y && position.current.z == MypagePosition.z) {
                                camera.position.lerp(target.current, 0.03);
                                camera.lookAt(position.current);
                                if (camera.position.distanceTo(target.current) < 2.0) {
                                    if (isMapageZoom) {
                                        setMyPageDiv(true);
                                    }
                                    setLoginZoom(0);
                                    setIsAtInitialPosition(true);
                                    setMouseLock(false);
                                } else {
                                    setIsAtInitialPosition(false);
                                }
                            } else {
                                // 이동률에 따라 카메라를 이동시키고 목표를 바라봄
                                camera.position.lerp(target.current, 0.030);
                                camera.lookAt(position.current);
                                if (camera.position.distanceTo(target.current) < 2.1) {
                                    // 카메라가 움직임이 멈췄다면 실행
                                    if (isLoginZoom) {
                                        setLoginDiv(true);
                                    }

                                    if (isSignUpZoom) {
                                        setSignUpDiv(true);
                                    }
                                    setLoginZoom(2);
                                    setIsAtInitialPosition(true);
                                    setMouseLock(false);
                                } else {
                                    setIsAtInitialPosition(false);
                                }
                            }

                        }
                    }
                }
            )
            ;

            return null;
        };

        const login = () => {
            if (isLoginZoom) {
                return null;
            }
            const savedUsername = localStorage.getItem('savedUsername');
            const savedPassword = localStorage.getItem('savedPassword');
            if (savedUsername && savedPassword) {
                setUsername(savedUsername);
                setPassword(savedPassword);
                setRememberAccount(true);
            } else {
                setUsername("");
                setPassword("");
            }
            setButtonText("LOGIN");

            setTargetPosition(new THREE.Vector3(-35.147, 0, -63));
            setCameraPosition(new THREE.Vector3(-30, 0, -60));
            setIsLoginZoom(true);
            setIsSignUpZoom(false);
            setIsMapageZoom(false);
            setLoginZoom(0);
            setMainCamera(new THREE.Vector3(-30, 0, -60));
            setIsAtInitialPosition(false);
            setMouseLock(true);

            setSignUpDiv(false);
            setMyPageDiv(false);

        };
        const signup = () => {
            if (isSignUpZoom) {
                return null;
            }
            setSignUsername('');
            setSignPassword('');
            setSignEmail('');
            setSignuserNickName('');
            setSignuserNationality("");
            setSignuserPhone("");
            setIdCheckError(false);
            setEmailCheckError(false);
            setIdCheckError2(false);
            setNickNameCheckError(false);
            setNickNameCheckError2(false);
            setisNickNameCheckError(true);
            setisIdCheckDisabled(true);

            setTargetPosition(new THREE.Vector3(35.147, 0, -63));
            setCameraPosition(new THREE.Vector3(30, 0, -60));
            setIsSignUpZoom(true);
            setIsMapageZoom(false);
            setIsLoginZoom(false);
            setLoginZoom(0);
            setMainCamera(new THREE.Vector3(30, 0, -60));
            setIsAtInitialPosition(false);
            setMouseLock(true);

            setLoginDiv(false);
            setMyPageDiv(false);
        };
        const mypage = () => {
            if (isMapageZoom) {
                return null;
            }
            setTargetPosition(new THREE.Vector3(0, -67, -30));
            setCameraPosition(new THREE.Vector3(0, -60, -30));
            setIsMapageZoom(true);
            setIsLoginZoom(false);
            setIsSignUpZoom(false);
            setLoginZoom(0);
            setMainCamera(new THREE.Vector3(0, -60, -30));
            setIsAtInitialPosition(false);
            setMouseLock(true);

            setSignUpDiv(false);
            setLoginDiv(false);
            setShowRtcChat(false);
        }
        const home = () => {
            if (!isSignUpZoom && !isLoginZoom && !isMapageZoom) {
                return null;
            }
            setTargetPosition(new THREE.Vector3(0, 1.6, 6));
            setCameraPosition(new THREE.Vector3(0, 0, 3));
            setIsLoginZoom(false);
            setIsSignUpZoom(false);
            setIsMapageZoom(false);
            setLoginZoom(0);
            setMainCamera(new THREE.Vector3(0, 0, 3));
            setIsAtInitialPosition(false);
            setMouseLock(true);

            setMyPageDiv(false);
            setSignUpDiv(false);
            setLoginDiv(false);
            setShowRtcChat(false);
        };

        //로딩 전 메뉴바 숨기기
        const [isLoading, setIsLoading] = useState(true);
        useEffect(() => {
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }, []);

        function Fallback() {

            return (
                <>
                    <div className={"loading"}>
                        <div className="spinner"></div>
                    </div>
                </>
            );
        }

        console.log("home userList" + userList);

        return (
            <div className={"full"}>
                <Suspense fallback={<Fallback/>}>
                    <div className={"fullScreen"}>
                        <img
                            onClick={home}
                            className={`logo_main`}
                            style={isLoading ? {display: "none"} : {}}
                            src={Logo_no_text}
                        ></img>
                        <img
                            onClick={home}
                            className={`logo_main_text`}
                            style={isLoading ? {display: "none"} : {}}
                            src={Logo_text}
                        ></img>
                        <CanvasContainer>
                            <Canvas>
                                <CameraControl targetPosition={targetPosition} cameraPosition={cameraPosition}/>
                                <Earth
                                    mainCamera={mainCamera}
                                    isLoginZoom={isLoginZoom}
                                    isSignUpZoom={isSignUpZoom}
                                    LoginZoom={LoginZoom}
                                    mouseLock={mouseLock}
                                    loggedIn={loggedIn}
                                    loggedOut={loggedOut}
                                    isMapageZoom={isMapageZoom}
                                    FriendsList={FriendsList}
                                    isFriendsListZoom={isFriendsListZoom}
                                    FriendsNationally={FriendsNationally}
                                />
                            </Canvas>
                        </CanvasContainer>

                        <NotificationModal
                            show={showModal}
                            onHide={() => setShowModal(false)}
                            onAccept={handleModalConfirm}
                            onDecline={handleModalDecline}
                            message={modalContent}
                        />
                        <NotificationDeclineModal
                            show={showDeclineModal}
                            onHide={() => setShowDeclineModal(false)}
                            message={modalContent}
                            onDeclineAccept={handleSendDeclineModal}

                        />


                        <DivStyledMenu visible={MyPageDiv ? "visible" : ""}>
                            <MyPage
                                MyPageDiv={MyPageDiv}
                                onPasswordChange={onPasswordChange}
                                logoutApi={logoutApi}
                            />
                        </DivStyledMenu>

                        <DivStyledMenu2 visible={FriendsList ? "visible" : ""}>

                            <UserListContext.Provider value={{ userList, setUserList }}>
                                <FreindsList
                                    onData={handleGrandchildData}
                                    setChatType={setChatType}
                                    FriendsList={FriendsList}
                                    FriendNationally={FriendNationally}
                                    logoutApi3={logoutApi3}
                                    isOneOnOneChatDiv={isOneOnOneChatDiv}
                                />
                            </UserListContext.Provider>

                            {/*{dataFromChild && <p>받은 데이터: {dataFromChild}</p>}*/}
                        </DivStyledMenu2>

                        <DivStyled visible={isPasswordChangeDiv ? "visible" : isPasswordChangeDiv2 ? "" : "hidden"}
                                   ref={passwordChangeDivRef}>
                            <PasswordChange
                                isPasswordChangeDiv={isPasswordChangeDiv}
                                isPasswordChangeDivClose={isPasswordChangeDivClose}
                                logoutApi2={logoutApi2}
                            >
                            </PasswordChange>
                        </DivStyled>
                        <DivStyledMenu visible={LoginDiv ? "visible" : ""}>
                            {/* Content inside the loginDiv */}
                            <div className={"loginDiv"}>
                                <div className={"loginDiv_2"}>
                                    <div className={"LogoDiv"}>
                                        <img className={"LogoImg"} src={Logo}></img>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className={"loginForm2"} id={"id_Login_ID"}>
                                            <input
                                                className={"inputFromText"}
                                                placeholder={"Please enter your ID"}
                                                type='text'
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                onFocus={resetButton}
                                            />
                                        </div>
                                        <div className={"loginForm2"} id={"id_Login_PWD"}>
                                            <input
                                                className={"inputFromText"}
                                                placeholder={"Please enter your PASSWORD"}
                                                type='password'
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={resetButton}
                                            />
                                        </div>
                                        <div className={"loginForm_remmember"} id={"id_Remember_Account"}>
                                            <Checkbox
                                                className={"rememberAccountCheckbox"}
                                                type="checkbox"
                                                checked={rememberAccount}
                                                onChange={() => setRememberAccount(!rememberAccount)}
                                            />
                                            <label className={"label_remmember"} htmlFor={"rememberAccount"}>Remember
                                                Account</label>
                                        </div>
                                        <div className={"login_btn2"} id={"id_Login_BTN"}>
                                            <Button
                                                type="submit"
                                                className={buttonText === "ID OR PASSWORD ERROR" ? "error_text" : "no_error_text"}>
                                                {buttonText}</Button>
                                        </div>
                                    </form>

                                </div>
                            </div>
                        </DivStyledMenu>

                        {/*rtc*/}
                        <DivStyledMenu visible={showRtcChat}>
                            {showRtcChat && <ChatComponent sendUser={sendUser} receiverUser={receiverUser} setShowRtcChat={setShowRtcChat} type2={type2} setType2={setType2} onClose={handleRtcShowDragClose} lang={setLang}/>}
                        </DivStyledMenu>

                        <UserListContext.Provider value={{ userList, setUserList }}>
                            <DivStyledMenu visible={showRtcVoiceChat}>
                                {showRtcVoiceChat && <ChatVoiceComponent sendUser={sendUser} receiverUser={receiverUser} setShowRtcVoiceChat={setShowRtcVoiceChat} type2={type2} setType2={setType2} lang={setLang}/>}
                            </DivStyledMenu>
                        </UserListContext.Provider>

                        <DivStyledMenu visible={SignUpDiv ? "visible" : ""}>
                            {/* Content inside the loginDiv */}
                            <div className={"signDiv"}>
                                <div className={"signupDiv_2"}>
                                    <form onSubmit={handleSubmitSignUp}>
                                        <div className={"loginForm"} id={"id_ID"}>
                                            <input
                                                className={IdCheckError ? "yesIDinput" : IdCheckError2 ? "noIDinput" : "emptyID"}
                                                placeholder={"Please enter your ID"}
                                                type='text'
                                                value={SginuserName}
                                                onChange={handleUsernameChange}
                                            />
                                            <Button
                                                className={"checkbtn"}
                                                disabled={isIdCheckDisabled}
                                                type={"button"}
                                                onClick={idCheck}>Check
                                            </Button>
                                            <p className={"Text_sign"}>7 to 10 characters consisting of English letters and
                                                numbers</p>
                                        </div>
                                        <div className={"loginForm"} id={"id_PWD"}>
                                            <input
                                                className={"inputFromText"}
                                                placeholder={"Please enter your PASSWORD"}
                                                type='password'
                                                value={SignuserPwd}
                                                onChange={handlePasswordChange}
                                            />
                                            <p className={PasswordCheck === 'At least 8 characters consisting of English and numbers, including 2 special characters' ?
                                                "Text_sign" : PasswordCheck === "Available PASSWORD" ?
                                                    "Text_sign" : "Text_sign_Error_sign"
                                            }>{PasswordCheck}</p>
                                        </div>
                                        <div className={"loginForm"} id={"id_EMAIL"}>
                                            <input
                                                className={emailCheckError ? "inputFromText2" : emailCheckError2 ? "NoinputFromText"
                                                    : "emptyFromText"}
                                                placeholder={"Please enter your EMAIL"}
                                                type='text'
                                                value={SignuserEmail}
                                                onChange={handleEmailChange}
                                            />
                                        </div>
                                        <div className={"loginForm"} id={"id_NINKNAME"}>
                                            <input
                                                className={NickNameCheckError ? "yesIDinput2" : NickNameCheckError2 ? "noIDinput2" : "emptyID2"}
                                                placeholder={"Please enter your NICKNAME"}
                                                type='text'
                                                value={SignuserNickName}
                                                onChange={handleNickNameChange}
                                            />
                                            <Button
                                                className={"checkbtn"}
                                                disabled={isNickNameCheckError}
                                                type={"button"}
                                                onClick={NickNameCheck}>Check
                                            </Button>
                                            <p className={"Text_sign"}>
                                                Consists of 10 characters or less, with or without English or numbers</p>
                                        </div>
                                        <div className={"loginForm"} id={"id_NATIONALITY"}>
                                            <div className="custom_select_wrapper">
                                                <Select className={"custom_select"}
                                                        onChange={handleCountryChange}
                                                        id="demo-simple-select"
                                                        value={SignuserNationality || ' '}

                                                >
                                                    <MenuItem className={"menu_li_select"} value={" "} disabled>Please
                                                        select a COUNTRY</MenuItem>
                                                    <MenuItem className={"menu_li_select"} value={"KR"}>KR</MenuItem>
                                                    <MenuItem className={"menu_li_select"} value={"US"}>US</MenuItem>
                                                    <MenuItem className={"menu_li_select"} value="CA">CA</MenuItem>
                                                    {/* 캐나다 추가 */}
                                                    <MenuItem className={"menu_li_select"} value="JP">JP</MenuItem>
                                                    <MenuItem className={"menu_li_select"} value="CN">CN</MenuItem>
                                                    <MenuItem className={"menu_li_select"} value="PH">PH</MenuItem>
                                                    {/* 필리핀 추가 */}
                                                    <MenuItem className={"menu_li_select"} value="RU">RU</MenuItem>
                                                    {/* 러시아 추가 */}
                                                    <MenuItem className={"menu_li_select"} value="TW">TW</MenuItem>
                                                    {/* 대만 추가 */}
                                                    <MenuItem className={"menu_li_select"} value="UA">UA</MenuItem>
                                                    {/* 우크라이나 추가 */}
                                                    <MenuItem className={"menu_li_select"} value="AU">AU</MenuItem>
                                                    {/* 호주 추가 */}
                                                    <MenuItem className={"menu_li_select"} value="IT">IT</MenuItem>
                                                    {/* 이탈리아 추가 */}
                                                </Select>
                                            </div>
                                        </div>
                                        <div className={"loginForm"} id={"id_PHONE"}>
                                            <input
                                                className={phoneCheckError ? "inputFromText3" : phoneCheckError2 ? "NoinputFromText2"
                                                    : "emptyFromText2"}
                                                placeholder={"Please enter your PHONE"}
                                                type='text'
                                                value={SignuserPhone}
                                                onChange={handlePhoneChange}
                                            />
                                        </div>
                                        <div className={"login_btn"} id={"id_SignUp_BTN"}>
                                            <Button
                                                className={"SignUpBtn"}
                                                type='submit'
                                                disabled={PasswordCheck !== "Available PASSWORD"
                                                    || !IdCheckError || !emailCheckError || !NickNameCheckError || SignuserNationality == "" || !phoneCheckError
                                                }>SignUp
                                            </Button>
                                        </div>
                                    </form>

                                </div>
                            </div>
                        </DivStyledMenu>
                        <aside
                            className={`side-bar`}
                            style={isLoading ? {display: "none"} : {}}
                        >
                            <section className="side-bar__icon-box">
                                <section className="side-bar__icon-1">
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </section>
                            </section>
                            <ul>
                                <li className="menu_li"
                                    style={{marginTop: '20px'}}
                                >
                                    <a className="menu_a" onClick={home}>Home</a>
                                </li>
                                <li className="menu_li">
                                    {/*<a className="menu_a" onClick={Rtc}>Test</a>*/}
                                </li>
                                {loggedIn ? (
                                    <>
                                        <li className="menu_li">
                                            <a className="menu_a" id="menu_a2" onClick={mypage}>MyPage
                                            </a>
                                        </li>
                                        <li className="menu_li">
                                            <a className="menu_a">Chat</a>
                                            <ul className="menu_li">
                                                <li onClick={handleRandomShowDrag}
                                                    className={"menu_li_sub"}
                                                >
                                                    Random Chat
                                                </li>
                                                <li onClick={handleShowDrag}
                                                    className={"menu_li_sub"}
                                                >
                                                    Category Chat
                                                </li>
                                            </ul>
                                        </li>
                                        <li className="menu_li">
                                            <a className="menu_a" id="menu_a2" onClick={logout}>Logout
                                            </a>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="menu_li">
                                            <a className="menu_a" id="menu_a2" onClick={login}>Login
                                            </a>
                                        </li>
                                        <li className="menu_li">
                                            <a className="menu_a" onClick={signup}>SignUp</a>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </aside>
                        {/* 드래그 채팅창 사이드 밖 영역 */}
                        <RandomChatDrag show={randomChatDrag} logoutApiCate={logoutApiCate}
                                        onClose={handleRandomShowDragClose}/>
                        <OneOnOneChatDrag show={oneononeChatDrag} oneOnOneUserId={oneOnOneUserId} oneOnOneUserNickName={oneOnOneUserNickName} logoutApiCate={logoutApiCate}
                                          onClose={handleOneOnOneShowDragClose}/>
                        <CateChatDrag show={showDrag} logoutApiCate={logoutApiCate} onClose={handleDragClose}/>

                    </div>
                </Suspense>
            </div>
        );

    })
;

export default Home;
