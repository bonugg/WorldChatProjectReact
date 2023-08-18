import React, {useEffect,useState} from 'react';

import Button from "@mui/material/Button";
import "./css/CateChat.css";


const CateChatListItem = React.memo(({room, onCateRoomAndChatDivUpdate, cateChatList, shouldImmediatelyEnter}) => {
    const {cateId, cateName, cateUserCnt, maxUserCnt, interest} = room;

    useEffect(() => {
        if (shouldImmediatelyEnter) {
            cateRoomEnter();
        }
    }, [shouldImmediatelyEnter]);

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

                if (isFull) {
                    // alert("The chat room is full.");
                    onCateRoomAndChatDivUpdate(false, "");
                } else {
                    // 이 곳에 성공적으로 입장한 경우 수행할 작업을 추가하세요.
                    // alert("SUCCESS.");
                    onCateRoomAndChatDivUpdate(true, data.cateRoom);
                    cateChatList(data.cateChatList);
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

    return [cateRoomEnter, (
        <div
            className={shouldImmediatelyEnter ? 'roomList_item_div2' : 'roomList_item_div'}
        >
            <div className={"roomList_item_div_2"}>
                <span className={"roomList_name_1"}>ROOM NAME :&nbsp;</span>
                <span className={"roomList_name_2"}>{cateName}</span>
            </div>
            <div className={"roomList_item_div_3"}>

            </div>
            <div className={"roomList_item_div_4"}>
                <Button
                    onClick={cateRoomEnter}
                    className={"roomList_btn"}
                >
                    ENTER
                </Button>

            </div>
        </div>
    )];
});

export default CateChatListItem;