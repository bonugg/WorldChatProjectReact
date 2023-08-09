import Button from '@mui/material/Button';
import React, {useEffect, useRef, useState} from "react";
import {Stomp, Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";

import "./css/CateChat.css";
import CateChatListItem from './CateChatListItem';
import styled, {keyframes} from "styled-components";

const slideDown = keyframes`
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
`;
const DivStyledMenu = styled.div`
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  animation: ${props => props.visible ? slideDown : ""} 0.35s ease-in-out;
  position: absolute;
  left: 150%;
  top: 50%;
  transform-origin: center;
  transform: ${props => props.visible ? 'translate(-50%, -50%) scaleY(1)' : 'translate(-50%, -50%) scaleY(0)'};
`;
const MessageStyled = styled.p`
  word-wrap: break-word;

  &.my-message {
    // my-message 스타일
  }

  &.other-message {
    // other-message 스타일
  }
`;
const CateChat = () => {
    const [roomList, setRoomList] = useState([]);
    const [CateChatList, setCateChatList] = useState([]);
    const [UserList, setUserList] = useState([]);
    const [CateRoom, setCateRoom] = useState({});
    const [isChatDiv, setIsChatDiv] = useState(false);
    const [isChatDiv2, setIsChatDiv2] = useState(false);

    // stompClient를 useState로 관리합니다.
    const [stompClient, setStompClient] = useState(null);
    //메세지를 담는 상태 변수
    const [messages, setMessages] = useState([]);

    // 웹소켓 연결 함수
    const connect = () => {
        const headers = {
            Authorization: localStorage.getItem("Authorization"),
            userName: localStorage.getItem("userName")
        };

        const socket = new SockJS("/websocket-app");
        const client = Stomp.over(socket);

        const onConnect = (frame) => {
            console.log("Connected: " + frame);

            client.subscribe("/topic/" + CateRoom.cateId, (messageOutput) => {
                showMessageOutput(JSON.parse(messageOutput.body));
                console.log(messageOutput);
            });

            client.send("/app/categoryChat/addUser", headers, JSON.stringify({
                type: "JOIN",
                cateChatContent: "username" + "님이 입장하셨습니다",
                sender: "username",
                cateId: CateRoom.cateId,
            }));

            // 연결된 stompClient 객체를 저장합니다.
            setStompClient(client);
        };

        const onError = (error) => {
            console.log("Error: " + error);
        };

        client.connect(headers, onConnect, onError);
    };

    // 웹소켓 연결 종료 함수
    const disconnect = () => {
        if (stompClient !== null) {
            stompClient.disconnect();
            setStompClient(null);
        }
        console.log('Disconnected');
    };

    const showMessageOutput = (messageOutput) => {
        setMessages((prevMessages) => [...prevMessages, messageOutput]);
    };

    useEffect(() => {
        // isChatDiv가 true가 될 때 접속하고 false가 될 때 끊습니다.
        if (isChatDiv) {
            connect();
        } else {
            disconnect();
        }

        // 컴포넌트가 사라질 때 연결을 끊습니다.
        return () => {
            disconnect();
        };
    }, [isChatDiv]);

    useEffect(() => {
        console.log(messages);
    }, [messages]);

    useEffect(() => {
        roomListLoad();
    }, []);

    // 카테고리 룸 등록 후 div 업데이트 합니다
    const setCateRoomAndHandleChatDivUpdate = (chatDivUpdateValue, cateRoomValue) => {
        console.log(cateRoomValue);
        setCateRoom(cateRoomValue)
        setIsChatDiv(chatDivUpdateValue);
    };
    const handleCateChatList = (value) => {
        setCateChatList(value);
    };
    const handleUserList = (value) => {
        setUserList(value);
    };

    const [formValues, setFormValues] = useState({
        cateName: '',
        maxUserCnt: 2,
        interest: '연애',
    });

    const handleChange = (event) => {
        const {name, value} = event.target;
        setFormValues({...formValues, [name]: value});

    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (validateForm()) {
            // 여기서 formValues를 서버에 전송하거나 처리
            console.log('Form submitted:', formValues);
            cateRoomCreate();

        }
    };

    const validateForm = () => {
        // 여기에서 유효성 검사를 수행하고, 결과에 따라 true 또는 false를 반환
        return true;
    };

    const roomListLoad = async (retry = true) => {
        try {
            const response = await fetch('/api/v1/cateChat/roomList', {
                method: 'GET',
                headers: {
                    Authorization: localStorage.getItem('Authorization'),
                    'userName': localStorage.getItem('userName'),
                },
            });

            const accessToken = response.headers.get('Authorization');
            if (accessToken != null) {
                localStorage.setItem('Authorization', accessToken);
            }
            if (response.headers.get('refresh') != null) {
                alert("logout ss");
                return;
            }
            console.log(response);
            const data = await response.json();
            console.log(data);
            if (data) {
                setRoomList(() => data.items);
            }
        } catch (error) {
            if (retry) {
                await roomListLoad(false);
            }
        }
    }

    const cateRoomCreate = async (retry = true) => {
        try {
            const response = await fetch('/api/v1/cateChat/createCateRoom', {
                method: 'POST',
                headers: {
                    'Authorization': localStorage.getItem('Authorization'),
                    'userName': localStorage.getItem('userName'),
                    'Content-Type': 'application/json', // Content-Type 추가
                },
                body: JSON.stringify(formValues), // 객체를 문자열로 변환
            });

            const accessToken = response.headers.get('Authorization');
            if (accessToken != null) {
                localStorage.setItem('Authorization', accessToken);
            }
            if (response.headers.get('refresh') != null) {
                alert("logout s");
                return;
            }
            console.log(response);
            if (response.ok) {

            } else {
                if (retry) {
                    await cateRoomCreate(false);
                }
            }
        } catch (error) {
            if (retry) {
                await cateRoomCreate(false);
            }
        }
    };

    return (
        <div className={"CateChatDiv"}>
            {isChatDiv ? (
                <div className={"chat"}>
                    <div className={"EnterRoom"}>
                        <div className={"EnterRoom_2"}>
                            <div className={"EnterRoomCate"}>
                                {CateRoom.interest}
                            </div>
                            <div className={"EnterRoomName"}>
                                {CateRoom.cateName}
                            </div>
                        </div>
                    </div>
                    <div className={"EnterRoomChat"}>
                        <div className={"EnterRoomChat_2"}>
                            <div className={"EnterRoomChat_content"}>
                                <div className="EnterRoomChat_content">
                                    {messages.map((message, index) => {
                                        const isMyMessage = message.username === "username";
                                        return (
                                            <MessageStyled
                                                key={index}
                                                className={isMyMessage ? "my-message" : "other-message"}
                                            >
                                                {isMyMessage ? (
                                                    <React.Fragment>
            <span className="message-regdate">
              ({message.cateChatRegdate})
            </span>
                                                        <span
                                                            className="content">{message.cateChatContent}</span> :{" "}
                                                        <span className="userName">{message.username}</span>
                                                    </React.Fragment>
                                                ) : (
                                                    <React.Fragment>
                                                        <span className="userName">{message.username}</span> :{" "}
                                                        <span className="content">{message.cateChatContent}</span>{" "}
                                                        <span
                                                            className="message-regdate">({message.cateChatRegdate})</span>
                                                    </React.Fragment>
                                                )}
                                            </MessageStyled>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className={"EnterRoomChat_input"}>

                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={"select"}>
                    <div className={"CateChat_Room_create"}>
                        <form onSubmit={handleSubmit}>
                            <div className={"CateChat_Room_create_2"}>
                                <input
                                    style={{marginLeft: '0px'}}
                                    placeholder={"Please enter Roomname"}
                                    type="text"
                                    className={"roomName"}
                                    name="cateName"
                                    required
                                    value={formValues.cateName}
                                    onChange={handleChange}
                                />

                                <input
                                    type="number"
                                    name="maxUserCnt"
                                    min="2"
                                    className={"roomName"}
                                    required
                                    value={formValues.maxUserCnt}
                                    onChange={handleChange}
                                />

                                <select
                                    name="interest"
                                    required
                                    className={"roomName"}
                                    value={formValues.interest}
                                    onChange={handleChange}
                                >
                                    <option value="연애">연애</option>
                                    <option value="친목">친목</option>
                                    <option value="운동">운동</option>
                                    <option value="음악">음악</option>
                                    <option value="영화">영화</option>
                                    <option value="사진">사진</option>
                                    <option value="음식">음식</option>
                                    <option value="여행">여행</option>
                                    <option value="인테리어">인테리어</option>
                                    <option value="게임">게임</option>
                                    <option value="지식">지식</option>
                                    <option value="애완동물">애완동물</option>
                                    <option value="자유">자유</option>
                                </select>
                            </div>
                            <div className={"CateChat_Room_create_3"}>
                                <Button
                                    className={"roomCreate"}
                                    type="submit"
                                >CREATE
                                </Button>
                            </div>
                        </form>
                    </div>
                    <div className={"CateChat_Room_List"}>
                        <div className={"CateChat_Room_category"}>

                        </div>
                        <div className={"RoomList"}>
                            <div className={"RoomList_2"}>
                                {roomList && roomList.map(room => <CateChatListItem key={room.cateId}
                                                                                    room={room}
                                                                                    onCateRoomAndChatDivUpdate={setCateRoomAndHandleChatDivUpdate}
                                                                                    cateChatList={handleCateChatList}
                                                                                    userList={handleUserList}
                                ></CateChatListItem>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default CateChat;