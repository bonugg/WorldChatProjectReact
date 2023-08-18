import React, {useEffect, useRef, useState} from "react";
import FreindsListItem from './FreindsListItem';
import Korea from "../img/flag/Korea-flag.png";
import UnitedStates from "../img/flag/United-states-flag.png";
import Japan from "../img/flag/Japan-flag.png";
import Canada from "../img/flag/Canada-flag.png";
import Australia from "../img/flag/Australia-flag.png";
import China from "../img/flag/China-flag.png";
import Italy from "../img/flag/Italy-flag.png";
import Russia from "../img/flag/Russia-flag.png";
import Taiwan from "../img/flag/Taiwan-flag.png";
import Ukraine from "../img/flag/Ukraine-flag.png";
import Philippines from "../img/flag/Philippines-flag.png";

import "./css/FreindsList.css";

const FreindsList = ({FriendNationally, logoutApi3, FriendsList, onData, setChatType}) => {
    // useEffect(()=>{console.log("부모"+aa)},[aa])
    const [userList, setUserList] = useState([]);
    const [nationallyName, setNationallyName] = useState('');
    const freindsList = async (retry = true) => {
        
        try {
            const response = await fetch('/api/v1/user/friendsList', {
                method: 'POST',
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
            console.log(response);
            const data = await response.json();
            console.log(data);
            if (data) {
                setUserList(() => data.items);
            }
        } catch (error) {
            if (retry) {
                await freindsList(false);
            }
        }
    }

    useEffect(() => {
        if (FriendsList) {
            freindsList();
            setNationallyName(FriendNationally);
        }else {
            setNationallyName('');
        }
    }, [FriendsList]);


    // 국적 이미지 대응
    const flagImage = {
        KR: Korea,
        US: UnitedStates,
        CA: Canada,
        JP: Japan,
        CN: China,
        PH: Philippines,
        RU: Russia,
        TW: Taiwan,
        UA: Ukraine,
        AU: Australia,
        IT: Italy,
    };

    const getNationalityFlag = (nationality) => {
        if(nationality == ''){

        }
        return flagImage[nationality] || null;
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
                        {userList && userList.map(user => <FreindsListItem key={user.userId}
                                                                           user={user} onData={onData} setChatType={setChatType}></FreindsListItem>)}
                </div>
            </div>
        </div>
    );
};


export default FreindsList;