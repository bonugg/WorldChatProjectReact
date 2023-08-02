import React, {useEffect, useRef, useState} from "react";
import Logo from "../img/logo.png";
import "./css/Home.css";


const PasswordChange = ({isPasswordChangeDiv}) => {
    //패스워드 변경
    const [userPwd, setUserPwd] = useState('');
    const [NewUserPwd, setNewUserPwd] = useState('');
    const [NewUserPwdCheck, setNewUserPwdCheck] = useState('');
    const [PasswordCheck, setPasswordCheck] = useState("At least 8 characters consisting of English and numbers, including 2 special characters");
    const [NewPasswordCheckSame, setNewPasswordCheckSame] = useState("");

    const [isPassword, setIsPassword] = useState(false);
    const [isPassword2, setIsPassword2] = useState(false);

    useEffect(() => {
        if(isPasswordChangeDiv){
            //초기화 세팅
            setUserPwd("");
            setNewUserPwd("");
            setNewUserPwdCheck("");

            setIsPassword(false);
            setIsPassword2(false);
        }
    }, [isPasswordChangeDiv]);

    //패스워드 유효성 검사
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setUserPwd(newPassword);

        setIsPassword(false);
        setIsPassword2(false);
    };
    const handlePasswordChangeNew = (e) => {
        const newPassword = e.target.value;
        setNewUserPwd(newPassword);

        // 비밀번호가 유효하지 않은 경우
        if (newPassword == "") {
            setPasswordCheck("At least 8 characters consisting of English and numbers, including 2 special characters");
        } else if (!isValidPassword(newPassword)) {
            setPasswordCheck("Validation Pass Failed");
        } else {
            setPasswordCheck("Available PASSWORD");
        }
    };
    const handlePasswordChangeNewCheck = (e) => {
        const newCheckPassword = e.target.value;
        setNewUserPwdCheck(newCheckPassword);

        // 비밀번호가 유효하지 않은 경우
        if(newCheckPassword == ""){
            setNewPasswordCheckSame("");
        }else if (newCheckPassword == NewUserPwd) {
            setNewPasswordCheckSame("Password Matching");
        }else if(newCheckPassword != NewUserPwd){
            setNewPasswordCheckSame("Password Mismatch");
        }
    };
    //패스워드 유효성 검사
    const isValidPassword = (password) => {
        const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        const countSpecialChar = (password.match(/[!@#$%^&*]/g) || []).length;
        return passwordPattern.test(password) && countSpecialChar >= 2;
    };

    //비밀번호 일치 여부 확인
    const PwdCheck = async () => {
        const PwdCheck = await fetch('/api/v1/user/pwdCheck', {
            method: 'POST',
            headers: {
                'Authorization': localStorage.getItem('Authorization'),
            },
            body: userPwd, // JSON.stringify 제거
        });
        if (PwdCheck.ok) {
            const response = await PwdCheck.text();
            if (response == "ok") {
                console.log("성공");
                setIsPassword(true);
                setIsPassword2(false);
            } else if (response == "fail") {
                console.log("실패");
                setIsPassword(false);
                setIsPassword2(true);
            }
        }
    };

    return (
        <div className={"passwordChangeDiv"}>
            <div>
                <div className={"passwordChangeDiv_input_Form"}>
                    <input
                        className={isPassword ? "passwordChangeDiv_input_success" :
                        isPassword2 ?  "passwordChangeDiv_input_fail" :  "passwordChangeDiv_input"
                        }
                        placeholder={"Please enter your PASSWORD"}
                        type='password'
                        value={userPwd}
                        onChange={handlePasswordChange}
                    />
                    <button
                        className={"passwordChangeDiv_btn"}
                        type={"button"}
                        onClick={PwdCheck}>Check
                    </button>
                </div>
                <div className={"passwordChangeDiv_input_Form2"}>
                    <input
                        className={"passwordChangeDiv_input2"}
                        placeholder={"Please enter your PASSWORD"}
                        type='password'
                        value={NewUserPwd}
                        onChange={handlePasswordChangeNew}
                    />
                    <p className={PasswordCheck === 'At least 8 characters consisting of English and numbers, including 2 special characters' ?
                        "Text_sign2" : PasswordCheck === "Available PASSWORD" ?
                            "Text_sign2" : "Text_sign_Error2"
                    }>{PasswordCheck}</p>
                </div>
                <div className={"passwordChangeDiv_input_Form3"}>
                    <input
                        className={"passwordChangeDiv_input2"}
                        placeholder={"Please enter your PASSWORD"}
                        type='password'
                        value={NewUserPwdCheck}
                        onChange={handlePasswordChangeNewCheck}
                    />
                    <p className={NewPasswordCheckSame === '' ?
                        "Text_sign2" : NewPasswordCheckSame === "Password Matching" ?
                            "Text_sign2" : "Text_sign_Error2"
                    }>{NewPasswordCheckSame}</p>
                </div>
            </div>

            {/* Your content here */}
        </div>
    );
};


export default PasswordChange;