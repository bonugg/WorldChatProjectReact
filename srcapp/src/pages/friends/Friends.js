import {useCallback, useState,} from "react";
import axios from "axios";

const Friends = () => {
    const requestFrd = useCallback((e) => {
        const userId = e.target.dataset.userid;
        console.log("123123");
        const requestFrdAxios = async() => {
            try {
                const response = await axios.post('/friends/request', {userId: userId},
                    {headers: {
                    Authorization: `${localStorage.getItem('Authorization')}`
                }});
                console.log(response);
                console.log(response.data.item.msg)
                if(response.data.item.msg === "request ok") {
                    alert("Friend request completed")
                } else if(response.data.item.msg === "already frds") {
                    alert("Already a friend or waiting for a reply")
                }
            } catch (e) {
                console.log(e);
            }
        }
        requestFrdAxios();
    },[]);
    return (
            <button type="submit" id="requestFrdBtn" data-userid={602} onClick={requestFrd}>친구추가</button>

    );
};

export default Friends;