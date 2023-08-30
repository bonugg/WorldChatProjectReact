import {useEffect, useRef, useState} from "react";
import axios from "axios";
import FriendsListItem from "./FriendsListItem";
import SockJS from "sockjs-client";
import * as StompJs from "@stomp/stompjs";


const FriendsList = () => {
    const [friendsList, setFriendsList] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const client = useRef({});

    // const connect = () => {
    //     client.current = new StompJs.Client({
    //         webSocketFactory: () => new SockJS("/friendchat"), // 웹소켓 엔드포인트 주소를 입력하세요.
    //         onConnect: () => {
    //             client.current.subscribe(`//${localStorage.getItem('userId')}`, ({body}) => {
    //                 const data = JSON.parse(body);
    //                 // 받은 데이터를 기반으로 unreadCounts 상태를 업데이트합니다.
    //                 setUnreadCounts(data);
    //             });
    //         },
    //         connectHeaders: {
    //             Authorization: `${localStorage.getItem('Authorization')}`
    //         }
    //     });
    //     client.current.activate();
    // };


    useEffect(() => {
        const getFriendsListAxios = async () => {
            try {
                const response = await axios.get('/friends/friends-list', {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                })
                console.log("응답하라")
                console.log(response);
                console.log(response.data)
                if(response.data && response.data.item.friendsList) {
                    setFriendsList(() => response.data.item.friendsList);
                }
            } catch (e) {
                console.log(e);
            }
        }
        getFriendsListAxios();
    }, []);
    return (
        <div>
            <table>
                {friendsList && friendsList.map(frds => (
                    <FriendsListItem key={frds.id} frds={frds}></FriendsListItem>
                ))}
            </table>
        </div>
    );
};

export default FriendsList;