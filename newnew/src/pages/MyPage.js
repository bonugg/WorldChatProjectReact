import React, {useEffect, useRef, useState} from "react";
import Profile from "../img/profile.png";
import "./css/Home.css";
import home from "./Home";


const MyPage = ({onPasswordChange, MyPageDiv, logoutApi}) => {
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

        const [isPasswordChangeDiv, setisPasswordChangeDiv] = useState(false);

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
                userInfo();
            }
        }, [MyPageDiv]);

//패스워드 수정 버튼 클릭 시 동작
        const passwordChangeDiv = () => {
            setisPasswordChangeDiv(true);
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
                if(selectedFile == null){
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
                    if(data == "image upload"){
                        setProfileButtonText("Change Success");
                        setSelectedFile(null);
                    }else {
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
            }catch (error){
                if (retry) {
                    await userMessageChange(false);
                }
            }
        };

        return (
            <div className={"myPageDiv"}>
                <div className={"myPageDiv2"}>
                    <div className={"myPageDiv_profile"}>
                        <img
                            className={"myPageDiv_profile_img"}
                            src={MypageuserProfileName ? "/upload/"+ MypageuserProfileName : previewImage ? previewImage :Profile}
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
                        <button
                            className={profileButtonText == 'Change Picture' ? "myPageDiv_profile_btn2" :
                                profileButtonText == 'Change Success' ? "myPageDiv_profile_btn3" : "myPageDiv_profile_btn4"}
                            onClick={uploadImage}>{profileButtonText}</button>
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
                                <button className={"myPageDiv_info_1_btn"} onClick={passwordChangeDiv}>Change
                                    Password
                                </button>
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
                            <button
                                className={messageButtonText == 'Change Message' ? "myPageDiv_Message_btn" : "myPageDiv_Message_btn2"}
                                onClick={userMessageChange}>
                                {messageButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
;


export default MyPage;