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
            console.log("authorization token not found");
            return;
        }
        try {
            const response = await fetch("/random/room", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': authorization,
                },
                body: JSON.stringify({ userName: username })
            });
            if (response.ok) {
                const result = await response.json();
                if (!result) {
                    console.error(result.errorMessage);
                    return;
                }
                console.log(`Created random room name: ${result.randomRoomName}`);
                navigate(`/random/${result.randomRoomId}`, { state: { room: result } });
                return result;
            } else {
                console.error(`Error: ${response.status}`)
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    return (
        <button type="submit" onClick={startRandomChat}>랜덤채팅 시작</button>
    );
};

export default RandomStart;