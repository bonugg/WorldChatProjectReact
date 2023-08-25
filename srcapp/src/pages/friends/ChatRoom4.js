import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import * as StompJs from "@stomp/stompjs";
import * as SockJS from "sockjs-client";
import ChatHistoryItem from "./ChatHistoryItem";
import "./test.css";
import Picker from '@emoji-mart/react'  // <-- 추가
import data from '@emoji-mart/data'

const ChatRoom4 = () => {
    const {roomId} = useParams();
    const client = useRef({});
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const userName = localStorage.getItem("userName");

    const [shouldDetectLanguage, setShouldDetectLanguage] = useState(false);
    const shouldDetectLanguageRef = useRef(shouldDetectLanguage);
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const selectedLanguageRef = useRef(selectedLanguage);
    const languages = {
        "en": "English",
        "ko": "Korean(한국어)",
        "ja": "Japanese(日本語)",
        "zh-CN": "Chinese Simplified(简体中文)",
        "zh-TW": "Chinese Traditional(中國傳統語言)",
        "vi": "Vietnamese(Tiếng Việt)",
        "id": "Indonesian(bahasa Indonésia)",
        "th": "Thai(ภาษาไทย)",
        "de": "German(das Deutsche)",
        "ru": "Russian(Русский язык)",
        "es": "Spanish(español)",
        "it": "Italian(Italia)",
        "fr": "French(Français)"

    };

    useEffect(() => {
        shouldDetectLanguageRef.current = shouldDetectLanguage;
    }, [shouldDetectLanguage]);

    useEffect(() => {
        selectedLanguageRef.current = selectedLanguage;
    }, [selectedLanguage]);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        }
    },[]);

    const getChatMessageFromDB = async () => {
        try {
            const response = await axios.get(`/chatroom/${roomId}`, {
                headers: {
                    Authorization: `${localStorage.getItem('Authorization')}`
                }
            });
            console.log(response);
            if(response.data && response.data.items) {
                setChatHistory(() => response.data.items);
            }
        } catch (e) {
            console.log(e);
        }
    }

    const checkOther = async () => {
        try {
            const response = await axios.get(`/chatroom/check-other/${roomId}`, {
                headers: {
                    Authorization: `${localStorage.getItem('Authorization')}`
                }
            });
            console.log(response);
            if(response.data.item.msg == "friend is offline") {
                alert("친구가 채팅방에 없음");
            } else {
                alert("친구가 채팅방에 있음");
            }
        } catch (e) {
            console.log(e);
        }
    }

    const connect = () => {
        client.current = new StompJs.Client({
            webSocketFactory: () => new SockJS("/friendchat"),
            debug: (frame) => {
                console.log(frame);
            },
            onConnect:() => {
                getChatMessageFromDB();
                // checkOther();
                client.current.subscribe(`/frdSub/${roomId}`, async ({body}) => {

                    console.log("Received a message", body);

                    console.log("Message received. Should detect language:", shouldDetectLanguageRef.current);  // 이 부분 추가

                    const receivedMessage = JSON.parse(body);
                    console.log(receivedMessage);
                    if (receivedMessage.type === "status") {
                        if (receivedMessage.content === "online") {
                            updateReads();
                        }
                    } else {
                        if (receivedMessage.sender !== "qwe" && shouldDetectLanguageRef.current) {
                            const translatedText = await detectAndTranslate(receivedMessage.message);
                            if (translatedText) {
                                receivedMessage.translatedMessage = translatedText;
                            }
                        }
                        setMessages((messages) => [...messages, receivedMessage]);
                    }
                });
            },
            connectHeaders: {
                Authorization: `${localStorage.getItem('Authorization')}`,
                roomId: roomId
            },
            onStompError: (frame) => {
                console.error("에러러어어어ㅓ엉")
                console.error(frame);
            },
        });
        client.current.activate();
    };

    const disconnect = () => {
        client.current.deactivate();
    };

    const onChangeMessage = (e) => {
        setMessage(e.target.value);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        publish(message);
        setMessage("");
    };

    const publish = (msg) => {
        if(!client.current.connected) {
            return;
        }
        client.current.publish({
            destination: "/frdPub/friendchat",
            body: JSON.stringify({
                "roomId": roomId,
                "message": msg,
            })
        });
    };

    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files);
    };

    const uploadFiles = () => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        // 각 파일을 순회하며 업로드합니다.
        for(let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];

            const formData = new FormData();
            formData.append("file", file);
            formData.append("roomId", roomId);

            axios.post('/chatroom/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => {
                    const data = response.data;
                    const chatMessage = {
                        "roomId": roomId,
                        "message": "파일을 보냈습니다.",
                        "s3DataUrl": data.s3DataUrl,
                        "fileName": file.name,
                        "fileDir": data.fileDir
                    };
                    client.current.publish({
                        destination: "/frdPub/friendchat",
                        body: JSON.stringify(chatMessage)
                    });
                })
                .catch((error) => {
                    alert(error);
                });
        }
    };

    const downloadFile = (name, dir) => {
        const url = `/download/${name}`;

        axios({
            method: 'get',
            url: url,
            params: { "fileDir": dir },
            responseType: 'blob'
        })
            .then((response) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(new Blob([response.data]));
                link.download = name;
                link.click();
            })
            .catch((error) => {
                console.error("Download error", error);
            });
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    }

    const addEmoji = (e) => {
        let emoji = e.native;
        setMessage(prevMessage => prevMessage + emoji);
    }

    const detectAndTranslate = async (text) => {

        console.log(text);
        console.log("선택된 언어 제발요");
        console.log(selectedLanguage);
        const targetLanguage = selectedLanguageRef.current;
        console.log(targetLanguage);

        try {
            const detectResponse = await axios.post("/language/detect", { query: text }, {
                headers: {
                    Authorization: `${localStorage.getItem('Authorization')}`
                }
            });

            console.log(detectResponse);
            console.log(detectResponse.data);

            console.log("여기에 문제가 있을거같긴해 나도. 이게 제일 못미더워");

            if (detectResponse.data && detectResponse.data.langCode) {
                const detectedLanguage = detectResponse.data.langCode;

                const translateResponse = await axios.post("/language/translate", {
                    text: text,
                    sourceLanguage: detectedLanguage,
                    targetLanguage: targetLanguage
                }, {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                });

                console.log("번역해주세여~~~~");
                console.log(translateResponse);
                console.log(translateResponse.data.message.result.translatedText)

                if (translateResponse.data && translateResponse.data.message.result.translatedText) {
                    return translateResponse.data.message.result.translatedText;
                } else {
                    console.error("Error translating text");
                    return null;
                }

            } else {
                console.error("Error detecting language");
                return null;
            }

        } catch (error) {
            console.error("Error in detectAndTranslate:", error);
            return null;
        }
    };

    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
        console.log("언어선택 했어요. 진짜로 했어요");
        console.log(e.target.value);
    };

    const updateReads = async () => {
        try {
            const response = await axios.put(`/chatroom/${roomId}`, null, {
                headers: {
                    Authorization: `${localStorage.getItem('Authorization')}`
                }
            });
            console.log(response.data.items);
            console.log("안읽은거 읽음처리 됐냐???")
            if(response.data && response.data.items) {
                const updatedMessages = response.data.items;
                setMessages(prevMessages => prevMessages.map(msg => {
                    const updateMsg = updatedMessages.find(uMsg => uMsg.id == msg.id);
                    return updateMsg ? updateMsg : msg;
                }));
            };
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div>
            <h1>채팅방 RoomId: {roomId}</h1>
            <div className={"chat_ul"}>
                {chatHistory && chatHistory.map(chats => (
                    <ChatHistoryItem key={chats.id} chats={chats} downloadFile={downloadFile}></ChatHistoryItem>
                ))}
                {messages == null
                    ? null
                    : messages.map((item, index) => (

                        <div key={index}>
                            <div>{item.id}</div>
                            <div>{item.checkRead ? "읽음" : "안읽음"}</div>
                            <div>{item.createdAt}</div>
                            <div>{item.sender}</div>
                            <div>{item.translatedMessage ? `(번역) ${item.translatedMessage}` : item.message}</div>
                            {item.s3DataUrl && (
                                <div>
                                    {item.fileName.match(/\.(jpg|jpeg|png|gif)$/i)
                                        ? <img src={item.s3DataUrl} width="300" height="300" alt="uploaded" />
                                        : item.fileName.match(/\.(mp4|webm|ogg)$/i)
                                            ? <video src={item.s3DataUrl} width="300" controls /> // 동영상 렌더링
                                            : <div>{item.fileName}</div> // 파일 이름 렌더링
                                    }
                                    <button onClick={() => downloadFile(item.fileName, item.fileDir)}>Download</button> {/* 다운로드 버튼 */}
                                </div>
                            )}
                        </div>
                    ))
                }
            </div>
            <div>
                <label>Select Language for Translation:</label>
                <select value={selectedLanguage} onChange={handleLanguageChange}>
                    {Object.entries(languages).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={shouldDetectLanguage}
                        onChange={() => {
                            setShouldDetectLanguage(prev => !prev);
                            console.log("Checkbox clicked. Should detect language:", !shouldDetectLanguage);
                        }}
                    />
                    activate translation
                </label>
            </div>
            <form onSubmit={sendMessage}>
                <input type={"text"} value={message} onChange={onChangeMessage}/>
                <button type="button" onClick={toggleEmojiPicker}>😃</button>
                {showEmojiPicker && (
                    <Picker data={data} onEmojiSelect={addEmoji} />
                )}
                <button type="submit">보내기</button>
                <input type="file" id="file" onChange={handleFileChange} multiple/>
                <button type="button" onClick={uploadFiles}>파일 업로드</button>
            </form>
        </div>
    )
}
export default ChatRoom4;