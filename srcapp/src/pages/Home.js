import {Link} from 'react-router-dom';
import "../pages/Home.css";
import React, {useRef, useState, useEffect} from "react";
import styled from "styled-components";
import {Earth} from "../components/earth/index";
import {useFrame, useThree, Canvas} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import {Suspense} from "react";
import * as THREE from "three";
import {keyframes} from 'styled-components';
import styles from "./Login.module.css";
import Logo from "../img/logo.png";

const CanvasContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: black;
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
        const [LoginZoom, setLoginZoom] = useState(0);
        const [mouseLock, setMouseLock] = useState(false);

        const [targetPosition, setTargetPosition] = useState(null);
        const [cameraPosition, setCameraPosition] = useState(null);
        //카메라 초기 위치로 돌아갔는지 확인
        const [isAtInitialPosition, setIsAtInitialPosition] = useState(false);

        //로그인 및 회원가입 화면 창 띄우기
        const [LoginDiv, setLoginDiv] = useState(false);
        const [SignUpDiv, setSignUpDiv] = useState(false);

        //로그인
        const [loggedIn, setLoggedIn] = useState(false); //로그인 상태확인
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const [buttonText, setButtonText] = useState("LOGIN");

        //회원가입
        const [SginuserName, setSignUsername] = useState('');
        const [SignuserPwd, setSignPassword] = useState('');
        const [SignuserEmail, setSignEmail] = useState('');
        const [IdCheckError, setIdCheckError] = useState(false);
        const [IdCheckError2, setIdCheckError2] = useState(false);
        const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); // 추가한 상태
        const [isIdCheckDisabled, setisIdCheckDisabled] = useState(true);
        const [PasswordCheck, setPasswordCheck] = useState("At least 8 characters consisting of English and numbers, including 2 special characters");
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
                home();
            } else {
                // 실패시 오류 메시지 설정
                setUsername('');
                setPassword('');
                setButtonText("ID or PASSWORD error");
                setLoggedIn(false);
            }
        };
        //회원가입 로직
        const handleSubmitSignUp = async (e) => {
            e.preventDefault();
            let userName = SginuserName;
            let userPwd = SignuserPwd;
            let userEmail = SignuserEmail;
            const response = await fetch('api/v1/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName, userPwd, userEmail}),
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
            if(IdCheck.ok) {
                const response = await IdCheck.text();
                if (response == "ok") {
                    setIdCheckError(true);
                    setIdCheckError2(false);
                    setIsSubmitDisabled(false); // 성공한 경우
                    setisIdCheckDisabled(false);
                } else if (response == "fail") {
                    setIdCheckError(false);
                    setIdCheckError2(true);
                    setIsSubmitDisabled(true); // 실패한 경우
                    setisIdCheckDisabled(true);
                }
            }
        };
        const handleUsernameChange = (e) => {
            setIdCheckError(false);
            setIdCheckError2(false);
            setIsSubmitDisabled(true); // 사용자 이름을 수정할 때마다 중복 확인 해제
            setisIdCheckDisabled(true);

            const newUsername = e.target.value;
            setSignUsername(newUsername);
            // 아이디가 유효하지 않은 경우
            if (!isValidId(newUsername)) {
                setIdCheckError(false);
                setIdCheckError2(true);
                setIsSubmitDisabled(true);
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
            if (!isValidPassword(newPassword)) {
                setPasswordCheck("Validation Pass Failed");
                setIsSubmitDisabled(true);
            } else {
                setPasswordCheck("At least 8 characters consisting of English and numbers, including 2 special characters");
            }
        };
        const isValidId = (id) => {
            const idPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{7,}$/;
            return idPattern.test(id);
        };
        const isValidPassword = (password) => {
            const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
            const countSpecialChar = (password.match(/[!@#$%^&*]/g) || []).length;
            return passwordPattern.test(password) && countSpecialChar >= 2;
        };
        //에러 후에 인풋창 클릭 시 다시 로그인 버튼 텍스트 변경
        const resetButton = () => {
            setButtonText("LOGIN");
        };
        useEffect(() => {
            const token = localStorage.getItem('Authorization');
            setLoggedIn(!!token);
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
                                        alert("로그인 시간 만료.");
                                        islogin = false;
                                    } else {
                                        throw new Error('로그아웃 실패.');
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        islogin = false;
                    }
                }
                setLoggedIn(islogin);
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
                    alert("로그아웃 완료.");
                    setLoggedIn(false);
                } else {
                    throw new Error('로그아웃 실패.');
                }
            } catch (error) {
                alert("로그아웃 실패.");
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
                            if (position.current.z == EarthPosition.z) {
                                camera.position.lerp(target.current, 0.06);
                                camera.lookAt(position.current);
                                console.log(camera.position.distanceTo(target.current));
                                if (camera.position.distanceTo(target.current) < 0.05) {
                                    console.log("loginzoom : " + isLoginZoom);
                                    console.log("SignUpZoom : " + isSignUpZoom);
                                    setLoginZoom(0);
                                    setIsAtInitialPosition(true);
                                    setMouseLock(false);
                                } else {
                                    setIsAtInitialPosition(false);
                                }
                            } else {
                                camera.position.lerp(target.current, 0.03);
                                camera.lookAt(position.current);
                                console.log(camera.position.distanceTo(target.current))
                                if (camera.position.distanceTo(target.current) <= 3.841278) {
                                    console.log("loginzoom : " + isLoginZoom);
                                    console.log("SignUpZoom : " + isSignUpZoom);
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
            setTargetPosition(new THREE.Vector3(-35.147, 0, -63));
            setCameraPosition(new THREE.Vector3(-30, 0, -60));
            setZoom(1.5);
            setMaxZoom(2);
            setIsLoginZoom(true);
            setIsSignUpZoom(false);
            setLoginZoom(0);
            setMainCamera(new THREE.Vector3(-30, 0, -60));
            setIsAtInitialPosition(false);
            setMouseLock(true);

            setSignUpDiv(false);
        };
        const signup = () => {
            if (isSignUpZoom) {
                return null;
            }
            setSignUsername('');
            setSignPassword('');
            setSignEmail('');
            setIdCheckError(false);
            setIdCheckError2(false);
            setIsSubmitDisabled(true);
            setisIdCheckDisabled(true);

            setTargetPosition(new THREE.Vector3(35.147, 0, -63));
            setCameraPosition(new THREE.Vector3(30, 0, -60));
            setZoom(1.5);
            setMaxZoom(2);
            setIsSignUpZoom(true);
            setIsLoginZoom(false);
            setLoginZoom(0);
            setMainCamera(new THREE.Vector3(30, 0, -60));
            setIsAtInitialPosition(false);
            setMouseLock(true);

            setLoginDiv(false);
        };
        const home = () => {
            if (!isSignUpZoom && !isLoginZoom) {
                return null;
            }
            setTargetPosition(new THREE.Vector3(0, 0, 6));
            setCameraPosition(new THREE.Vector3(0, 0, 3));
            setZoom(1.5);
            setMaxZoom(4);
            setIsLoginZoom(false);
            setIsSignUpZoom(false);
            setLoginZoom(0);
            setMainCamera(new THREE.Vector3(0, 0, 3));
            setIsAtInitialPosition(false);
            setMouseLock(true);

            setSignUpDiv(false);
            setLoginDiv(false);
        };

        return (
            <div>
                <div className={"fullScreen"}>
                    <CanvasContainer>
                        {/* <TopSection /> */}
                        <Canvas>
                            <Suspense fallback={null}>
                                <CameraControl targetPosition={targetPosition} cameraPosition={cameraPosition}/>
                                <Earth mainCamera={mainCamera}
                                       zoom={zoom}
                                       maxZoom={maxZoom}
                                       isLoginZoom={isLoginZoom}
                                       LoginZoom={LoginZoom}
                                       mouseLock={mouseLock}
                                       loggedIn={loggedIn}
                                ></Earth>
                            </Suspense>
                        </Canvas>
                    </CanvasContainer>
                    <LoginDivStyled visible={LoginDiv}>
                        {/* Content inside the loginDiv */}
                        <div className={"loginDiv"}>
                            <div className={"loginDiv_2"}>
                                <div className={"LogoDiv"}>
                                    <img className={"LogoImg"} src={Logo}></img>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className={"loginForm"}>
                                        <input
                                            placeholder={"Please enter your ID"}
                                            type='text'
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onFocus={resetButton}
                                        />
                                    </div>
                                    <div className={"loginForm"}>
                                        <input
                                            placeholder={"Please enter your PASSWORD"}
                                            type='password'
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={resetButton}
                                        />
                                    </div>
                                    <div className={"login_btn"}>
                                        <button
                                            type="submit"
                                            className={buttonText === "ID or PASSWORD error" ? "error_text" : "no_error_text"}>
                                            {buttonText}
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </LoginDivStyled>
                    <LoginDivStyled visible={SignUpDiv}>
                        {/* Content inside the loginDiv */}
                        <div className={"loginDiv"}>
                            <div className={"signupDiv_2"}>
                                <form onSubmit={handleSubmitSignUp}>
                                    <div className={"loginForm"} id={"id_ID"}>
                                        <input
                                            className={IdCheckError ? "yesIDinput" : IdCheckError2 ? "noIDinput" : "emptyID"}
                                            placeholder={"Please enter your ID"}
                                            type='text'
                                            value={SginuserName}
                                            onChange={handleUsernameChange}                                            onFocus={resetButton}
                                        />
                                        <button
                                            disabled={isIdCheckDisabled}
                                            type={"button"}
                                            onClick={idCheck}>Check</button>
                                        <p className={"Text_sign"}>At least 7 characters consisting of English and numbers</p>
                                    </div>
                                    <div className={"loginForm"} id={"id_PWD"}>
                                        <input
                                            className={"inputFromText"}
                                            placeholder={"Please enter your PASSWORD"}
                                            type='password'
                                            value={SignuserPwd}
                                            onChange={handlePasswordChange}                                         onFocus={resetButton}
                                        />
                                        <p className={PasswordCheck === 'At least 8 characters consisting of English and numbers, including 2 special characters' ?
                                            "Text_sign" : "Text_sign_Error"
                                        }>{PasswordCheck}</p>
                                    </div>
                                    <div className={"loginForm"} >
                                        <input
                                            className={"inputFromText"}
                                            placeholder={"Please enter your EMAIL"}
                                            type='text'
                                            value={SignuserEmail}
                                            onChange={(e) => setSignEmail(e.target.value)}                                            onFocus={resetButton}
                                        />
                                    </div>
                                    <div className={"login_btn"}>
                                        <button
                                            className={"SignUpBtn"}
                                            type='submit'
                                            disabled={isSubmitDisabled}>SignUp</button>
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