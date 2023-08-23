import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    Paper,
    Select,
    InputLabel,
    MenuItem,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { Fab } from '@mui/material';
import SendIcon from "@mui/icons-material/Send";


const RandomChat = () => {
    const navigate = useNavigate();
    const { randomRoomId } = useParams();
    const [message, setmessage] = useState("");
    const [messages, setMessages] = useState([]);
    const location = useLocation();
    const [files, setFiles] = useState([]);
    const room = location.state.room; //채팅방 정보
    const client = useRef({});
    const [sourceCode, setSourceCode] = useState("ko");
    const [targetCode, setTargetCode] = useState("en");
    const [sourceText, setSourceText] = useState("");
    const [targetText, setTargetText] = useState("");
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
    }

    useEffect(() => {

        shouldDetectLanguageRef.current = shouldDetectLanguage;
    }, [shouldDetectLanguage]);

    useEffect(() => {
        selectedLanguageRef.current = selectedLanguage;
    }, [selectedLanguage]);

    useEffect(() => {
        console.log("랜덤 채팅방 정보");
        console.log(room);
        connect();

        //socket 연결 해제
        return () => disconnect();
    }, []);

    const connect = () => {
        //endpoint 소켓 생성
        const socket = new SockJS("/random");
        //Stomp client 초기화
        const stompClient = Stomp.over(socket);
        client.current = stompClient;
        const headers = {
            "Authorization": localStorage.getItem('Authorization'),
            "userName": localStorage.getItem('username'),
        }
        stompClient.connect(headers,
            () => onConnected(),
            (error) => onError(error)
        );
    };

    const disconnect = () => {
        if (client.current) {
            client.current.disconnect(() => {
                console.log("websocket disconnected");
                navigate(`/randomTest`);
            })
        }
    };


    const onConnected = () => {
        console.log("Connected to Websocket Server");
        client.current.userName = localStorage.getItem("userName");
        //발송, 수신할 구독 경로 정의
        client.current.subscribe(`/randomSub/randomChat/${room.randomRoomId}`, (message) => onReceived(message));
        joinEvent();
    }

    function onReceived(payload) {
        let payloadData = JSON.parse(payload.body);
        setMessages((prev) => [...prev, payloadData]);
    }

    const onError = (error) => {
        console.log('WebSocket 에러: ', error);
    }

    function joinEvent() {
        const joinMessage = {
            type: "ENTER",
            sender: client.current.userName,
            randomRoomId: room.randomRoomId,
        };
        client.current.send(`/randomPub/randomChat/${randomRoomId}/enter`, {}, JSON.stringify(joinMessage));
    }

    const uploadFiles = async () => {
        if (files.length === 0) {
            console.log("파일을 선택해주세요.");
            return;
        }

        const formData = createFormData(files, randomRoomId);
        const config = { headers: { "Content-Type": "multipart/form-data" } };

        try {
            const response = await axios.post("/randomFile/upload", formData, config);
            console.log("업로드된 파일들:", response.data);
        } catch (error) {
            console.log("파일 업로드 실패:", error);
        }
    };

    const createFormData = (files, roomId) => {
        const formData = new FormData();

        for (let file of files) {
            formData.append("file", file);
        }

        formData.append("roomId", roomId);
        return formData;
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        // 번역
        let finalMessage = message;
        let finalTargetCode = targetCode;
        const translatedText = await detectAndTranslate(message, finalTargetCode);
        finalMessage += ` (translated: ${translatedText})`;
        sendChatMessage(finalMessage);
        setmessage("");
    
        if (message.trim() !== "" || !message.trim()) {
            sendChatMessage(message);
            setmessage("");
        } else {
            return;
        }
    
        uploadFiles();
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
            console.log("Sending message: ", JSON.stringify(messageData));
            client.current.send(`/randomPub/randomChat/${room.randomRoomId}`, {}, JSON.stringify(messageData));
        }
    };

    //받아온 파일 데이터 보관
    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    }

    const handleUploadClick = (e) => {
        document.getElementById("fileInput").click();
    }

    //번역
    const detectAndTranslate = async (text, code) => {
        try {
            // 언어 감지 API 호출
            const detectRes = await axios.post('/randomTranslate/detect', {
                sourceText: text
            }, {
                headers: {
                    Authorization: `${localStorage.getItem('Authorization')}`
                }
            });

            console.log("detectedRes.data: " , detectRes.data)

            // // 감지된 언어를 기반으로 번역 API 호출
            const detectedCode = detectRes.data.sourceCode; // API 응답 형식에 따라 조정 필요
            const sourceText = detectRes.data.sourceText;
            const translateRes = await axios.post('/randomTranslate/translate', {
                sourceCode: detectedCode,
                targetCode: code,
                sourceText: sourceText
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
            <Box sx={{ p: 2, backgroundColor: "#414141" }}>
                <Grid container spacing={2}>
                    <Grid item xs={1}>
                        <form>
                            <input
                                type="file"
                                id="fileInput"
                                multiple
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                            <Fab color="primary" size="small" aria-label="add" onClick={handleUploadClick}>
                                <AddIcon />
                            </Fab>
                        </form>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Type a message"
                            backgroundColor="#414141"
                            inputProps={{ style: { color: 'white' } }}
                            variant="outlined"
                            value={message}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={1}>
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
                    <Grid item xs={1}>
                        <Button
                            fullWidth
                            color="primary"
                            variant="contained"
                            onClick={disconnect}
                        >
                            나가기
                        </Button>
                    </Grid>
                </Grid>
                <Grid item xs={6}>
                    <InputLabel htmlFor="tgtLang" style={{ color: "white" }}>번역언어</InputLabel>
                    <Select
                        fullWidth
                        id="tgtLang"
                        value={targetCode}
                        MenuProps={{
                            anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left"
                            },
                            getContentAnchorEl: null
                        }}
                        inputProps={{ style: { color: 'white' } }} 
                        onChange={(e) => setTargetCode(e.target.value)}
                    >
                        {Object.entries(languages).map(([code, name]) => (
                            <MenuItem key={code} value={code} style={{ color: "white" }}>{name}</MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Box>
        </Box>
    );
};

const Message = ({ message }) => {
    const me = message.sender === localStorage.getItem('userName');

    //파일 다운로드 처리 함수
    const handleFileDownload = async (fileName, fileDir) => {
        try {
            const response = await axios.get(`/randomFile/download/${fileName}`, {
                params: { fileDir },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("파일 다운로드 실패:", error);
        }
    };

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
                    flexDirection: me ? "row-reverse" : "row",
                    alignItems: "center",
                }}
            >
                <Paper
                    variant="outlined"
                    sx={{
                        p: 1,
                        ml: me ? 0 : 1,
                        mr: me ? 1 : 0,
                        backgroundColor: me ? "#8F9CF8" : "#D9D9D9",
                        borderRadius: me ? "20px 20px 20px 20px" : "20px 20px 20px 20px",
                    }}
                >
                    <Typography variant="body1">{message.content}</Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default RandomChat;