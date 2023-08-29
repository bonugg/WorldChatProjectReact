import React, { useEffect, useRef, useState } from "react";
import Profile from "../img/profile.png";
import "./css/Home.css";
import Button from "@mui/material/Button";
import "./css/Mypage.css";
import home from "./Home";
import zIndex from "@mui/material/styles/zIndex";


const MyPage = React.memo(({ onPasswordChange, MyPageDiv, logoutApi }) => {
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

    const [showModal, setShowModal] = useState(false);

    const Modal = ({ onClose }) => {
        return (
            <div style={{
                position: 'fixed',
                top: 200,
                left: 50,
                display: 'flex',
                alignItems: 'center', // 중앙 정렬 (수직 방향)
                justifyContent: 'center', // 중앙 정렬 (수평 방향)
                backgroundColor: '#000000aa',
                zIndex: '999',
                
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '10px',
                    zIndex: '999',
                    width: '500px',
                    
                }}>
                    <h2 style={{fontSize: '20px'}}>Are you sure you want to unsubscribe?</h2>
                    <button onClick={() => {
                        requestWithdrawal();
                        onClose();
                    }} style={{fontSize: '20px', margin: '10px', marginLeft:'350px'}}>Yes</button>
                    <button onClick={onClose} style={{fontSize: '20px'}}>No</button>
                </div>
            </div>
        )
    }

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

    // 가상의 회원탈퇴 요청 함수
    const requestWithdrawal = async () => {
        // 서버에 DELETE 요청 보내기
        const response = await fetch('/api/v1/user', {
            method: 'DELETE',
            headers: {
                'Authorization': localStorage.getItem('Authorization'),
                'userName': localStorage.getItem('userName'),
            },
        });

        if (response.ok) {
            // 회원탈퇴 성공 시 처리
            console.log("Successfully unsubscribed");
            alert('Membership withdrawal is complete');
            // 로그아웃 처리
            logoutApi(true); // Home.js에 이벤트 전달
            // 홈화면으로 이동
            window.location.href = '/'; // Home 페이지로 이동
        } else {
            // 실패 시 에러 메시지 출력
            console.error("Failed to unsubscribe");
        }
    };


    return (
        <div className={"myPageDiv"}>
            <div className={"myPageDiv2"} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={"myPageDiv_profile "} style={{ display: 'flex', justifyContent: 'center', width: '100%', marginLeft: '190px' }}>
                    <img
                        className={"myPageDiv_profile_img"}
                        src={MypageuserProfileName ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + MypageuserProfileName : previewImage ? previewImage : Profile}
                        onClick={handleClickImage}
                    />
                    {/* 회원탈퇴 버튼 */}
                    <Button style={{
                        marginLeft: '100px',
                        border: '1px solid white',
                        color: 'white',
                        backgroundColor: 'black',
                        fontWeight: "bold",
                        fontSize: "10px",
                    }}
                        onClick={() => setShowModal(true)}
                    >Withdrawal</Button>

                    {showModal && <Modal onClose={() => setShowModal(false)} />}
                </div>
                <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                />
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
                            value={MypageuserName} />
                        <h5 className={"myPageDiv_info_2_text"}>NICKNAME</h5>
                        <input type={"text"} className={"myPageDiv_info_1_input"} readOnly={true}
                            value={MypageuserNickName} />
                        <h5 className={"myPageDiv_info_3_text"}>NATIONALITY</h5>
                        <input type={"text"} className={"myPageDiv_info_1_1_input"} readOnly={true}
                            value={MypageuserNationality} />
                    </div>
                </div>
                <div className={"myPageDiv_info_2"}>
                    <div className={"myPageDiv_info_1_1"}>
                        <h5 className={"myPageDiv_info_1_text"}>EMAIL</h5>
                        <input type={"text"} className={"myPageDiv_info_1_input"} readOnly={true}
                            value={MypageuserEmail} />
                        <h5 className={"myPageDiv_info_2_text"}>PHONE</h5>
                        <input type={"text"} className={"myPageDiv_info_1_input"} readOnly={true}
                            value={MypageuserPhone} />
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
    );
})
    ;


export default MyPage;