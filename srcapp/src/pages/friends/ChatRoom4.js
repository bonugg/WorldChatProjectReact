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
    //const userName = `${localStorage.getItem('userName')}`
    const client = useRef({});
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [translate, setTranslate] = useState(false);
    const [targetLang, setTargetLang] = useState('en');

    const languages = [
        {code: 'en', label: 'English'},
        {code: 'ko', label: 'Korean'},
        {code: 'ja', label: 'Japanese'},
        // 추가로 필요한 언어들을 여기에 추가
    ];

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

    const connect = () => {
        client.current = new StompJs.Client({
            webSocketFactory: () => new SockJS("/friendchat"),
            debug: (frame) => {
                console.log(frame);
            },
            onConnect:() => {
                getChatMessageFromDB();
                client.current.subscribe(`/frdSub/${roomId}`, async ({body}) => {
                    const receivedMessage = JSON.parse(body);
                    if (translate) {
                        receivedMessage.message = await detectLanguageAndTranslate(receivedMessage.message);
                    }
                    setMessages((messages) => [...messages, receivedMessage]);
                });
            },
            connectHeaders: {
                Authorization: `${localStorage.getItem('Authorization')}`
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


    const sendMessage = async (e) => {
        e.preventDefault();

        let finalMessage = message;
        if (translate) {
            const translatedText = await detectLanguageAndTranslate(message);
            finalMessage += ` (translated: ${translatedText})`;
        }

        publish(finalMessage);
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
                // "sender": userName,
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
                        // "sender": userName,
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

    const detectLanguageAndTranslate = async (text) => {
        try {
            // 언어 감지 API 호출
            const detectRes = await axios.post('/language/detect', {
                text: text
            }, {
                headers: {
                    Authorization: `${localStorage.getItem('Authorization')}`
                }
            });

            console.log(detectRes);

            // 감지된 언어를 기반으로 번역 API 호출
            const detectedLang = detectRes.data; // API 응답 형식에 따라 조정 필요
            const translateRes = await axios.post('/language/translate', {
                text: text,
                sourceLang: detectedLang,
                targetLang: targetLang // 사용자가 선택한 언어로 설정
            }, {
                headers: {
                    Authorization: `${localStorage.getItem('Authorization')}`
                }
                });
            return translateRes.data.translatedText; // API 응답 형식에 따라 조정 필요
        } catch (error) {
            console.error("Error during language detection and translation:", error);
            return text; // 원본 텍스트 반환
        }
    }

    // const getTranslation = async (textToTranslate) => {
    //     try {
    //         const response = await axios.post('/language/translate', {
    //             text: textToTranslate,
    //             frdChatRoomId: roomId
    //         }, {
    //             headers: {
    //                 Authorization: `${localStorage.getItem('Authorization')}`
    //             }
    //         });
    //         console.log("이거는 번역response")
    //         console.log(response)
    //         return response.data.message.result.translatedText; // API 응답에 따라 경로를 조정해야 할 수 있습니다.
    //
    //     } catch (error) {
    //         console.error("Error during translation:", error);
    //     }
    // }

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    }

    const addEmoji = (e) => {
        let emoji = e.native;
        setMessage(prevMessage => prevMessage + emoji);
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
                            <div>{item.createdAt}</div>
                            <div>{item.sender}</div>
                            <div>{item.message}</div>
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
            <div className="language-selection">
                <label>Translate to:</label>
                <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.label}
                        </option>
                    ))}
                </select>
            </div>
            <form onSubmit={sendMessage}>
                <input type={"text"} value={message} onChange={onChangeMessage}/>
                <button type="button" onClick={toggleEmojiPicker}>😃</button>
                {showEmojiPicker && (
                    <Picker data={data} onEmojiSelect={addEmoji} />
                )}
                <input type="checkbox" onChange={() => setTranslate(!translate)} />
                <button type="submit">보내기</button>
                <input type="file" id="file" onChange={handleFileChange} multiple/>
                <button type="button" onClick={uploadFiles}>파일 업로드</button>
            </form>
        </div>
    )
}
export default ChatRoom4;