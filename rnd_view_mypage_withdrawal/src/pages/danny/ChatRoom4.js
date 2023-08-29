import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import * as StompJs from "@stomp/stompjs";
import * as SockJS from "sockjs-client";

const ChatRoom4 = () => {
    const {roomId} = useParams();
    console.log(roomId);
    const client = useRef({});
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        connect();

        const getChatMessage = async () => {
            try {
                const response = await axios.get(`/chat/${roomId}`, {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                });
                console.log(response);
            } catch (e) {
                console.log(e);
            }
        }
        getChatMessage();
    },[]);

    const connect = () => {
        client.current = new StompJs.Client({
            webSocketFactory: () => new SockJS("/ws"),
            debug: (frame) => {
                console.log("렌더링 하자마자해줘...")
                console.log("debug");
                console.log(frame);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect:() => {
                client.current.subscribe(`/topic/${roomId}`, ({body}) => {
                    setMessages((msgs) => [...msgs, JSON.parse(body)]);
                });
                client.current.publish({
                    destination: "/app/ws",
                    body: JSON.stringify({
                        "roomId": roomId,
                        "sender": "temporary id",
                        "sendDate": ""
                    })
                })
            },
            onStompError: (frame) => {
                console.error("에러러어어어ㅓ엉")
                console.error(frame);
            },
        });
        client.current.activate();
    };

    const onChangeMessage = (e) => {
        setMessage(e.target.value);
    };

    const sendMessageBtn = () => {
        publish(message);
        setMessage("");
    };

    const publish = (msg) => {
        if(!client.current.connected) {
            return;
        }
        client.current.publish({
            destination: "/app/ws",
            body: JSON.stringify({
                "messageType": "TALK",
                "roomId": roomId,
                "sender": "temp id",
                "message": msg,
                "sendDate": ""
            })
        });
    };

    return (
        <div>
            <h1>채팅방 RoomId: {roomId}</h1>
            <ul>
                {
                    messages == null ?
                        null :
                        messages.map((item, index) => <li>{item.message}</li>)
                }
            </ul>
            <input type={"text"} value={message} onChange={onChangeMessage} />
            <input type={"button"} value="보내기" onClick={sendMessageBtn}/>
        </div>
    )
}

export default ChatRoom4;