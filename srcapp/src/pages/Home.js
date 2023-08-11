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

import {Earth} from "../components/earth/index";
import MyPage from './MyPage';
import FreindsList from './FreindsList';
import PasswordChange from './PasswordChange';
import CateChat from './CateChat';
import ChatComponent from "../components/rtc/rtcChat";


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


const Home = () => {
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
        const [rtcUserName, setRtcUserName] = useState(null);

        // let rtcUserName = "";
        const Rtc = () => {
            setShowRtcChat(true); // RtcChat 상태를 true로 설정
        }

        useEffect(() => {
            console.log(isPasswordChangeDiv2);
        }, [isPasswordChangeDiv2]);
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
        //패스워드 수정 창 띄우고 창 밖 클릭 시 창 닫힘
        useEffect(() => {
            const handleOutsideClick = (event) => {
                if (passwordChangeDivRef.current && !passwordChangeDivRef.current.contains(event.target)) {
                    setIsPasswordChangeDiv(false);
                }
            };
            if (isPasswordChangeDiv) {
                document.addEventListener("click", handleOutsideClick);
            }
            return () => {
                document.removeEventListener("click", handleOutsideClick);
            };
        }, [isPasswordChangeDiv]);


        const [dataFromChild, setDataFromChild] = useState(null);

        const handleGrandchildData = async (data) => {
            console.log("자식의 자식 컴포넌트로부터 받은 데이터:", data);
            setDataFromChild(data);
            setRtcUserName(data)
            try {
                const response = await fetch('/webrtc/request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: JSON.stringify({
                        sender: localStorage.getItem('userName'),
                        receiver: localStorage.getItem(data)
                    })
                });

                if (!response.ok) {
                    throw new Error(`Logout failed with status: ${response.status}`);
                }

                console.log("Logout successful");
            } catch (error) {
                console.error("Error during logout:", error);
            }
            setShowRtcChat(true);
        };


        //로그인 로직
        const handleSubmit = async (e) => {
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
                const socket = new WebSocket(`wss://192.168.0.187:9002/test?userName=${userName}`);
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
                        <div className={"loading_2"}>
                            <p className={"loading_text"}>Loading ...</p>
                            <div className="spinner">
                                <div className="spinner-text"></div>
                            </div>
                        </div>
                    </div>
                </>
            );
        }

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

                        <DivStyledMenu visible={MyPageDiv ? "visible" : ""}>
                            <MyPage
                                MyPageDiv={MyPageDiv}
                                onPasswordChange={onPasswordChange}
                                logoutApi={logoutApi}
                            />
                        </DivStyledMenu>
                        <DivStyledMenu2 visible={FriendsList ? "visible" : ""}>
                            <FreindsList
                                onData={handleGrandchildData}
                                FriendsList={FriendsList}
                                FriendNationally={FriendNationally}
                                logoutApi3={logoutApi3}
                            />
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
                        {/*<DivStyledMenu visible={"visible"}>*/}
                        {/*    <CateChat*/}
                        {/*    >*/}
                        {/*    </CateChat>*/}
                        {/*</DivStyledMenu>*/}
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
                            {showRtcChat && rtcUserName && <ChatComponent rtcUserName={rtcUserName}/>}
                        </DivStyledMenu>

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
                                <li className="menu_li">
                                    <a className="menu_a" onClick={home}>Home</a>
                                </li>
                                <li className="menu_li">
                                    <a className="menu_a" onClick={Rtc}>Test</a>
                                </li>
                                {loggedIn ? (
                                    <>
                                        <li className="menu_li">
                                            <a className="menu_a" id="menu_a2" onClick={mypage}>MyPage
                                            </a>
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
                                {/*<li className="menu_li">*/}
                                {/*    <a className="menu_a" href="/user/list">사원조회</a>*/}
                                {/*</li>*/}
                                {/*<li className="menu_li">*/}
                                {/*    <a className="menu_a">메신저</a>*/}
                                {/*    <ul>*/}
                                {/*        <li className="menu_li_li"><a style="cursor: pointer" onClick="openRoomWindow(event)"*/}
                                {/*                                      className="menu_text">자유 대화방</a></li>*/}
                                {/*        <!--                    <li class="menu_li_li"><a style="cursor: pointer" onclick="messagePage()" class="menu_text">1:1 대화방</a></li>-->*/}
                                {/*    </ul>*/}
                                {/*</li>*/}
                            </ul>
                        </aside>
                    </div>
                </Suspense>
            </div>
        );
    }
;

export default Home;