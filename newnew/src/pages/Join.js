import React, { useState } from 'react';
import styles from './css/Login.module.css';
import { useNavigate  } from 'react-router-dom';

const Join = () => {
    const [userName, setUsername] = useState('');
    const [userPwd, setPassword] = useState('');
    const [userEmail, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); // 추가한 상태

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('api/v1/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, userPwd, userEmail}),
        });
        if (response.ok) {
            // 페이지 이동
            navigate('/login');
        }
    };

    // 중복 확인 함수
    const idCheck = async () => {
        const IdCheck = await fetch('/api/v1/idCheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain', // 변경한 Content-Type
            },
            body: userName, // JSON.stringify 제거
        });
        if(IdCheck.ok) {
            const response = await IdCheck.text();
            if (response == "ok") {
                const errorText = "사용 가능 아이디";
                setError(errorText);
                setIsSubmitDisabled(false); // 성공한 경우
            } else if (response == "fail") {
                const errorText = "존재하는 아이디";
                setError(errorText);
                setIsSubmitDisabled(true); // 실패한 경우
            }
        }
    };
    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        setIsSubmitDisabled(true); // 사용자 이름을 수정할 때마다 중복 확인 해제
    };

    return (
        <div>
            <div className={`${styles.wrapper}`}>
                <div className={`${styles.loginLayout}`}>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className={`${styles.loginLayout2}`}>
                                <div>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={handleUsernameChange}
                                    />
                                    <button type={"button"} onClick={idCheck}>중복 확인</button>
                                </div>
                                <input
                                    type='password'
                                    value={userPwd}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <input
                                    type='text'
                                    value={userEmail}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className={`${styles.loginLayout3}`}>
                                <button type='submit' disabled={isSubmitDisabled}>회원가입</button>
                            </div>
                        </form>
                        {error && <div className={`${styles.error}`}>{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Join;