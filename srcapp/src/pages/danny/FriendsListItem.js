import {useCallback, useEffect, useState} from "react";
import axios from "axios";

const FriendsListItem = ({frds}) => {
    const {id, user, friends, statement} = frds;

    const enterChat = useCallback((e) => {
        const id = e.target.dataset.id;
        console.log("채팅방만들래래래래래래ㅐ래래래래랠")
        const enterChatAxios = async() => {
            try {
                const response = await axios.post('/chat/create', {userId: id},
                    {headers: {
                            'Authorization': localStorage.getItem('Authorization')
                           }
                    });
                console.log(response);

            } catch (e) {
                console.log(e);
            }
        }
        enterChatAxios();
    },[]);
    return (
        <tr>
            <td>{id}</td>
            <td>{user.userName}</td>
            <td>{friends.userName}</td>
            <td>{statement}</td>
            <button type='submit' onClick={enterChat} data-id={friends.userId}>1:1채팅</button>
        </tr>
    )
}
export default FriendsListItem;