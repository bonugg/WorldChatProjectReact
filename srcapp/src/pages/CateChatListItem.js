import React, {useState} from 'react';

import Button from "@mui/material/Button";
import "./css/CateChat.css";


const CateChatListItem = ({room, onCateRoomAndChatDivUpdate, cateChatList, userList}) => {
    const {cateId, cateName, cateUserCnt, maxUserCnt, interest} = room;

    const cateRoomEnter = async (retry = true) => {
        try {
            const response = await fetch(`/api/v1/cateChat/enter?cateId=${cateId}`, {
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
                alert("logout s");
                return;
            }
            console.log(response);
            if (response.ok) {
                const data = await response.json(); // 응답본문을 JSON 객체로 변환
                const isFull = data.isFull;
                console.log(data.cateChatList);
                console.log(data.userList);
                console.log(data.cateRoom);

                if (isFull) {
                    alert("The chat room is full.");
                    onCateRoomAndChatDivUpdate(false, "");
                } else {
                    // 이 곳에 성공적으로 입장한 경우 수행할 작업을 추가하세요.
                    alert("SUCCESS.");
                    onCateRoomAndChatDivUpdate(true, data.cateRoom);
                    cateChatList(data.cateChatList);
                    userList(data.userList);
                }
            } else {
                if (retry) {
                    await cateRoomEnter(false);
                }
            }
        }catch (error){
            if (retry) {
                await cateRoomEnter(false);
            }
        }
    };

    return (
        <div
            onClick={cateRoomEnter}
            className={"roomList_item_div"}>
            {cateName}
        </div>
    );
};

export default CateChatListItem;