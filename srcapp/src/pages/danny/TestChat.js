import {useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import * as StompJs from "@stomp/stompjs";

const TestChat = () => {
    const [chatList, setChatList] = useState([]);
    const [chat, setChat] = useState('');
    const {apply_id} = useParams();
    const client = useRef({});

    const connect = () => {
        client.current = new StompJs.Client({
            brokerURL: 'ws://localhost:9002/ws',
            onConnect:() => {
                console.log("호잇");
                subscribe();
            },

        });
        client.current.activate();
    };

    const publish = (chat) => {
        if(!client.current.connected) return;

        client.current.publish({
            destination: '/pub/chat',
            body: JSON.stringify({
                applyId: apply_id,
                chat: chat,
            }),
        });
        setChat('');
    };

    const subscribe = () => {
        client.current.subscribe('/sub/chat/' + apply_id, (body) => {
           const json_body = JSON.parse(body.body);
           setChatList((_chat_list) => [
               ..._chat_list, json_body
           ]);
        });
    };

    const disconnect = () => {
        client.current.deactivate();
    };

    const handleChange = (e) => {
        setChat(e.target.value)
    };

    const handleSubmit = (e, chat) => {
        e.preventDefault();
        publish(chat);
    };


    useEffect(() => {
        connect();

        return () => disconnect();
    }, []);

    return (
        <div>
            <div className={'chat-list'}></div>
            <form onSubmit={(e) => handleSubmit(e, chat)}>
                <div>
                    <input type={'text'} name={'chatInput'} onChange={handleChange} value={chat}/>
                </div>
                <input type={"submit"} value={"의견 보내기"}/>
            </form>            
        </div>
    );
};

export default TestChat;