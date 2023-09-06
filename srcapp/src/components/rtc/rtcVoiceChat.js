import {Button, ButtonGroup} from 'reactstrap'; // reactstrap 라이브러리를 사용해 bootstrap 스타일 적용
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'
import axios from "axios";
import qs from "qs";
import React, {useEffect, useRef, useState, useContext} from 'react';
import UserListContext from '../../context/UserListContext';
import Profile from "../../img/profile.png";
import RtcVoiceChatDrag from "./RtcVoiceChatDrag";

// const addr = "localhost:3001"

const RtcVoiceChat = ({sendUser, receiverUser, setShowRtcVoiceChat, type2, setType2}) => {
    const [senderIsTalking, setSenderIsTalking] = useState(false);
    const [receiverIsTalking, setReceiverIsTalking] = useState(false);
    const [socket, setSocket] = useState(null);
    const [localUserName, setLocalUserName] = useState(null);
    const [toggleAudio, setToggleAudio] = useState(true);
    const [rtcChatDrag, setRtcChatDrag] = useState(false);
    const [disconnect, setDisconnect] = useState(false);
    const [disconnect2, setDisconnect2] = useState(false);

    //녹음기능 상태변수
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    // const [isSender, setIsSender] = useState(null);
    // let isSender = useRef(false);
    const handleRtcVoiceShowDrag = () => {
        setRtcChatDrag(true);
    };
    const handleDragClose = () => {
        setRtcChatDrag(false);
    };
    useEffect(() => {
        handleRtcVoiceShowDrag();
        // alert("드래그 실행");
    }, [])
    const toggleMike = () => {
        setToggleAudio(!toggleAudio);
        if (localAudio&& localAudio.srcObject) {
            const audioTracks = localAudio.srcObject.getAudioTracks()
            if (audioTracks.length > 0) {
                const enabled = audioTracks[0].enabled;
                console.log("마이크 토글: " + enabled);
                audioTracks[0].enabled = !enabled;
            } else {
                console.error("No audio track found in the stream");
            }
        } else {
            console.error("No local video or stream found");
        }
    };

    //녹음 기능 로직

    let recordedChunksArray = [];

    const toggleRecording = () => {
        if (!isRecording) {
            // 녹음 시작
            const stream = localAudio.srcObject;
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            console.log("녹음시작@@@@@@@@@@@@@@@");
            console.log("녹음리코더 : ", recorder);


            recorder.ondataavailable = event => {
                if (event.data.size >= 0) {
                    recordedChunksArray.push(event.data);
                    console.log("음성내용@@@@@@@@@" + recordedChunksArray)
                }
            };



            recorder.onstop = () => {
                const blob = new Blob(recordedChunksArray, { type: 'audio/webm' });
                console.log("sender: "+sendUser+" / receiver:"+receiverUser);
                const formData = new FormData();
                formData.append('sender', localStorage.getItem("userName") == sendUser? sendUser : receiverUser);
                formData.append('receiver', localStorage.getItem("userName") == sendUser? receiverUser : sendUser);
                formData.append('audio', blob, 'recorded_audio.wav');
                formData.append('lang',localStorage.getItem("language")?localStorage.getItem("language"):"Eng");
                fetch('/rtc/upload', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch(error => console.log('Error:', error));
                // const audioURL = window.URL.createObjectURL(blob);
                // console.log("녹음중지@@@@@@@");
                //
                // const tempLink = document.createElement('a');
                // tempLink.href = audioURL;
                // tempLink.download = 'recorded_audio.wav';
                // tempLink.click();

            };

            recorder.start(100);
            setMediaRecorder(recorder);
            setIsRecording(true);


        } else {
            console.log("녹음중지@@@@@@@@@");
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };



    const {userList, setUserList} = useContext(UserListContext);
    // let localUserName = "";

    const sendUserProfile = userList.find(u => u.userName === sendUser)?.userProfileName;
    const receiverUserProfile = userList.find(u => u.userName === receiverUser)?.userProfileName;

    // const [isAnswerReceived, setIsAnswerReceived] = useState(false);
    // WebSocket 연결 설정
    useEffect(() => {

        console.log("ChatRoom 실행")
        let host = "";
        host = window.location.host;
        console.log(host)
        host = host.slice(0, -4);
        console.log("wss://" + host + "9002" + "/voice")
        const ws = new WebSocket("wss://" + host + "9002" + "/voice");
        setSocket(ws);

        updateUserList();

        // 컴포넌트가 언마운트될 때 WebSocket 연결을 종료
        // let loginUserName = "";
        // console.log(rtcUserName+"이게 넘어온 이름")

        if (localStorage.getItem('userName')) {
            console.log("발신 유저 이름: " + sendUser)
            console.log("수신 유저 이름: " + receiverUser)
            setLocalUserName(localStorage.getItem('userName'));

        }
        console.log(sendUser+"WWWWWWWWWWWWWWW");
        console.log(localStorage.getItem('userName'));
        // if(localStorage.getItem('userName') == sendUser){
        //     isSender = true;
        //     console.log("발신자@@@@@@@@@@@@" + isSender);
        // }
        // return () => {
        //     ws.close();
        // }
    }, [])

    //STUN 서버 설정을 포함하는 WebRTC 연결 설정
    const peerConnectionConfig = {
        'iceServers': [
            {'urls': 'stun:stun.stunprotocol.org:3478'},
            {'urls': 'stun:stun.l.google.com:19302'},
        ]
    };

// 미디어 제약 사항 설정
    const mediaConstraints = {
        audio: true,
    };
    let localStream;
    let remoteStream;
    let myPeerConnection;
    const localRoom = sendUser + "님과 " + receiverUser + "님의 음성채팅방";
    // const localAudio = document.getElementById('local_Audio');
    const localAudio = useRef(null);
    // useEffect(() => {
    //     console.log("streamAudio test1");
    //     if (localAudio && localStream) {
    //         localAudio.srcObject = localStream;
    //     }
    // }, [localAudio]);

    const remoteAudio = useRef(null);
    // useEffect(() => {
    //     console.log("streamAudio test2");
    //     if (remoteAudio.current && localStream) {
    //         // console.log("상대 스트림");
    //         remoteAudio.current.srcObject = localStream;
    //     }
    // }, [remoteAudio])


    useEffect(() => {
        if (socket){
            socket.onerror = function (error) {
                console.log("WebSocket Error: ", error);
            };

            socket.onmessage = function (msg) {
                console.log("peertest 시작");
                let message = JSON.parse(msg.data);
                console.log("메시지 타입: " + message.type);

                switch (message.type) {
                    // case 'Audio-toggle':
                    //     if (remoteAudio.current.srcObject) {
                    //         remoteAudio.current.srcObject.getAudioTracks()[0].enabled = message.enabled;
                    //     }
                    //     break;

                    case "offer":
                        setToggleAudio(!toggleAudio);
                        log('Signal OFFER received');
                        handleOfferMessage(message);
                        break;

                    case "answer":
                        setToggleAudio(!toggleAudio);
                        log('Signal ANSWER received');
                        handleAnswerMessage(message);
                        break;

                    case "ice":
                        log('Signal ICE Candidate received');
                        handleNewICECandidateMessage(message);
                        break;

                    case "join":
                        // ajax 요청을 보내서 userList 를 다시 확인함
                        console.log("join들어옴")
                        message.data = chatListCount();
                        log('Client is starting to ' + (message.data === "true") ? 'negotiate' : 'wait for a peer');
                        log("messageDATA : " + message.data)
                        handlePeerConnection(message);
                        break;

                    case "leave":

                        stop();
                        break;

                    case "decline":
                        console.log("Received decline message");
                        console.log("디클라인@@@@@@@@@@@@@@@@@@@@@@@@");
                        socket.close();
                        stop();
                        break;


                    default:
                        handleErrorMessage('Wrong type message received from server');
                }
            }



            socket.onopen = function () {
                log('WebSocket connection opened to Room: #' + localRoom);
                console.log(localUserName + "이거 나오냐?????????");
                sendToServer({
                    from: localUserName,
                    type: 'join',
                    data: localRoom
                });

            };

            // 소켓이 끊겼을 때 이벤트처리
            socket.onclose = function (message) {
                log('Socket has been closed');
                // alert("연결이 끊어졌습니다.")
                // exitRooms().then(r => {});
            }
            socket.onerror = function (message) {
                handleErrorMessage("Error: " + message);
            };
        };
    }, [socket])

//음성감지

    useEffect(() => {
        if (!remoteAudio?.current?.srcObject) {
            console.log("여기 어딨오....................")
            return;
        }
        const stream = remoteAudio.current.srcObject;

        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let analyser = audioContext.createAnalyser();
        console.log("에러1");
        let microphone = audioContext.createMediaStreamSource(stream);
        let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        let lastEventTimestamp = 0;
        const THROTTLE_INTERVAL = 100; // 0.2초

        javascriptNode.onaudioprocess = () => {
            const currentTime = Date.now();

            // 마지막 이벤트로부터 0.2초 이상 경과한 경우에만 처리
            if (currentTime - lastEventTimestamp > THROTTLE_INTERVAL) {
                lastEventTimestamp = currentTime;

                var array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                var values = 0;

                var length = array.length;
                for (var i = 0; i < length; i++) {
                    values += array[i];
                }

                var average = values / length;
                console.log("-----------     " + average)
                console.log(localStorage.getItem('userName'));
                console.log(sendUser);
                console.log(localStorage.getItem('userName') == sendUser);
                setToggleAudio(!toggleAudio);
                setToggleAudio(!toggleAudio);
                // console.log(isSender);
                if(disconnect){
                    setDisconnect2(true);
                    return;
                }
                if (average > 15) {
                    if(localStorage.getItem('userName') == sendUser) {
                        setReceiverIsTalking(true);
                    } else {
                        setSenderIsTalking(true);
                    }
                } else if (average < 10) {
                    if(localStorage.getItem('userName') == sendUser) {
                        setReceiverIsTalking(false);
                    } else {
                        setSenderIsTalking(false);
                    }
                }
            }
        };

        return () => {
            if (javascriptNode) {
                javascriptNode.disconnect();
            }
            if (analyser) {
                analyser.disconnect();
            }
            if (microphone) {
                microphone.disconnect();
            }
            if (audioContext) {
                audioContext.close();
            }
        };




    }, [remoteAudio, remoteAudio?.current, remoteAudio?.current?.srcObject, disconnect]);  // remoteAudio가 변경될 때마다 useEffect를 다시 실행합니다.

// const test = ()=>{
//     const stream = localAudio.current.srcObject;

//     // navigator.mediaDevices.getUserMedia({audio: true})
//     //     .then(stream => {
//     //LocalAudioRef.current.srcObject = stream;

//     let audioContext = new (window.AudioContext || window.stream)();
//     let analyser = audioContext.createAnalyser();
//     console.log("에러2");
//     let microphone = audioContext.createMediaStreamSource(stream);
//     let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

//     analyser.smoothingTimeConstant = 0.8;
//     analyser.fftSize = 1024;

//     microphone.connect(analyser);
//     analyser.connect(javascriptNode);
//     javascriptNode.connect(audioContext.destination);
//     let lastEventTimestamp = 0;
//     const THROTTLE_INTERVAL = 100; // 0.2초

//     javascriptNode.onaudioprocess = () => {
//         const currentTime = Date.now();

//         // 마지막 이벤트로부터 0.2초 이상 경과한 경우에만 처리
//         if (currentTime - lastEventTimestamp > THROTTLE_INTERVAL) {
//             lastEventTimestamp = currentTime;

//             var array = new Uint8Array(analyser.frequencyBinCount);
//             analyser.getByteFrequencyData(array);
//             var values = 0;

//             var length = array.length;
//             for (var i = 0; i < length; i++) {
//                 values += array[i];
//             }
//             var average = values / length;

//             // if (average > 200) { // 임계값을 조정하여 적절한 민감도로 설정하십시오.
//             //     setSenderIsTalking(true);
//             // } else if(average < 10) {
//             //     setSenderIsTalking(false);
//             // }
//             console.log(average)
//             if (average > 15) {
//                 setSenderIsTalking(true);
//             } else if (average < 10) {
//                 setSenderIsTalking(false);
//             }

//         }

//     };

//     return () => {
//         if (javascriptNode) {
//             javascriptNode.disconnect();
//         }
//         if (analyser) {
//             analyser.disconnect();
//         }
//         if (microphone) {
//             microphone.disconnect();
//         }
//         if (audioContext) {
//             audioContext.close();  // 오디오 컨텍스트 종료
//         }
//     };
//     }

    useEffect(() => {

        if(!localAudio.srcObject){return;}
        // navigator.mediaDevices.getUserMedia({audio: true})
        //     .then(stream => {

        //LocalAudioRef.current.srcObject = stream;
        const stream = localAudio.srcObject;
        let audioContext = new (window.AudioContext || window.stream)();
        let analyser = audioContext.createAnalyser();
        console.log("에러2");
        let microphone = audioContext.createMediaStreamSource(stream);
        let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
        let lastEventTimestamp = 0;
        const THROTTLE_INTERVAL = 100; // 0.2초
        javascriptNode.onaudioprocess = () => {
            const currentTime = Date.now();

            // 마지막 이벤트로부터 0.2초 이상 경과한 경우에만 처리
            if (currentTime - lastEventTimestamp > THROTTLE_INTERVAL) {
                lastEventTimestamp = currentTime;

                var array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                var values = 0;

                var length = array.length;
                for (var i = 0; i < length; i++) {
                    values += array[i];
                }
                var average = values / length;

                // if (average > 200) { // 임계값을 조정하여 적절한 민감도로 설정하십시오.
                //     setSenderIsTalking(true);
                // } else if(average < 10) {
                //     setSenderIsTalking(false);
                // }
                console.log(average)
                console.log(localStorage.getItem('userName'));
                console.log(sendUser);
                console.log(localStorage.getItem('userName') == sendUser);
                setToggleAudio(!toggleAudio);
                setToggleAudio(!toggleAudio);

                // console.log(isSender);
                if(disconnect2){
                    return;
                }

                if (average > 15) {
                    if(localStorage.getItem('userName') == sendUser) {
                        setSenderIsTalking(true);
                    } else {
                        setReceiverIsTalking(true);
                    }
                } else if (average < 10) {
                    if(localStorage.getItem('userName') == sendUser) {
                        setSenderIsTalking(false);
                    } else {
                        setReceiverIsTalking(false);
                    }
                }

            }

        };

        return () => {
            if (javascriptNode) {
                javascriptNode.disconnect();
            }
            if (analyser) {
                analyser.disconnect();
            }
            if (microphone) {
                microphone.disconnect();
            }
            if (audioContext) {
                audioContext.close();  // 오디오 컨텍스트 종료
            }
        };
        // })
        // .catch(error => console.error('Error accessing audio stream:', error));

        let timerId;
        // return () => {
        //     timerId = setTimeout(() => {
        //     }, 100);  // 0.1초의 딜레이
        // };


    }, [localAudio, localAudio.srcObject,disconnect2,localStream]); // 이 useEffect는 컴포넌트가 마운트될 때 한 번만 실행됩니다.


// 방 나가기 함수
    const exitRoom = () => {
        console.log("exit@@@@@@@@@@@" + type2);
        stop(); // 웹소켓 연결 종료 및 비디오/오디오 정지
        setShowRtcVoiceChat(false);
        console.log("exit되고나서 @@@@@@@@@@@" + type2);

    };

    function stop() {
        setDisconnect(true);
        setType2('');
        console.log("보이스스탑메소드" + type2);

        alert("상대방과의 연결이 끊어졌습니다.");

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }

        cleanupAudioResources();

        console.log(localUserName + "exit")
        console.log(localRoom + "exit");

        sendToServer({
            from: localUserName,
            type: 'leave',
            data: localRoom
        });

        if (socket) {
            socket.close();
        }

        setShowRtcVoiceChat(false);


        remoteAudio.current = null;
        localAudio.current = null;

        myPeerConnection = null;
        localStream = null;

        if (myPeerConnection) {
            log('Close the RTCPeerConnection');

            // disconnect all our event listeners
            myPeerConnection.onicecandidate = null;
            myPeerConnection.ontrack = null;
            myPeerConnection.onnegotiationneeded = null;
            myPeerConnection.oniceconnectionstatechange = null;
            myPeerConnection.onsignalingstatechange = null;
            myPeerConnection.onicegatheringstatechange = null;
            myPeerConnection.onnotificationneeded = null;
            myPeerConnection.onremovetrack = null;

            // 비디오 정지

            remoteAudio.current.srcObject = null;
            localAudio.srcObject = null;


            // myPeerConnection 초기화
            //myPeerConnection.close();
            // getMedia(mediaDisconnection);

            console.log("연결끊김@@@@@@@@@@@@@@@@@@@@@@@@");
        }
    }

    // 페이지 시작시 실행되는 메서드 -> socket 을 통해 server 와 통신한다

    async function chatListCount() {
        const params = {
            from: localUserName,
            type: 'findCount',
            data: sendUser + "님과 " + receiverUser + "님의 음성채팅방",//여기가 방 제목 들어갈 부분(로그인 userName+ 요청받는 userName)
            candidate: 'null',
            sdp: 'null',
            chatType: 'voice'
        };
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            const response = await axios.post('/webrtc/usercount', qs.stringify(params), config);
            console.log("방 인원수: " + response.data.toString())
            if (response.data.toString() === "true") {
                myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
            }
            return response.data;
        } catch (error) {
            console.error('An error occurred while fetching data:', error);
        }
    }

    const updateUserList = async (retry = true) => {
        try {
            const response = await fetch('/api/v1/user/friendsList', {
                method: 'POST',
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
                // 이 부분은 로그아웃 로직에 맞게 처리해야 합니다.
                // 예: logoutApi3(true);
                return;
            }
            const data = await response.json();
            if (data) {
                setUserList(data.items);
            }
        } catch (error) {
            if (retry) {
                await updateUserList(false);
            }
        }
    }


    // 웹 소켓 연결 되었을 때 - open - 상태일때 이벤트 처리

    // 에러 발생 시 이벤트 처리

    // }

    window.addEventListener('unload', stop);

// 브라우저 뒤로가기 시 이벤트
    window.onhashchange = function () {
        stop();
    }

    function log(message) {
        // console.log(message);
    }

    function handleErrorMessage(message) {
        console.error(message);
    }

// use JSON format to send WebSocket message
    function sendToServer(msg) {
        let msgJSON = JSON.stringify(msg);
        socket.send(msgJSON);
    }

// initialize media stream
    function getMedia(constraints) {
        console.log("stream test3");
        if (localStream) {
            console.log("stream test3-1??");
            localStream.getTracks().forEach(track => {
                track.stop();
            });
        }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(getLocalMediaStream).catch(handleGetUserMediaError);
    }

// 두번째 클라이언트가 들어오면 피어 연결을 생성 + 미디어 생성
    function handlePeerConnection(message) {
        createPeerConnection();
        getMedia(mediaConstraints);

        if (message.data === "true") {

            myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
        }
    }

    function createPeerConnection() {
        myPeerConnection = new RTCPeerConnection(peerConnectionConfig);

        myPeerConnection.onicecandidate = handleICECandidateEvent;
        myPeerConnection.ontrack = handleTrackEvent;

        // the following events are optional and could be realized later if needed
        // myPeerConnection.onremovetrack = handleRemoveTrackEvent;
        // myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
        // myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
        // myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
    }

    function getLocalMediaStream(mediaStream) {
        console.log("stream test4");
        localStream = mediaStream;
        localAudio.srcObject = mediaStream;
        console.log("유효확인 로컬: " + mediaStream + "///" + mediaStream.getAudioTracks());
        localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream));
    }

