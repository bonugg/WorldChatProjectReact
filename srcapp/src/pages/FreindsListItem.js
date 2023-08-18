import React, {useState} from 'react';

import Button from "@mui/material/Button";
import "./css/FreindsList.css";
import Profile from "../img/profile.png";
// import rtcConnect from "../components/rtc/rtcChat"
import styled, {keyframes} from "styled-components";

const FreindsListItem = ({user , onData,setChatType}) => {
    const slideDown = keyframes`
      0% {
        transform: scale(0);
      }
      100% {
        transform: scale(1);
      }
    `;
    const DivStyledMenu = styled.div`
      visibility: ${props => props.visible ? 'visible' : 'hidden'};
      animation: ${props => props.visible ? slideDown : ""} 0.35s ease-in-out;
      position: absolute;
      left: 50%;
      top: 50%;
      transform-origin: center;
      transform: ${props => props.visible ? 'translate(-50%, -50%) scaleY(1)' : 'translate(-50%, -50%) scaleY(0)'};
    `;
    const {userId, userName, userNickName, userProfileName} = user;
    // const [showRtcChat, setShowRtcChat] = useState(false); // RtcChat 상태를 boolean으로 관리
    // const rtcTest = () =>{
    //     rtcConnect();
    // }
    const Rtc = (type) => {
        console.log("자식"+userName)
        onData(userName);
        setChatType(type);

    }

    
    return (
        <div>
            {/*<DivStyledMenu visible={Rtc}>*/}
            {/*    {showRtcChat && <ChatComponent/>} /!* RtcChat 상태가 true일 때 rtcChat 컴포넌트 렌더링 *!/*/}
            {/*</DivStyledMenu>*/}
            <div className={"friendsList_item_div"}>
                <div className={"friendsList_item_div2"}>
                    <div className={"friendsList_item_img"}
                    >
                        <img
                            className={"myPageDiv_profile_img2"}
                            src={userProfileName ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + userProfileName : Profile}
                        />
                    </div>
                    <div className={"friendsList_item_nickname"}>
                        <p className={"friendsList_item_nickname_text"}>{userNickName}</p>
                    </div>
                    <div className={"friendsList_item_btn_div"}>
                        <Button
                            className={"friendsList_item_btn"}
                        >
                            1:1 Chat
                        </Button>
                        <Button
                            onClick={() => Rtc("video")} className={"friendsList_item_btn2"}
                        >
                            Video Chat
                        </Button>
                        <Button
                            onClick={() => Rtc("voice")} className={"friendsList_item_btn2"}
                        >
                            Voice Chat
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreindsListItem;