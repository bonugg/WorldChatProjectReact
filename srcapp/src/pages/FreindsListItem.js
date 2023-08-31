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
const FreindsListItem = React.memo(({onRemove, frd, friendsChatDiv, onData, setChatType, socket}) => {
    const {id, user, friends, statement} = frd;
    console.log("친구가 어떤 형식으로 오냐?")
    console.log(friends);
    const [deleteDiv, setDeleteDiv] = useState(false);
    const [statements, setStatements] = useState(false);

    //메시지 개수 표시
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const getUnreadMessageCount = async () => {
            try {
                const response = await axios.post('/chatroom/unread-messages',
                    {userNickName: friends.userNickName},
                    {
                        headers: {
                            "Authorization": localStorage.getItem("Authorization")
                        }
                    })
                console.log("안읽은 메시지 개수")
                console.log(response);
                setUnreadCount(response.data.item);
            } catch (e) {
                console.log(e);
            }
        }
        getUnreadMessageCount();
    },[]);

    useEffect(() => {
        if (socket) {
            console.log("소켓상태는?")
            console.log(socket)
            socket.onmessage = (event) => {
                console.log("이벤트 찍히냐?")
                console.log(event);
                const data = event.data;
                console.log("데이타 받아오냐?")
                console.log(data);

                if (data === '1') {
                    setUnreadCount(prevCount => prevCount + 1);
                }
            };
        }

        return () => {
            if (socket) {
                socket.onmessage = null;
                console.log("이게 찍히는건가?")
            }
        };
    }, [socket]);

    const friendsChatDivOn = (userId, userNickName) => {
        friendsChatDiv(true, userId, userNickName);
    };

    const Rtc = (type) => {
        console.log("이름" + friends.userName);
        onData(friends.userName);
        setChatType(type);

    }
    const deleteDivStart = () => {
        setDeleteDiv(true);
    }
    const deleteCancle = () => {
        setDeleteDiv(false);
    }
    const deleteFriend = useCallback((e) => {
        const deleteFriendAxios = async () => {
            try {
                const response = await axios.post('/friends/delete-friends', {userId: friends.userId},
                    {
                        headers: {
                            "Authorization": localStorage.getItem("Authorization"),
                        }
                    });
                console.log(response);
                console.log(response.data);
                console.log(response.data.item);
                if (response.data.item.msg == "delete ok") {
                    setStatements(true);
                    setTimeout(() => onRemove(id), 1000);  // Add this line
                }
            } catch (e) {
                console.log(e);
            }
        }
        deleteFriendAxios();
    }, [onRemove]);

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
            <div className={deleteDiv ? "friendsList_item_div2" : "friendsList_item_div3"}>
                <Button
                    onClick={deleteDivStart}
                    className={"friend_del_btn"}
                >
                </Button>
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
                        onClick={() => friendsChatDivOn(friends.userId, friends.userNickName)}
                    >
                        <ChatIcon/>
                        {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
                    </Button>
                    <Button
                        onClick={() => Rtc("video")}
                        className={"friendsList_item_btn2"}
                    >
                        <VideoChatIcon/>
                    </Button>
                    <Button
                        onClick={() => Rtc("voice")}
                        className={"friendsList_item_btn2"}
                    >
                        <PhoneIcon/>
                    </Button>
                </div>
            </div>
        </div>
    );
});


export default FreindsListItem;