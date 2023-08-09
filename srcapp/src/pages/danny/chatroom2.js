import {useEffect, useRef, useState} from "react";
import * as StompJs from "@stomp/stompjs";
import {useParams} from "react-router-dom";

let client = null;
const Chatroom2 = () => {
    const [chatList, setChatList] = useState([]);
    const [chat, setChat] = useState('');

    const {apply_id} = useParams();

 //   const client = useRef({});

    // useEffect(() => {
    //     connect();
    //     return () => disconnect();
    // }, []);
useEffect(() => {
    client = new StompJs.Client({
        brokerURL: 'ws://localhost:9002/ws',
        connectHeaders: {
            Authorization: `${localStorage.getItem('Authorization')}`
        },
        debug: function (str) {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    client.onConnect = function (frame) {
        subscribe(frame);
    }
},[]);


    // const connect = () => {
    //     client.current = new StompJs.Client({
    //         brokerURL: 'ws://localhost:9002/ws',
    //         onConnect: () => {
    //             console.log('success');
    //             subscribe();
    //         },
    //     });
    //     client.activate();
    // };

    const subscribe = () => {
        client.subscribe('/sub/chat/' + apply_id, (body) => {
            const json_body = JSON.parse(body.body);
            setChatList((chatList) => [
                ...chatList, json_body
            ]);
        });
    };

    const disconnect = () => {
        client.deactivate();
    };

    const handleChange = (event) => { // 채팅 입력 시 state에 값 설정
        setChat(event.target.value);
    };

    const handleSubmit = (event, chat) => { // 보내기 버튼 눌렀을 때 publish
        event.preventDefault();

        publish(chat);
    };

    const publish = (chat) => {
        if (!client.connected) {
            return;
        }

        client.publish({
            destination: '/pub/chat',
            body: JSON.stringify({
                applyId: apply_id,
                chat: chat,
            }),
        });
        setChat('');
    };

    return (
        <div>
            <div className={'chat-list'}>{chatList}</div>
            <form onSubmit={(event) => handleSubmit(event, chat)}>
                <div>
                    <input type={'text'} name={'chatInput'} onChange={handleChange} value={chat} />
                </div>
                <button type={'submit'}>입력</button>
            </form>
        </div>
    );
};

export default Chatroom2;