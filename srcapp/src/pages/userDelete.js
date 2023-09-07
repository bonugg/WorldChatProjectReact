import React, {useEffect, useRef, useState} from "react";
import Logo from "../img/logo.png";
import Button from "@mui/material/Button";
import "./css/Home.css";
import "./css/PasswordChange.css";


const PasswordChange = React.memo(({isUserDelDiv,isUserDelClose, logoutApi2}) => {
    //패스워드 변경
    const [userPwd, setUserPwd] = useState('');
    const [NewUserPwd, setNewUserPwd] = useState('');
    const [NewUserPwdCheck, setNewUserPwdCheck] = useState('');
    const [PasswordCheck, setPasswordCheck] = useState("At least 8 characters consisting of English and numbers, including 2 special characters");
    const [NewPasswordCheckSame, setNewPasswordCheckSame] = useState("");

    const [isPassword, setIsPassword] = useState(false);
    const [isPassword2, setIsPassword2] = useState(false);

    useEffect(() => {
        if (isUserDelDiv) {
            //초기화 세팅
            setUserPwd("");
            setNewUserPwd("");
            setNewUserPwdCheck("");
            setPasswordCheck("At least 8 characters consisting of English and numbers, including 2 special characters");
            setNewPasswordCheckSame("");
            setIsPassword(false);
            setIsPassword2(false);
        }
    }, [isUserDelDiv]);

    //패스워드 유효성 검사
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setUserPwd(newPassword);
    };


    //비밀번호 일치 여부 확인
    const PwdCheck = async (retry = true) => {
        try {
            const response = await fetch('/api/v1/user/pwdCheck', {
                method: 'POST',
                headers: {
                    'Authorization': localStorage.getItem('Authorization'),
                    'userName': localStorage.getItem('userName'),
                },
                body: userPwd, // JSON.stringify 제거
            });

            const accessToken = response.headers.get('Authorization');
            if (accessToken != null) {
                localStorage.setItem('Authorization', accessToken);
            }
            if (response.headers.get('refresh') != null) {
                logoutApi2(true); // Home.js에 이벤트 전달
                return;
            }
            if (response.ok) {
                const data = await response.text();
                if (data == "ok") {
                    setIsPassword(true);
                    setIsPassword2(false);
                } else if (data == "fail") {
                    setIsPassword(false);
                    setIsPassword2(true);
                }else {
                    if (retry) {
                        await PwdCheck(false);
                    }
                }
            }
        } catch (error) {
            if (retry) {
                await PwdCheck(false);
            }
        }
    };

    const UserDel = async (retry = true) => {
        try {
            const response = await fetch('/api/v1/user', {
                method: 'DELETE',
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
                alert("Login Timeout");
                // logoutApi(true); // Home.js에 이벤트 전달
                return;
            }
            if (response.ok) {
                const data = await response.text();
                if (data == "Successfully unsubscribed") {
                    logoutApi2("home");
                }else {
                    if (retry) {
                        await UserDel(false);
                    }
                }
            }
        } catch (error) {
            if (retry) {
                await UserDel(false);
            }
        }
    };
    const passwordChangeDiv = () => {
        isUserDelClose(false); // Home.js에 이벤트 전달
    }
    return (
        <div className={"passwordChangeDiv"}>
            <div className={"passwordChangeDiv_2"}>
                <div className={"passwordChangeDiv_input_Form"}>
                    <input
                        className={isPassword ? "passwordChangeDiv_input success" :
                            isPassword2 ? "passwordChangeDiv_input fail" : "passwordChangeDiv_input"
                        }
                        placeholder={"Please enter your PASSWORD"}
                        type='password'
                        value={userPwd}
                        onChange={handlePasswordChange}
                    />
                    <Button
                        className={"passwordChangeDiv_btn"}
                        type={"button"}
                        onClick={PwdCheck}>Check
                    </Button>
                </div>
                <div className={"passwordChangeDiv_btn_submit_div"}>
                    <Button
                        onClick={UserDel}
                        className={"userDelDiv_btn_submit"}
                        type='submit'
                        disabled={!isPassword}>Withdraw
                    </Button>
                </div>
            </div>

            {/* Your content here */}
        </div>
    );
});


export default PasswordChange;