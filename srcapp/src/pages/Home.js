import "./css/Home.css";
import './css/Fallback.css';
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
import Join from './Join';
import MyPage from './MyPage';
import PasswordChange from './PasswordChange';

const CanvasContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: black;
    // background-image: url(${Background});
  // background-repeat: no-repeat;
  // background-position: top center;
  // background-size: cover;
  // background-attachment: fixed;
`;

const slideDown = keyframes`
  0% {
    transform: scaleY(0);
  }
  100% {
    transform: scaleY(1);
  }
`;

const LoginDivStyled = styled.div`
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  animation: ${props => props.visible ? slideDown : 'none'} 0.3s ease-in-out;
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  transform: ${props => props.visible ? 'translate(-50%, -50%) scaleY(1)' : 'translate(-50%, -50%) scaleY(0)'};
  /* Add other CSS properties for the loginDiv here */
`;

const Home = () => {
        const [mainCamera, setMainCamera] = useState(new THREE.Vector3(0, 0, 3));
        const [zoom, setZoom] = useState(1.5);
        const [maxZoom, setMaxZoom] = useState(4);
        const [isLoginZoom, setIsLoginZoom] = useState(false);
        const [isSignUpZoom, setIsSignUpZoom] = useState(false);
        const [isMapageZoom, setIsMapageZoom] = useState(false);
        const [LoginZoom, setLoginZoom] = useState(0);
        const [mouseLock, setMouseLock] = useState(false);

        const [targetPosition, setTargetPosition] = useState(null);
        const [cameraPosition, setCameraPosition] = useState(null);
        //카메라 초기 위치로 돌아갔는지 확인
        const [isAtInitialPosition, setIsAtInitialPosition] = useState(false);

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
        //패스워드 수정 창 외의 화면 클릭 시 상태
        const passwordChangeDivRef = useRef(null);
        const onPasswordChange = (newValue) => {
            setIsPasswordChangeDiv(newValue);
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
                // 페이지 이동
                setUsername('');
                setPassword('');
                setLoggedIn(true);
                setLoggedOut(false);
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
            if(newUsername == ""){
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
            if(newEmail == ""){
                setEmailCheckError(false);
                setEmailCheckError2(false);
            }else if (!isValidEmail(newEmail)) {
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
            if(newUserNickName == ""){
                setNickNameCheckError(false);
                setNickNameCheckError2(false);
                setisNickNameCheckError(true);
            }else if (!isValidNickName(newUserNickName)) {
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
            if(newPhone == ""){
                setPhoneCheckError(false);
                setPhoneCheckError2(false);
            }else if (!isValidPhone(newPhone)) {
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
            const verifyToken = async () => {
                let islogin = false;

                if (localStorage.getItem('Authorization') === null) {
                    islogin = false;
                } else {
                    try {
                        const response = await fetch('/api/v1/accessToken', {
                            method: 'POST',
                            headers: {
                                Authorization: localStorage.getItem('Authorization'),
                            },
                        });

                        if (response.ok) {
                            const responseBody = await response.text();
                            if (responseBody == "엑세스") {
                                islogin = true;
                            } else {
                                const refreshTokenResponse = await fetch('/api/v1/refreshToken', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'text/plain', // 변경한 Content-Type
                                    },
                                    body: localStorage.getItem('userName'), // JSON.stringify 제거
                                });

                                if (refreshTokenResponse.ok) {
                                    const jwtToken = refreshTokenResponse.headers.get('Authorization');
                                    localStorage.setItem('Authorization', jwtToken);
                                    islogin = true;
                                } else {
                                    const response = await fetch('/api/v1/logout', {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': localStorage.getItem('Authorization'),
                                        },
                                    });

                                    if (response.ok) {
                                        localStorage.removeItem('Authorization');
                                        localStorage.removeItem('userName');
                                        alert("Login Timeout");
                                        islogin = false;
                                        home();
                                    } else {
                                        throw new Error('Logout Fail');
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        islogin = false;
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
                    localStorage.removeItem('userName');
                    alert("Logout Success");
                    setLoggedIn(false);
                    setLoggedOut(true);
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
                        const distance = camera.position.distanceTo(target.current);
                        // 카메라 이동률을 거리에 따라 부드럽게 줄이는 식을 만듭니다.
                        let moveSpeed = 0.07;
                        if (distance < 10) {
                            moveSpeed = 0.02;
                        }
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
                                if (camera.position.distanceTo(target.current) < 2.0000000000010001) {
                                    setMyPageDiv(true);
                                    setLoginZoom(0);
                                    setIsAtInitialPosition(true);
                                    setMouseLock(false);
                                } else {
                                    setIsAtInitialPosition(false);
                                }
                            } else {
                                // 이동률에 따라 카메라를 이동시키고 목표를 바라봅니다.
                                camera.position.lerp(target.current, 0.025);
                                camera.lookAt(position.current);
                                if (camera.position.distanceTo(target.current) < 2.1) {

                                    // 카메라가 움직임이 거의 멈췄다면 실행되는 조건문을 작성합니다.
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

// useEffect(() => {
//     fetch("/api/v1/hello")
//         .then((response) => {
//             return response.json();
//         })
//         .then(function (data) {
//             setMessage(data);
//         });
// }, []);

        const login = () => {
            if (isLoginZoom) {
                return null;
            }
            setButtonText("LOGIN");
            setTargetPosition(new THREE.Vector3(-35.147, 0, -63));
            setCameraPosition(new THREE.Vector3(-30, 0, -60));
            setZoom(1.5);
            setMaxZoom(2);
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

            setisIdCheckDisabled(true);

            setTargetPosition(new THREE.Vector3(35.147, 0, -63));
            setCameraPosition(new THREE.Vector3(30, 0, -60));
            setZoom(1.5);
            setMaxZoom(2);
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
            setZoom(1.5);
            setMaxZoom(4);
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
            setZoom(1.5);
            setMaxZoom(4);
            setIsLoginZoom(false);
            setIsSignUpZoom(false);
            setIsMapageZoom(false);
            setLoginZoom(0);
            setMainCamera(new THREE.Vector3(0, 0, 3));
            setIsAtInitialPosition(false);
            setMouseLock(true);

            setSignUpDiv(false);
            setLoginDiv(false);
            setMyPageDiv(false);
        };

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
            <div>
                <div className={"fullScreen"}>
                    <img onClick={home} className={"logo_main"} src={Logo_no_text}></img>
                    <img onClick={home} className={"logo_main_text"} src={Logo_text}></img>
                    <Suspense fallback={<Fallback/>}>
                        <CanvasContainer>
                            <Canvas>
                                <CameraControl targetPosition={targetPosition} cameraPosition={cameraPosition}/>
                                <Earth
                                    mainCamera={mainCamera}
                                    zoom={zoom}
                                    maxZoom={maxZoom}
                                    isLoginZoom={isLoginZoom}
                                    LoginZoom={LoginZoom}
                                    mouseLock={mouseLock}
                                    loggedIn={loggedIn}
                                    loggedOut={loggedOut}
                                    isMapageZoom={isMapageZoom}
                                />
                            </Canvas>
                        </CanvasContainer>
                    </Suspense>
                    <LoginDivStyled visible={MyPageDiv ? "visible" : ""}>
                        {/* Content inside the loginDiv */}
                        <MyPage
                            MyPageDiv={MyPageDiv}
                            onPasswordChange={onPasswordChange}/>
                    </LoginDivStyled>
                    {/*<LoginDivStyled visible={isPasswordChangeDiv ? "visible" : ""} ref={passwordChangeDivRef}>*/}
                    <LoginDivStyled visible={isPasswordChangeDiv ? "visible" : ""} ref={passwordChangeDivRef}>
                        {/* Content inside the loginDiv */}
                        <PasswordChange isPasswordChangeDiv={isPasswordChangeDiv}></PasswordChange>
                    </LoginDivStyled>
                    <LoginDivStyled visible={LoginDiv ? "visible" : ""}>
                        {/* Content inside the loginDiv */}
                        <div className={"loginDiv"}>
                            <div className={"loginDiv_2"}>
                                <div className={"LogoDiv"}>
                                    <img className={"LogoImg"} src={Logo}></img>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className={"loginForm"} id={"id_Login_ID"}>
                                        <input
                                            className={"inputFromText"}
                                            placeholder={"Please enter your ID"}
                                            type='text'
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onFocus={resetButton}
                                        />
                                    </div>
                                    <div className={"loginForm"} id={"id_Login_PWD"}>
                                        <input
                                            className={"inputFromText"}
                                            placeholder={"Please enter your PASSWORD"}
                                            type='password'
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={resetButton}
                                        />
                                    </div>
                                    <div className={"login_btn"} id={"id_Login_BTN"}>
                                        <button
                                            type="submit"
                                            className={buttonText === "ID OR PASSWORD ERROR" ? "error_text" : "no_error_text"}>
                                            {buttonText}
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </LoginDivStyled>
                    <LoginDivStyled visible={SignUpDiv ? "visible" : ""}>
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
                                        <button
                                            disabled={isIdCheckDisabled}
                                            type={"button"}
                                            onClick={idCheck}>Check
                                        </button>
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
                                        <button
                                            disabled={isNickNameCheckError}
                                            type={"button"}
                                            onClick={NickNameCheck}>Check
                                        </button>
                                        <p className={"Text_sign"}>
                                            Consists of 10 characters or less, with or without English or numbers</p>
                                    </div>
                                    <div className={"loginForm"} id={"id_NATIONALITY"}>
                                        <div className="custom_select_wrapper">
                                            <select className={"custom_select"} onChange={handleCountryChange}
                                                    value={SignuserNationality}>
                                                <option value="" hidden disabled>Please select a COUNTRY</option>
                                                <option value="KR">KR</option>
                                                <option value="US">US</option>
                                                <option value="CA">CA</option>
                                                {/* 캐나다 추가 */}
                                                <option value="JP">JP</option>
                                                <option value="CN">CN</option>
                                                <option value="PH">PH</option>
                                                {/* 필리핀 추가 */}
                                                <option value="RU">RU</option>
                                                {/* 러시아 추가 */}
                                                <option value="TW">TW</option>
                                                {/* 대만 추가 */}
                                                <option value="UA">UA</option>
                                                {/* 우크라이나 추가 */}
                                                <option value="AU">AU</option>
                                                {/* 호주 추가 */}
                                                <option value="IT">IT</option>
                                                {/* 이탈리아 추가 */}
                                            </select>
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
                                        <button
                                            className={"SignUpBtn"}
                                            type='submit'
                                            disabled={PasswordCheck !== "Available PASSWORD"
                                                || !IdCheckError || !emailCheckError || !NickNameCheckError || SignuserNationality == "" || !phoneCheckError
                                            }>SignUp
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </LoginDivStyled>
                    <aside className="side-bar">
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
            </div>
        );
    }
;

export default Home;