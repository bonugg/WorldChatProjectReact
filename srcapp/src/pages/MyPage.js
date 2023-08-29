import React, {useEffect, useRef, useState} from "react";
import Profile from "../img/profile.png";
import "./css/Home.css";
import Button from "@mui/material/Button";
import "./css/Mypage.css";
import home from "./Home";
import axios from "axios";
import FriendsReceivedListItem from "./FriendsReceivedListItem";
import FriendsRequestedListItem from "./FriendsRequestedListItem";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
const MyPage = React.memo(({onRemove, onPasswordChange, MyPageDiv, logoutApi}) => {

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

        const [mypageOnClick, setMypageOnClick] = useState(true);
        const [friendsReceivedOnClick, setFriendsReceivedOnClick] = useState(false);
        const [friendsRequesteddOnClick, setFriendsRequesteddOnClick] = useState(false);

        const [receivedList, setReceivedList] = useState([]);
        const [requetedList, setRequestedList] = useState([]);
        const mypageOn = () => {
            setMypageOnClick(true);
            setFriendsReceivedOnClick(false);
            setFriendsRequesteddOnClick(false);
        }
        const friendRecievedOn = () => {
            setMypageOnClick(false);
            setFriendsReceivedOnClick(true);
            setFriendsRequesteddOnClick(false);
        }
        const friendRequestedOn = () => {
            setMypageOnClick(false);
            setFriendsReceivedOnClick(false);
            setFriendsRequesteddOnClick(true);
        }

        //친구 요청을 승인하거나 거절한 항목 삭제
        const removeItemFromList = (id) => {
            console.log("아이디 출력 "+id)
            setReceivedList(prevList => prevList.filter(item => item.id != id));
            onRemove(id);
        }
        const removeItemFromList2 = (id) => {
            console.log("아이디 출력 "+id)
            setRequestedList(prevList => prevList.filter(item => item.id != id));
        }

        useEffect(() => {
            if(friendsReceivedOnClick){
                const getReceivedListAxios = async () => {
                    try {
                        const response = await axios.get('/friends/received-list', {
                            headers: {
                                Authorization: `${localStorage.getItem('Authorization')}`
                            }
                        });
                        console.log(response);
                        console.log(response.data.items);
                        if(response.data && response.data.items) {
                            setReceivedList(() => response.data.items);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
                getReceivedListAxios();
            }
        },[friendsReceivedOnClick]);

        useEffect(() => {
            if(friendsRequesteddOnClick){
                const getRequestedListAxios = async() => {
                    try {
                        const response = await axios.get('/friends/requested-list', {
                            headers: {
                                Authorization: `${localStorage.getItem('Authorization')}`
                            }
                        });
                        console.log(response);
                        if(response.data && response.data.items) {
                            setRequestedList(() => response.data.items);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
                getRequestedListAxios();
            }
        },[friendsRequesteddOnClick]);



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
                mypageOn();
                userInfo();
            }
        }, [MyPageDiv]);

//패스워드 수정 버튼 클릭 시 동작
        const passwordChangeDiv = () => {

            onPasswordChange(true); // Home.js에 이벤트 전달
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
                     position: 'fixed',
                     top: '50%',
                     left: '50%',
                     transform: 'translate(-50%, -50%)',
                     width: friendsReceivedOnClick || friendsRequesteddOnClick ? '450px ': '600px',
                     height: friendsReceivedOnClick || friendsRequesteddOnClick ? '550px ': '650px',
                     borderRadius: '0px 10px 10px 10px',
                     border: '2px solid rgba(50, 50, 50, 0.9)',
                     background: 'rgba(50, 50, 50, 0.7)',
                     transition: 'width 0.25s ease-in-out, height 0.25s ease-in-out'
                 }}
            >
                <Button
                    type={"button"}
                    className={mypageOnClick ? "menu_1_clicked" : "menu_1"}
                    onClick={mypageOn}
                >
                    Mypage
                </Button>
                <Button
                    type={"button"}
                    className={friendsReceivedOnClick ? "menu_2_clicked": "menu_2"}
                    onClick={friendRecievedOn}
                >
                    Friends
                    Received
                </Button>
                <Button
                    type={"button"}
                    className={friendsRequesteddOnClick ? "menu_3_clicked" : "menu_3"}
                    onClick={friendRequestedOn}
                >
                    Friends
                    Requested
                </Button>
                {mypageOnClick ? (
                    <div className={"myPage_clicked"}>
                        <div className={"myPageDiv2"}>
                            <div className={"myPageDiv_profile"}>
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

                            </div>
                            <div className={"myPageDiv_profile_btn"}>
                                <Button
                                    className={profileButtonText == 'Change Picture' ? "myPageDiv_profile_btn2" :
                                        profileButtonText == 'Change Success' ? "myPageDiv_profile_btn3" : "myPageDiv_profile_btn4"}
                                    onClick={uploadImage}
                                >
                                    {profileButtonText}
                                </Button>
                            </div>
                        </div>
                        <div className={"myPageDiv3"}>
                            <div className={"myPageDiv_info_1"}>
                                <div className={"myPageDiv_info_1_1"}>
                                    <h5 className={"myPageDiv_info_1_text"}>ID</h5>
                                    <input type={"text"} className={"myPageDiv_info_1_input"} readOnly={true}
                                           value={MypageuserName}/>
                                    <h5 className={"myPageDiv_info_2_text"}>NICKNAME</h5>
                                    <input type={"text"} className={"myPageDiv_info_1_input"} readOnly={true}
                                           value={MypageuserNickName}/>
                                    <h5 className={"myPageDiv_info_3_text"}>NATIONALITY</h5>
                                    <input type={"text"} className={"myPageDiv_info_1_1_input"} readOnly={true}
                                           value={MypageuserNationality}/>
                                </div>
                            </div>
                            <div className={"myPageDiv_info_2"}>
                                <div className={"myPageDiv_info_1_1"}>
                                    <h5 className={"myPageDiv_info_1_text"}>EMAIL</h5>
                                    <input type={"text"} className={"myPageDiv_info_1_input"} readOnly={true}
                                           value={MypageuserEmail}/>
                                    <h5 className={"myPageDiv_info_2_text"}>PHONE</h5>
                                    <input type={"text"} className={"myPageDiv_info_1_input"} readOnly={true}
                                           value={MypageuserPhone}/>
                                    <div>
                                        <Button className={"myPageDiv_info_1_btn"} onClick={passwordChangeDiv}>Change
                                            Password
                                        </Button>
                                    </div>
                                </div>
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
                                        className={messageButtonText == 'Change Message' ? "myPageDiv_Message_btn" : "myPageDiv_Message_btn2"}
                                        onClick={userMessageChange}>
                                        {messageButtonText}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ):
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
                                    ):(
                                        <TransitionGroup>
                                            {receivedList && receivedList.map(r => (
                                                <CSSTransition key={r.id} timeout={500} classNames="item">
                                                    <FriendsReceivedListItem list={r} onRemove={removeItemFromList}></FriendsReceivedListItem>
                                                </CSSTransition>
                                            ))}
                                        </TransitionGroup>
                                    )
                                }
                            </div>
                        </div>
                    ): (
                        <div className={"friendRequested_clicked"}>
                            <div className={"friendRecieved_clicked"}>
                                <div className={"friendRecieved_div"}>
                                    request sent
                                </div>
                                <div className={"friendRecieved_div_2"}>
                                    {requetedList.length === 0 ?
                                        (
                                          <div className={"friendRecieved_div_3"}>No Request
                                          </div>
                                        ):(
                                            <TransitionGroup>
                                                {requetedList && requetedList.map(r => (
                                                    <CSSTransition key={r.id} timeout={500} classNames="item">
                                                        <FriendsRequestedListItem list={r} onRemove={removeItemFromList2}></FriendsRequestedListItem>
                                                    </CSSTransition>
                                                ))}
                                            </TransitionGroup>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        );
    })
;


export default MyPage;