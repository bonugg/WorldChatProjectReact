import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {Link, useNavigate, useParams} from "react-router-dom";

const FriendsListItem = ({frds}) => {

    const {id, user, friends, statement} = frds;
    const navi = useNavigate();

    const createChat = useCallback((e) => {
        const id = e.target.dataset.id;
        const createChatAxios = async() => {
            try {
                const response = await axios.post('/chat/create', {userId: id},
                    {headers: {
                            'Authorization': localStorage.getItem('Authorization')
                           }
                    });
                if(response.data && response.data.item.chatroom.id) {
                    const roomId = response.data.item.chatroom.id;
                    navi(`/chat/${roomId}`);
                }
            } catch (e) {
                console.log(e);
            }
        }
        createChatAxios();
    },[]);

    const deleteFrd = async (e) => {
        const id = e.target.dataset.id;
        try {
            const response = await axios.post("/friends/delete-friends", {userId: id},
                {
                    headers: {
                        'Authorization': localStorage.getItem('Authorization')
                    }
                })
            console.log(response);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <tr>
            <td>{id}</td>
            <td>{user.userName}</td>
            <td>{friends.userName}</td>
            <td>{statement}</td>
            <button type='submit' onClick={createChat} data-id={friends.userId}>1:1채팅</button>
            <button type='submit' onClick={deleteFrd} data-id={friends.userId}>친삭</button>
        </tr>
    )
}
export default FriendsListItem;