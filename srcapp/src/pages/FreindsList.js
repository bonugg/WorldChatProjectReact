import React, {useEffect, useRef, useState} from "react";
import FreindsListItem from './FreindsListItem';
import Korea from "../img/flag/KR.png";
import UnitedStates from "../img/flag/US.png";
import Japan from "../img/flag/JP.png";
import Canada from "../img/flag/CA.png";
import Australia from "../img/flag/AU.png";
import China from "../img/flag/CN.png";
import Italy from "../img/flag/IT.png";
import Russia from "../img/flag/RU.png";
import Philippines from "../img/flag/PH.png";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import "./css/FreindsList.css";
import axios from "axios";


const FreindsList = React.memo(({onRemove, FriendListApi, FriendNationally, logoutApi3, FriendsList,isOneOnOneChatDiv,onData, setChatType, socket, friendListUpdated,message}) => {
    const [userList, setUserList] = useState([]);
    const [unreadCount, setUnreadCount] = useState({});
    const freindsList = async (retry = true) => {
        try {
            const response = await fetch('/friends/friends-list/' + FriendNationally, {
                method: 'GET',
                headers: {
                    Authorization: localStorage.getItem('Authorization'),
                    'userName': localStorage.getItem('userName'),
                },
            });
            const accessToken = response.headers.get('Authorization');
            if (accessToken != null) {
                localStorage.setItem('Authorization', accessToken);
            }
            if (response.headers.get('refresh') != null) {
                logoutApi3(true); // Home.js에 이벤트 전달
                return;
            }
            const data = await response.json();
            if(data && data.items) {
                setUserList(() => data.items);
                await getUnreadMessageCount(data.items);
            }else {
                setUserList([]);
            }
        } catch (error) {
            if (retry) {
                await freindsList(false);
            }
        }
    }

    useEffect(() => {
        if (FriendListApi) {
            freindsList();
        }else {
            setUserList([]);
        }
    }, [FriendNationally,friendListUpdated]);

    // 국적 이미지 대응
    const flagImage = {
        KR: Korea,
        US: UnitedStates,
        CA: Canada,
        JP: Japan,
        CN: China,
        PH: Philippines,
        RU: Russia,
        AU: Australia,
        IT: Italy,
    };

    const removeItemFromList = (id) => {
        setUserList(prevList => {
            const item = prevList.find(item => item.id == id);
            // Get the country name from the found item
            const countryName = item ? item.friends.userNationality : null;
            const updatedList = prevList.filter(item => item.id != id);
            onRemove(updatedList.length, countryName);
            return updatedList;
        });
    }

    const getNationalityFlag = (nationality) => {
        if(nationality == ''){

        }
        return flagImage[nationality] || null;
    };

    const friendsChatDivOn = (isDiv, userId, userNickName) => {
        isOneOnOneChatDiv(isDiv, userId, userNickName);

        setUnreadCount(prevCounts => ({
            ...prevCounts,
            [userNickName]: 0
        }));
    };
    //메시지 안읽은 개수 웹소켓
    // useEffect(() => {
    //     if (socket) {
    //         console.log("연결---");
    //         socket.onmessage = (event) => {
    //             const msg = JSON.parse(event.data);
    //             console.log("서버에서 받은 보낸사람");
    //             console.log(msg);
    //             //unreadCounts를 업데이트합니다.
    //             setUnreadCount(prevCounts => ({
    //                 ...prevCounts,
    //                 [msg.sender]: (prevCounts[msg.sender] || 0) + 1
    //             }));
    //         }
    //     }
    // }, [socket]);
    useEffect(() => {
        if (message) {
            console.log("서버에서 받은 메시지:", message);
            setUnreadCount(prevCounts => ({
                ...prevCounts,
                [message.sender]: (prevCounts[message.sender] || 0) + 1
            }));
        }
    }, [message]);

    // //db에서 안읽은거 불러오기
    const getUnreadMessageCount = async (users) => {
        try {
            const userNickNames = users.map(user => user.friends.userNickName);

            const response = await axios.post('/chatroom/unread-messages',
                {userNickName: userNickNames},
                {
                    headers: {
                        "Authorization": localStorage.getItem("Authorization")
                    }
                })
            if(response.data && response.data.items) {
                const unreadCnt = {};
                response.data.items.forEach((count, index) => {
                    unreadCnt[userNickNames[index]] = count;
                });
                setUnreadCount(unreadCnt);
            }

        } catch (e) {
        }
    }

    return (
        <div className={"friendsListDiv"}>
            <div className={"nationally"}>
                <img src={
                    getNationalityFlag(FriendNationally)}
                     alt="Nationality flag"
                     className={"flag"}
                />
                <div className={"nationally_text"}>{FriendNationally}</div>
            </div>
            <div className={"friendsList"}>
                <div className={"friendsList_2"}>
                    <TransitionGroup>
                        {userList && userList.map(user => (
                            <CSSTransition key={user.id} timeout={500} classNames="item">
                            <FreindsListItem
                                             onRemove={removeItemFromList} frd={user} onData={onData} setChatType={setChatType} friendsChatDiv={friendsChatDivOn} unreadCount={unreadCount[user.friends.userNickName] || 0}>
                            </FreindsListItem>
                            </CSSTransition>
                        ))}
                    </TransitionGroup>
                    </div>
            </div>
        </div>
    );
});


export default FreindsList;