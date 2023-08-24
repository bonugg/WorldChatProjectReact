// tokenVerification.js
import { useState, useEffect, useMemo } from 'react';
export const useTokenVerification = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(undefined);

    useEffect(() => {
        const verifyToken = async () => {
            if (localStorage.getItem('Authorization') === null) {
                setIsLoggedIn(false);
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
                            setIsLoggedIn(true);
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
                                setIsLoggedIn(true);
                            } else {
                                const response = await fetch('/api/v1/user/logout', {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': localStorage.getItem('Authorization'),
                                    },
                                });

                                if (response.ok) {
                                    localStorage.removeItem('Authorization');
                                    localStorage.removeItem('userName');
                                    alert("로그인이 필요합니다.");
                                    setIsLoggedIn(false);
                                } else {
                                    throw new Error('로그아웃 실패.');
                                }
                            }
                        }
                    }
                } catch (error) {
                    setIsLoggedIn(false);
                }
            }
        };

        verifyToken();
    }, []);
    return isLoggedIn;
};