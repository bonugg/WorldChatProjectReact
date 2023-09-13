import React, {useCallback, useState, useEffect} from 'react';

import Button from "@mui/material/Button";
import "./css/FreindsList.css";
import Profile from "../img/profile.png";
// import rtcConnect from "../components/rtc/rtcChat"
import styled, {keyframes} from "styled-components";
import ChatIcon from '@mui/icons-material/Chat';
import VideoChatIcon from '@mui/icons-material/VideoChat';
import PhoneIcon from '@mui/icons-material/Phone';
import axios from "axios";
import ClearIcon from "@mui/icons-material/Clear";

const slideDown = keyframes`
  0% {
    width: 0px;
    height: 0px;
  }
  100% {
    width: 100%;
    height: 90px;
  }
`;
const slideUp = keyframes`
  0% {
    width: 100%;
    height: 90px;
    opacity: 1;
  }
  100% {
    width: 0px;
    height: 0px;
    opacity: 0;
  }
`;

const DivStyledMenu = styled.div`
  visibility: ${props => (props.visible ? "visible" : "")};
  animation: ${props => (props.visible ? slideDown : slideUp)} 0.35s ease-in-out;
  position: absolute;
  top: 0;
  right: 0;
  width: ${props => (props.visible ? "100%" : "0px")};
  height: ${props => (props.visible ? "90px" : "0px")};
  transform-origin: center;
  padding: 0px 10px;
  transition: width 0.25s ease-in-out, height 0.25s ease-in-out;
  z-index: ${props => (props.visible ? "2" : "0")};
  opacity: ${props => (props.visible ? "1" : "0")};
`;
const FreindsListItem = React.memo(({onRemove, frd, friendsChatDiv, onData, setChatType, unreadCount}) => {
    const {id, user, friends, statement} = frd;
    //
    const [status, setStatus] = useState(false);

    async function checkOnlineStatus(name) {
        //친구목록 확인 시 온라인 유저 확인하는 비동기 요청
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name})
        };
        const response = await fetch('/online', requestOptions);
        const isOnline = await response.json();

        if (isOnline) {
            setStatus(true);
        } else {
            setStatus(false);
        }
    }

    checkOnlineStatus(friends.userName);
    const [deleteDiv, setDeleteDiv] = useState(false);
    const [statements, setStatements] = useState(false);


    const friendsChatDivOn = (userId, userNickName) => {
        friendsChatDiv(true, userId, userNickName);
    };

    const Rtc = (type) => {
        onData(friends.userName);
        setChatType(type);

    }
    const deleteDivStart = () => {
        setDeleteDiv(true);
    }
    const deleteCancle = () => {
        setDeleteDiv(false);
    }
    const deleteFriend = async () => {
        try {
            const response = await axios.post('/friends/delete-friends', {userId: friends.userId},
                {
                    headers: {
                        "Authorization": localStorage.getItem("Authorization"),
                    }
                });
            if (response.data.item.msg == "delete ok") {
                setStatements(true);
                setTimeout(() => onRemove(id), 1000);  // Add this line
            }
        } catch (e) {
        }
    }

    return (
        <div className={"friendsList_item_div"}>
            <DivStyledMenu visible={deleteDiv}>
                <div className={statements ? "friendsList_delete_div" : "friendsList_delete_div2"}>
                        <span className={"friend_del_text"}>
                            delete your friend?
                        </span>
                    <Button
                        onClick={deleteFriend}
                        className={"friend_del_btn_1 one"}
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={deleteCancle}
                        className={"friend_del_btn_1"}
                    >
                        Cancle
                    </Button>
                </div>
            </DivStyledMenu>
            <div className={deleteDiv ? "friendsList_item_div3 one" : "friendsList_item_div3"}>
                <div className={"friendsList_item_img"}
                >
                    <img
                        className={"myPageDiv_profile_img2"}
                        src={friends.userProfileName ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + friends.userProfileName : Profile}
                    />
                </div>
                <div className={"friendsList_item_nickname"}>
                    <span className={"friendsList_item_nickname_text"}>{friends.userNickName}</span>
                </div>
                <div className={"friendsList_item_btn_div"}>
                    <Button
                        className={"friendsList_item_btn"}
                        style={{opacity: 1}}
                        onClick={() => friendsChatDivOn(friends.userId, friends.userNickName)}
                    >
                        <ChatIcon style={{fontSize: 'small'}}/>
                        {unreadCount > 0 && <span className="unread-count">{Math.min(unreadCount, 99)}</span>}
                    </Button>
                    <Button
                        style={status ? {opacity: 1} : {opacity: 0.3, pointerEvents: 'none'}}
                        onClick={() => Rtc("video")}
                        className={"friendsList_item_btn2"}
                    >
                        <VideoChatIcon style={{fontSize: 'small'}}/>
                    </Button>
                    <Button
                        style={status ? {opacity: 1} : {opacity: 0.3, pointerEvents: 'none'}}
                        onClick={() => Rtc("voice")}
                        className={"friendsList_item_btn2"}
                    >
                        <PhoneIcon style={{fontSize: 'small'}}/>
                    </Button>
                    <Button
                        onClick={deleteDivStart}
                        className={"friendsList_item_btn2 del"}
                    >
                        <ClearIcon style={{fontSize: 'small'}}/>
                    </Button>
                </div>
                <div className={deleteDiv ? "userMessage_div one" : "userMessage_div"}>
                    {friends.userMessage == "" ?
                        <span className={"userMessage"}>No status Message</span>
                        :
                        <span className={"userMessage"}>{friends.userMessage}</span>
                    }
                </div>
            </div>

        </div>
    );
});


export default FreindsListItem;