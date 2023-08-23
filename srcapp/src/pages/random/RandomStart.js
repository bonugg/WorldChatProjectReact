import React from 'react';
import { useNavigate } from 'react-router-dom';
const RandomStart = () => {
    const navigate = useNavigate();

    //랜덤채팅 시작 버튼
    const startRandomChat = async (e) => {
        e.preventDefault();
        const authorization = localStorage.getItem('Authorization');
        const username = localStorage.getItem('userName');
        if (!authorization) {
            return console.log("authorization token not found");
        }

        try {
            const response = await fetch("/randomRoom/enter", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': authorization,
                },
                body: JSON.stringify({ userName: username })
            });

            if (!response.ok) {
                return console.error(`Error: ${response.status}`)
            }

            const result = await response.json();
            if (!result) {
                return console.error(result.errorMessage);
            }
            
            console.log(`Created random room name: ${result.randomRoomName}`);
            navigate(`/random/${result.randomRoomId}`, { state: { room: result } });
            return result;

        } catch (error) {
            console.log(error);
            return;
        }
    }

    const goHome = () => {
        navigate("/");
    }

    return (
        <>
            <h1>랜덤채팅을 시작하시겠습니까?</h1>
            <button type="submit" onClick={startRandomChat}>네</button>
            <button type="submit" onClick={goHome}>아니요</button>
        </>
    );
};

export default RandomStart;