import {Navigate, Outlet, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import './Layout.css';
import React from 'react';

const Layout = () => {
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('Authorization');
        setLoggedIn(!!token);
    }, []);

    useEffect(() => {
        const verifyToken = async () => {
            let islogin = false;

            if (localStorage.getItem('Authorization') === null) {
                islogin =false;
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
                            islogin =true;
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
                                islogin =true;
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
                                    alert("로그인이 필요합니다.");
                                    islogin =false;
                                } else {
                                    throw new Error('로그아웃 실패.');
                                }
                            }
                        }
                    }
                } catch (error) {
                    islogin =false;
                }
            }
            setLoggedIn(islogin);
        };

        verifyToken();
    }, []);

    const login = () => {
        // navigate('/login');
    };

    const join = () => {
        navigate('/join');
    };

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

    const mypage = () => {
        navigate('/mypage');
    };
    const mypage2 = () => {
        navigate('/mypage2');
    };


    return (
        <div>
            <header>
                {loggedIn ? (
                    <>
                        <button onClick={logout}>로그아웃</button>
                        <button onClick={mypage}>마이페이지</button>
                        <button onClick={mypage2}>마이페이지2</button>
                    </>
                ) : (
                    <>
                    <button onClick={login}>로그인</button>
                    <button onClick={join}>회원가입</button>
                    </>
                )}
            </header>
            <main>
                <Outlet/>
            </main>
        </div>
    );
};

export default Layout;