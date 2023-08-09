import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import {
    Box,
    TextField,
    Button,
    Typography,
    Avatar,
    Grid,
    Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";


const RandomChat = () => {
    const { randomRoomId } = useParams();
    const [message, setmessage] = useState("");
    const [messages, setMessages] = useState([]);
    const location = useLocation();
    const room = location.state.room; //채팅방 정보
    const client = useRef({});

    useEffect(() => {
        console.log("랜덤 채팅방 정보");
        console.log(room);
        connect();

        //socket 연결 해제
        return () => disconnect();
    }, []);

    const connect = () => {
        //endpoint 소켓 생성
        const socket = new SockJS("http://localhost:9002/random");
        //Stomp client 초기화
        const stompClient = Stomp.over(socket);
        client.current = stompClient;
        const headers = {
            "Authorization": localStorage.getItem('Authorization'),
            "userName": localStorage.getItem('userName'),
        }
        stompClient.connect(headers,
            () => onConnected(),
            (error) => onError(error)
        );
    };

    const disconnect = () => {
        if (client.current) {
            leaveEvent();
            client.current.disconnect(() => {
                console.log("disconnected");
            })
        }
    };

    
    const onConnected = () => {
        console.log("Connected to Websocket Server");
        client.current.userName = localStorage.getItem("userName");
        //발송, 수신할 구독 경로 정의
        client.current.subscribe(`/randomSub/${room.randomRoomId}`, (message) => onReceived(message));
        joinEvent();
    }


    const onError = (error) => {
        console.log('WebSocket 에러: ', error);
    }

    function onReceived(payload) {
        let payloadData = JSON.parse(payload.body);
        setMessages((prev) => [...prev, payloadData]);
    }

    function joinEvent() {
        const joinMessage = {
            type: "ENTER",
            sender: client.current.userName,
            randomRoomId: room.randomRoomId,
        };
        client.current.send(`/randomPub/${randomRoomId}/enter`, {}, JSON.stringify(joinMessage));
    }
    
    function leaveEvent() {
        if (!client || !client.connected) {
            return;
        }
        const leaveMessage = {
            type: "LEAVE",
            sender: client.current.userName,
            randomRoomId: room.randomRoomId,
        };
        client.send(`/randomPub/${randomRoomId}/leave`, {}, JSON.stringify(leaveMessage));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() !== "" || !message.trim()) {
            sendChatMessage(message);
            setmessage("");
        }else{
            return;
        }
    };

    const handleChange = (event) => {
        setmessage(event.target.value);
    };

    const sendChatMessage = (msgText) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const date = now.getDate();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();
        
        if (client.current) {
            const messageData = {
                type: "CHAT",
                content: msgText,
                time: `${year}.${month}.${date} ${hour}:${minute}:${second}`,
                randomRoomId: room.randomRoomId,
                sender: client.current.userName,
            };
            setMessages((prevMessages) => [...prevMessages, messageData]);
            console.log("Sending message: " , JSON.stringify(messageData));
            client.current.send(`/randomPub/${room.randomRoomId}`, {}, JSON.stringify(messageData));
        }
    };

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "grey.200",
            }}
        >
            <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
                {messages.map((message) => (
                    <Message key={message.id} message={message} />
                ))}
            </Box>
            <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Grid container spacing={2}>
                    <Grid item xs={10}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Type a message"
                            variant="outlined"
                            value={message}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button
                            fullWidth
                            color="primary"
                            variant="contained"
                            endIcon={<SendIcon />}
                            onClick={handleSubmit}
                        >
                            Send
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

const Message = ({ message }) => {
    const me = message.sender === localStorage.getItem('userName');

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: me ? "flex-end" : "flex-start",
                mb: 2,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: me ? "row" : "row-reverse",
                    alignItems: "center",
                }}
            >
                <Avatar sx={{ bgcolor: me ? "primary.main" : "secondary.main" }}>
                    {me ? "나" : "너"}
                </Avatar>
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        ml: me ? 1 : 0,
                        mr: me ? 0 : 1,
                        backgroundColor: me ? "primary.light" : "secondary.light",
                        borderRadius: me ? "20px 20px 20px 5px" : "20px 20px 5px 20px",
                    }}
                >
                    <Typography variant="body1">{message.content}</Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default RandomChat;