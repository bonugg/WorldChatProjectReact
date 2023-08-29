import {useEffect, useState} from "react";
import axios from "axios";
import ChatRoomListItem from "./ChatRoomListItem";

const ChatRoomList = () => {
    const [chatRoomList, setChatRoomList] = useState([]);

    useEffect(() => {
        const getChatRoomListAxios = async () => {
            try {
                const response = await  axios.get('/chat/chatroom-list',
                    {
                        headers: {
                            Authorization: `${localStorage.getItem('Authorization')}`
                        }
                    })
                console.log(response);
                if(response.data && response.data.items) {
                    setChatRoomList(() => response.data.items);
                }
            } catch (e) {
                console.log(e);
            }
        }
        getChatRoomListAxios();
    }, [])
    return (
        <div>
            <table>
                {chatRoomList && chatRoomList.map(chatroom => (
                    <ChatRoomListItem key={chatroom.id} chatRoom={chatroom}></ChatRoomListItem>
                ))}
            </table>
        </div>
    )
}

export default ChatRoomList;