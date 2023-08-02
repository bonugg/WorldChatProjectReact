import React, { useState } from 'react';
import styles from './css/Login.module.css';
import { useNavigate  } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });


        if (response.ok) {
            // 로그인 성공시 페이지 이동
            // 로그인 성공시 accessToken과 userName 저장
            const accessToken = response.headers.get('Authorization');
            const userName = response.headers.get('userName');
            localStorage.setItem('Authorization', accessToken);
            localStorage.setItem('userName', userName);
            // 페이지 이동
            navigate('/');
        } else {
            // 실패시 오류 메시지 설정
            const errorText = "아이디 혹은 비밀번호 오류";
            setError(errorText);
        }
    };

    return (
        <div>
            <div className={`${styles.wrapper}`}>
                <div className={`${styles.loginLayout}`}>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className={`${styles.loginLayout2}`}>
                                <input
                                    type='text'
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <input
                                    type='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className={`${styles.loginLayout3}`}>
                                <button type='submit'>로그인</button>
                            </div>
                        </form>
                        {error && <div className={`${styles.error}`}>{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;