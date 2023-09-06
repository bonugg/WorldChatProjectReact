import React, {useEffect, useRef, useState} from "react";
import Profile from "../img/profile.png";
import "./css/Home.css";
import Button from "@mui/material/Button";
import "./css/Mypage.css";
import home from "./Home";
import axios from "axios";
import FriendsReceivedListItem from "./FriendsReceivedListItem";
import FriendsRequestedListItem from "./FriendsRequestedListItem";
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import PasswordChange from "./PasswordChange";
import styled, {keyframes} from "styled-components";

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
  animation: ${props => props.visible === "visible" ? slideDown : props.visible === "" ? slideUp : 'hidden'} 0.35s ease-in-out;
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  z-index: 2;
  transform: ${props => props.visible === "visible" ? 'translate(-50%, -50%) scaleY(1)' : 'translate(-50%, -50%) scaleY(0)'};
  /* Add other CSS properties for the loginDiv here */
`;

const MyPage = React.memo(({
                               onRemove,
                               MyPageDiv,
                               logoutApi,
                               homeMyGo,
                               FriendsReqested,
                               FriendsReceived,
                               MyPageG
                           }) => {
        //패스워드 수정 버튼 클릭 상태
        const [isPasswordChangeDiv, setIsPasswordChangeDiv] = useState(false);
        const [isPasswordChangeDiv2, setIsPasswordChangeDiv2] = useState(false);
        //패스워드 수정 창 외의 화면 클릭 시 상태
        const passwordChangeDivRef = useRef(null);
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
        const isPasswordChangeDivClose = (newValue) => {
            setIsPasswordChangeDiv(newValue);
            setIsPasswordChangeDiv2(true);
        };
        //마이페이지
        const [MypageuserName, setMypageuserName] = useState('');
        const [MypageuserNickName, setMypageuserNickName] = useState('');
        const [MypageuserNationality, setMypageuserNationality] = useState('');
        const [MypageuserEmail, setMypageuserEmail] = useState('');
        const [MypageuserPhone, setMypageuserPhone] = useState('');
        const [textAreaValue, setTextAreaValue] = useState("");
        const [MypageuserProfileName, setMypageuserProfileName] = useState("");
        const [MypageuserProfileOriginName, setMypageuserProfileOriginName] = useState("");
        const [messageButtonText, setMessageButtonText] = useState("Change Message");
        const [profileButtonText, setProfileButtonText] = useState("Change Picture");

        const [mypageOnClick, setMypageOnClick] = useState(false);
        const [friendsReceivedOnClick, setFriendsReceivedOnClick] = useState(false);
        const [friendsRequesteddOnClick, setFriendsRequesteddOnClick] = useState(false);

        const [receivedList, setReceivedList] = useState([]);
        const [requetedList, setRequestedList] = useState([]);

        useEffect(() => {
            if (MyPageG) {
                setMypageOnClick(true);
                setFriendsReceivedOnClick(false);
                setFriendsRequesteddOnClick(false);
            }
        }, [MyPageG]);
        useEffect(() => {
            if (FriendsReceived) {
                setMypageOnClick(false);
                setFriendsReceivedOnClick(true);
                setFriendsRequesteddOnClick(false);
            }
        }, [FriendsReceived]);
        useEffect(() => {
            if (FriendsReqested) {
                setMypageOnClick(false);
                setFriendsReceivedOnClick(false);
                setFriendsRequesteddOnClick(true);
            }
        }, [FriendsReqested]);
        useEffect(() => {
            if (homeMyGo) {
                userInfo();
            }
        }, [homeMyGo]);


        //친구 요청을 승인하거나 거절한 항목 삭제
        const removeItemFromList = (id) => {
            setReceivedList(prevList => prevList.filter(item => item.id != id));
            onRemove(id);
        }
        const removeItemFromList2 = (id) => {
            setRequestedList(prevList => prevList.filter(item => item.id != id));
        }

        useEffect(() => {
            if (friendsReceivedOnClick) {
                const getReceivedListAxios = async () => {
                    try {
                        const response = await axios.get('/friends/received-list', {
                            headers: {
                                Authorization: `${localStorage.getItem('Authorization')}`
                            }
                        });
                        if (response.data && response.data.items) {
                            setReceivedList(() => response.data.items);
                        }
                    } catch (e) {
                    }
                }
                getReceivedListAxios();
            }
        }, [friendsReceivedOnClick]);

        useEffect(() => {
            if (friendsRequesteddOnClick) {
                const getRequestedListAxios = async () => {
                    try {
                        const response = await axios.get('/friends/requested-list', {
                            headers: {
                                Authorization: `${localStorage.getItem('Authorization')}`
                            }
                        });
                        if (response.data && response.data.items) {
                            setRequestedList(() => response.data.items);
                        }
                    } catch (e) {
                    }
                }
                getRequestedListAxios();
            }
        }, [friendsRequesteddOnClick]);


        const userInfo = async (retry = true) => {
            setPreviewImage(null);
            setSelectedFile(null);
            setMypageuserName("loading...");
            setMypageuserEmail("loading...");
            setMypageuserPhone("loading...");
            setMypageuserNationality("loading...");
            setMypageuserNickName("loading...");
            setTextAreaValue("loading...");
            setMypageuserProfileName(null);
            setMypageuserProfileOriginName(null);
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
                    logoutApi(true); // Home.js에 이벤트 전달
                    return;
                }
                if (response.ok) {
                    const data = await response.json(); // 데이터를 JSON 객체로 변환
                    setMypageuserName(data.user.userName);
                    setMypageuserEmail(data.user.userEmail);
                    setMypageuserPhone(data.user.userPhone);
                    setMypageuserNationality(data.user.userNationality);
                    setMypageuserNickName(data.user.userNickName);
                    setTextAreaValue(data.user.userMessage);
                    setMypageuserProfileName(data.user.userProfileName);
                    setMypageuserProfileOriginName(data.user.userProfileOrigin);
                }
            } catch (error) {
                if (retry) {
                    await userInfo(false);
                }
            }
        };

        useEffect(() => {
            if (MyPageDiv) {

            }
        }, [MyPageDiv]);

//패스워드 수정 버튼 클릭 시 동작
        const passwordChangeDiv = () => {
            setIsPasswordChangeDiv(true);
            setIsPasswordChangeDiv2(true);
        }

//textarea 100자 이내 입력

        const handleTextAreaChange = (e) => {
            const currentText = e.target.value;

            if (currentText.length > 100) {
                return;
            }

            setTextAreaValue(currentText);
        };

        // 이미지 미리보기 상태를 추가합니다.
        const [previewImage, setPreviewImage] = useState(Profile);
        const [selectedFile, setSelectedFile] = useState(null);
        // 이미지 선택 처리 함수
        const handleImageChange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 파일 확장자 검사
            const imageFileTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!imageFileTypes.includes(file.type)) {
                setProfileButtonText("Not Image File");
                setTimeout(() => {
                    setProfileButtonText("Change Picture");
                }, 1500);
                return;
            }

            // 파일 크기 검사 (10MB 이상인 경우)
            // 파일 크기 검사 (1000KB 이상인 경우)
            const maxSizeInKB = 1000;
            if (file.size > maxSizeInKB * 1024) {
                setProfileButtonText("Over Capacity");
                setTimeout(() => {
                    setProfileButtonText("Change Picture");
                }, 1500);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setMypageuserProfileName(null);
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            setSelectedFile(file);
        };

        // 이미지 미리보기 처리 함수
        const handleClickImage = () => {
            document.getElementById("imageInput").click();
        };

        const uploadImage = async (retry = true) => {
            try {
                if (selectedFile == null) {
                    setProfileButtonText("Same Picture");
                    setTimeout(() => {
                        setProfileButtonText("Change Picture");
                    }, 1500);
                    return;
                }

                let formData = new FormData();
                formData.append("imageFile", selectedFile);

                const response = await fetch("/api/v1/user/uploadImage", {
                    method: "POST",
                    headers: {
                        "Authorization": localStorage.getItem("Authorization"),
                        'userName': localStorage.getItem('userName'),
                    },
                    body: formData,
                });

                const accessToken = response.headers.get('Authorization');
                if (accessToken != null) {
                    localStorage.setItem('Authorization', accessToken);
                }
                if (response.headers.get('refresh') != null) {
                    logoutApi(true); // Home.js에 이벤트 전달
                    return;
                }

                const data = await response.text(); // 데이터를 JSON 객체로 변환
                if (response.ok) {
                    if (data == "image upload") {
                        setProfileButtonText("Change Success");
                        setSelectedFile(null);
                    } else {
                        if (retry) {
                            await uploadImage(false);
                        }
                    }
                }
                setTimeout(() => {
                    setProfileButtonText("Change Picture");
                }, 1500);
            } catch (error) {
                if (retry) {
                    await uploadImage(false);
                }
            }
        };

//사용자 상태 메시지 변경 로직
        const userMessageChange = async (retry = true) => {
            try {
                const response = await fetch('/api/v1/user/messageChange', {
                    method: 'PUT',
                    headers: {
                        'Authorization': localStorage.getItem('Authorization'),
                        'userName': localStorage.getItem('userName'),
                    },
                    body: textAreaValue, // JSON.stringify 제거
                });

                const accessToken = response.headers.get('Authorization');
                if (accessToken != null) {
                    localStorage.setItem('Authorization', accessToken);
                }
                if (response.headers.get('refresh') != null) {
                    logoutApi(true); // Home.js에 이벤트 전달
                    return;
                }

                if (response.ok) {
                    setMessageButtonText("Change Success");
                } else {
                    if (retry) {
                        await userMessageChange(false);
                    }
                }
                // 1.5초 후에 버튼 텍스트를 되돌립니다.
                setTimeout(() => {
                    setMessageButtonText("Change Message");
                }, 1500);
            } catch (error) {
                if (retry) {
                    await userMessageChange(false);
                }
            }
        };

        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                }}
            >
                <DivStyled visible={isPasswordChangeDiv ? "visible" : isPasswordChangeDiv2 ? "" : "hidden"}
                           ref={passwordChangeDivRef}>
                    <PasswordChange
                        isPasswordChangeDiv={isPasswordChangeDiv}
                        isPasswordChangeDivClose={isPasswordChangeDivClose}
                    >
                    </PasswordChange>
                </DivStyled>
                {mypageOnClick ? (
                        <div className={"myPage_clicked"}>
                            <div className={"myPageDiv2"}>
                                <img
                                    className={"myPageDiv_profile_img"}
                                    src={MypageuserProfileName ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + MypageuserProfileName : previewImage ? previewImage : Profile}
                                    onClick={handleClickImage}
                                />
                                <input
                                    type="file"
                                    id="imageInput"
                                    accept="image/*"
                                    style={{display: "none"}}
                                    onChange={handleImageChange}
                                />
                                <Button
                                    className={profileButtonText == 'Change Picture' ? "myPageDiv_profile_btn2" :
                                        profileButtonText == 'Change Success' ? "myPageDiv_profile_btn3" : "myPageDiv_profile_btn4"}
                                    onClick={uploadImage}
                                >
                                    {profileButtonText}
                                </Button>
                            </div>
                            <div className={"myPageDiv3"}>
                                <div className={"myPageDiv_info_1"}>
                                    <h5 className={"myPageDiv_info_1_text"}>ID</h5>
                                    <input type={"text"} className={"myPageDiv_info_1_input"} readOnly={true}
                                           value={MypageuserName}/>
                                    <h5 className={"myPageDiv_info_2_text"}>EMAIL</h5>
                                    <input type={"text"} className={"myPageDiv_info_1_1_input"} readOnly={true}
                                           value={MypageuserEmail}/>
                                </div>
                                <div className={"myPageDiv_info_1"}>
                                    <h5 className={"myPageDiv_info_1_text"}>NICKNAME</h5>
                                    <input type={"text"} className={"myPageDiv_info_1_input"} readOnly={true}
                                           value={MypageuserNickName}/>
                                    <h5 className={"myPageDiv_info_2_text"}>PHONE</h5>
                                    <input type={"text"} className={"myPageDiv_info_1_1_input"} readOnly={true}
                                           value={MypageuserPhone}/>
                                </div>
                                <div className={"myPageDiv_info_1"}>
                                    <h5 className={"myPageDiv_info_1_text"}>PHONE</h5>
                                    <input type={"text"} className={"myPageDiv_info_1_input"} readOnly={true}
                                           value={MypageuserNationality}/>
                                    <Button className={"myPageDiv_info_1_btn"} onClick={passwordChangeDiv}
                                    disabled={MypageuserPhone === ""}
                                    >Change
                                        Password
                                    </Button>
                                </div>
                            </div>
                            <div className={"myPageDiv4"}>
                                <div className={"myPageDiv_Message_div"}>
                                    <div className={"myPageDiv_Message_text"}>
                                        <textarea className={"myPageDiv_Message_textarea"}
                                                  onChange={handleTextAreaChange}
                                                  value={textAreaValue}
                                                  placeholder={"Please enter within 100 characters"}
                                        >
                                        </textarea>
                                    </div>
                                    <div className={"myPageDiv_Message_btn_div"}>
                                        <Button
                                            className={messageButtonText == 'Change Message' ? "myPageDiv_Message_btn" : "myPageDiv_Message_btn one"}
                                            onClick={userMessageChange}>
                                            {messageButtonText}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) :
                    friendsReceivedOnClick ? (
                        <div className={"friendRecieved_clicked"}>
                            <div className={"friendRecieved_div"}>
                                request received
                            </div>
                            <div className={"friendRecieved_div_2"}>
                                {receivedList.length === 0 ?
                                    (
                                        <div className={"friendRecieved_div_3"}>
                                            No Requests Received
                                        </div>
                                    ) : (
                                        <TransitionGroup>
                                            {receivedList && receivedList.map(r => (
                                                <CSSTransition key={r.id} timeout={500} classNames="item">
                                                    <FriendsReceivedListItem list={r}
                                                                             onRemove={removeItemFromList}></FriendsReceivedListItem>
                                                </CSSTransition>
                                            ))}
                                        </TransitionGroup>
                                    )
                                }
                            </div>
                        </div>
                    ) : (
                        <div className={"friendRequested_clicked"}>
                            <div className={"friendRecieved_div"}>
                                request sent
                            </div>
                            <div className={"friendRecieved_div_2"}>
                                {requetedList.length === 0 ?
                                    (
                                        <div className={"friendRecieved_div_3"}>No Request
                                        </div>
                                    ) : (
                                        <TransitionGroup>
                                            {requetedList && requetedList.map(r => (
                                                <CSSTransition key={r.id} timeout={500} classNames="item">
                                                    <FriendsRequestedListItem list={r}
                                                                              onRemove={removeItemFromList2}></FriendsRequestedListItem>
                                                </CSSTransition>
                                            ))}
                                        </TransitionGroup>
                                    )
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        );
    })
;


export default MyPage;