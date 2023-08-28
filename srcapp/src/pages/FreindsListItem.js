import React, {useState} from 'react';

import Button from "@mui/material/Button";
import "./css/FreindsList.css";
import Profile from "../img/profile.png";

const FreindsListItem = React.memo(({user, friendsChatDiv}) => {
    const {userId, userName, userNickName, userProfileName} = user;
    const friendsChatDivOn = (userId, userNickName) => {
        friendsChatDiv(true, userId, userNickName);
    };
    return (
        <div className={"friendsList_item_div"}>
            <div className={"friendsList_item_div2"}>
                <div className={"friendsList_item_img"}
                >
                    <img
                        className={"myPageDiv_profile_img2"}
                        src={userProfileName ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/"+ userProfileName : Profile}
                    />
                </div>
                <div className={"friendsList_item_nickname"}>
                    <span className={"friendsList_item_nickname_text"}>{userNickName}</span>
                </div>
                <div className={"friendsList_item_btn_div"}>
                    <Button
                        className={"friendsList_item_btn"}
                        onClick={() => friendsChatDivOn(userId, userNickName)}
                    >
                        1:1 Chat
                    </Button>
                    <Button
                        className={"friendsList_item_btn2"}
                    >
                        Video Chat
                    </Button>
                    <Button
                        className={"friendsList_item_btn2"}
                    >
                        Voice Chat
                    </Button>
                </div>
            </div>
        </div>
    );
});

export default FreindsListItem;