// handle get media error
    function handleGetUserMediaError(error) {
        log('navigator.getUserMedia error: ', error);
        switch (error.name) {
            case "NotFoundError":
                alert("Unable to open your call because no camera and/or microphone were found.");
                break;
            case "SecurityError":
            case "PermissionDeniedError":
                // Do nothing; this is the same as the chatRandom canceling the call.
                break;
            default:
                alert("Error opening your camera and/or microphone: " + error.message);
                break;
        }
        stop();
    }

// send ICE candidate to the peer through the server
    function handleICECandidateEvent(event) {
        if (event.candidate) {
            sendToServer({
                from: localUserName,
                data: localRoom,
                type: 'ice',
                candidate: event.candidate
            });
            log('ICE Candidate Event: ICE candidate sent');
        }
    }

    function handleTrackEvent(event) {
        log('Track Event: set stream to remote Audio element');
        if (remoteAudio.current) { // remoteAudio가 null이 아닌지 확인
            remoteAudio.current.srcObject = event.streams[0];
            console.log("유효확인 리모트: " + event.streams[0] + "//" + event.streams[0].getAudioTracks());
        }
        // remoteAudio.srcObject = event.streams[0];
    }

// WebRTC called handler to begin ICE negotiation
// WebRTC 의 ICE 통신 순서
// 1. WebRTC offer 생성
// 2. local media description 생성?
// 3. 미디어 형식, 해상도 등에 대한 내용을 서버에 전달
    function handleNegotiationNeededEvent() {
        myPeerConnection.createOffer().then(function (offer) {
            return myPeerConnection.setLocalDescription(offer);
        })
            .then(function () {
                if (socket.readyState !== socket.CONNECTING) {
                    sendToServer({
                        from: localUserName,
                        data: localRoom,
                        type: 'offer',
                        sdp: myPeerConnection.localDescription
                    });
                }
                log('Negotiation Needed Event: SDP offer sent');
            })
            .catch(function (reason) {
                // an error occurred, so handle the failure to connect
                handleErrorMessage('failure to connect error: ', reason);
            });
    }

    function handleOfferMessage(message) {
        log('Accepting Offer Message');
        log(message);
        let desc = new RTCSessionDescription(message.sdp);
        //TODO test this
        if (desc != null && message.sdp != null) {
            log('RTC Signalling state: ' + myPeerConnection.signalingState);
            myPeerConnection.setRemoteDescription(desc).then(function () {
                log("Set up local media stream");
                return navigator.mediaDevices.getUserMedia(mediaConstraints);
            })
                .then(function (stream) {
                    log("-- Local Audio stream obtained");
                    console.log("stream test5");
                    localStream = stream;
                    try {
                        if (localAudio) {
                            localAudio.srcObject = localStream;
                        }
                    } catch (error) {
                        localAudio.src = window.URL.createObjectURL(stream);
                    }
                    log("-- Adding stream to the RTCPeerConnection");
                    localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream));
                })
                .then(function () {
                    log("-- Creating answer");
                    return myPeerConnection.createAnswer();
                })
                .then(function (answer) {
                    log("-- Setting local description after creating answer");
                    return myPeerConnection.setLocalDescription(answer);
                })
                .then(function () {
                    log("Sending answer packet back to other peer");
                    sendToServer({
                        from: localUserName,
                        data: localRoom,
                        type: 'answer',
                        sdp: myPeerConnection.localDescription
                    });

                })
                .catch(handleErrorMessage)
        }
    }

    function handleAnswerMessage(message) {
        myPeerConnection.setRemoteDescription(message.sdp).catch(handleErrorMessage);
        // log("The peer has accepted request");
        // let desc = new RTCSessionDescription(message.sdp);
        // if (desc != null && message.sdp != null) {
        //     myPeerConnection.setRemoteDescription(desc).catch(handleErrorMessage);
        //     navigator.mediaDevices.getUserMedia(mediaConstraints).then(function (stream) {
        //         log("-- Local Audio stream obtained");
        //         if (localAudio.current) {
        //             localAudio.current.srcObject = stream;
        //         }
        //     });
        // }
    }

    function handleNewICECandidateMessage(message) {
        let candidate = new RTCIceCandidate(message.candidate);
        log("Adding received ICE candidate: " + JSON.stringify(candidate));
        myPeerConnection.addIceCandidate(candidate).catch(handleErrorMessage);
    }

    const cleanupAudioResources = () => {
        if (localAudio && localAudio.srcObject) {
            const tracks = localAudio.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        if (remoteAudio.current && remoteAudio.current.srcObject) {
            const remoteTracks = remoteAudio.current.srcObject.getTracks();
            remoteTracks.forEach(track => track.stop());
        }

        console.log("오디오 종료됨@@@@@@@@@@@")
//         // 필요한 다른 정리 작업들을 여기에 추가하세요.
    }

    // console.log(userList);
    // console.log("샌드 이미지 " + sendUserProfile)
    // console.log("샌드 이미지 " + receiverUserProfile)
// rtcVoiceChat 컴포넌트 내부에서...

//-----------------여기부터 이제 추가될 화상채팅에서 끌어온 로직
    return (
        <div className="rtcVoiceChat">
            <RtcVoiceChatDrag onClose={handleDragClose} remoteAudio={remoteAudio} show={rtcChatDrag}
                              localRoom={localRoom} exitRoom={exitRoom} senderIsTalking={senderIsTalking}
                              receiverIsTalking={receiverIsTalking}
                              toggleMike={toggleMike}
                              toggleRecording={toggleRecording}
                              isRecording={isRecording}
                              src1={sendUserProfile ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + sendUserProfile : Profile}
                              src2={receiverUserProfile ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + receiverUserProfile : Profile}></RtcVoiceChatDrag>
            {/*<div className="users">*/}
            {/*    <div style={senderIsTalking ? {color: 'green'} : null} className="sendUser">{sendUser}</div>*/}
            {/*    <div style={receiverIsTalking ? {color: 'green'} : null} className="receiverUser">{receiverUser}</div>*/}
            {/*    <button onClick={exitRoom}>Exit Room</button>*/}
            {/*</div>*/}

            {/*<audio ref={remoteAudio} autoPlay></audio>*/}


            {/*// return (*/}
            {/*// <div className="rtcVoiceChat">*/}
            {/*// <div className="users">*/}
            {/*// <div style={isTalking ? {color: 'green'} : null} className="sendUser">*/}
            {/*// <img*/}
            {/*//                     className="profile_img"*/}
            {/*//                     src={sendUserProfile ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/"+ sendUserProfile : Profile}*/}
            {/*//                 />*/}
            {/*//                 {sendUser}*/}
            {/*//             </div>*/}
            {/*//             <div style={isTalking ? {color: 'green'} : null} className="receiverUser">*/}
            {/*                 <img*/}
            {/*                     className="profile_img"*/}
            {/*                     src={receiverUserProfile ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/"+ receiverUserProfile : Profile}*/}
            {/*                 />*/}
            {/*//                 {receiverUser}*/}
            {/*//             </div>*/}
            {/*//             <button onClick={exitRoom}>Exit Room</button>*/}


            {/*</div>*/}


        </div>
    );

};
export default RtcVoiceChat