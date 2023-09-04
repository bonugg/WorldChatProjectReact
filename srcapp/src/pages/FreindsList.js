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


const FreindsList = React.memo(({onRemove, FriendListApi, FriendNationally, logoutApi3, FriendsList,isOneOnOneChatDiv,onData, setChatType, socket}) => {
    const [userList, setUserList] = useState([]);
    const freindsList = async (retry = true) => {
        try {
            console.log(FriendNationally);
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
            console.log(data);
            if(data && data.items) {
                setUserList(() => data.items);
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
        console.log(FriendListApi);
        if (FriendListApi) {
            freindsList();
        }else {
            setUserList([]);
        }
    }, [FriendNationally]);


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
        console.log("아이디 출력 "+id)
        setUserList(prevList => {
            const updatedList = prevList.filter(item => item.id != id);
            onRemove(updatedList.length);
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
    };

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
                            <CSSTransition  key={user.id} timeout={500} classNames="item">
                            <FreindsListItem
                                             onRemove={removeItemFromList} frd={user} onData={onData} setChatType={setChatType} friendsChatDiv={friendsChatDivOn} socket={socket}>
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