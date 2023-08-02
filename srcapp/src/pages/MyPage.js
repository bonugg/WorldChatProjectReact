import React, {useEffect, useRef, useState} from "react";
import Logo from "../img/logo.png";
import "./css/Home.css";


const MyPage = ({onPasswordChange, MyPageDiv}) => {
    //마이페이지
    const [MypageuserName, setMypageuserName] = useState('');
    const [MypageuserNickName, setMypageuserNickName] = useState('');
    const [MypageuserNationality, setMypageuserNationality] = useState('');
    const [MypageuserEmail, setMypageuserEmail] = useState('');
    const [MypageuserPhone, setMypageuserPhone] = useState('');
    const [textAreaValue, setTextAreaValue] = useState("");
    const [messageButtonText, setMessageButtonText] = useState("Change Message");

    const [isPasswordChangeDiv, setisPasswordChangeDiv] = useState(false);

    //유저 정보 가져오는 로직
    const userInfo = async () => {
        const response = await fetch('/api/v1/user', {
            method: 'GET',
            headers: {
                'Authorization': localStorage.getItem('Authorization'),
            },
        });

        if (response.ok) {
            const data = await response.json(); // 데이터를 JSON 객체로 변환
            setMypageuserName(data.user.userName);
            setMypageuserEmail(data.user.userEmail);
            setMypageuserPhone(data.user.userPhone);
            setMypageuserNationality(data.user.userNationality);
            setMypageuserNickName(data.user.userNickName);
            setTextAreaValue(data.user.userMessage);
        } else {
        }
    };

    useEffect(() => {
        if(MyPageDiv){
            userInfo();
        }
    }, [MyPageDiv]);

    useEffect(() => {
       console.log(isPasswordChangeDiv);
    }, [isPasswordChangeDiv]);

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
    //사용자 상태 메시지 변경 로직
    const userMessageChange = async () => {
        const response = await fetch('/api/v1/user/messageChange', {
            method: 'PUT',
            headers: {
                'Authorization': localStorage.getItem('Authorization'),
            },
            body: textAreaValue, // JSON.stringify 제거
        });

        if (response.ok) {
            setMessageButtonText("Change Success");
        } else {
            setMessageButtonText("Change Fail");
        }
        // 1.5초 후에 버튼 텍스트를 되돌립니다.
        setTimeout(() => {
            setMessageButtonText("Change Message");
        }, 1500);
    };

    return (
        <div className={"myPageDiv"}>
            <div className={"myPageDiv2"}>
                <div className={"myPageDiv_profile"}>
                    <img className={"myPageDiv_profile_img"} src={Logo}></img>
                </div>
                <div className={"myPageDiv_profile_btn"}>
                    <button className={"myPageDiv_profile_btn2"}>Change Picture</button>
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
};


export default MyPage;