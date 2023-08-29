import React, {useState} from 'react';

import Button from "@mui/material/Button";
import "./css/FreindsList.css";
import Profile from "../img/profile.png";

const FreindsListItem = React.memo(({user}) => {
    const {userId, userName, userNickName, userProfileName} = user;
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