import {Button, ButtonGroup} from 'reactstrap'; // reactstrap 라이브러리를 사용해 bootstrap 스타일 적용
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'
import axios from "axios";
import qs from "qs";
import React, {useEffect, useRef, useState} from 'react';

// const addr = "localhost:3001"

const RtcVoiceChat = ({sendUser, receiverUser, setShowRtcVoiceChat, type2, setType2}) => {
    const [isTalking, setIsTalking] = useState(false);
    const [socket, setSocket] = useState(null);
    const [localUserName, setLocalUserName] = useState(null);
    // let localUserName = "";

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

        // 컴포넌트가 언마운트될 때 WebSocket 연결을 종료
        // let loginUserName = "";
        // console.log(rtcUserName+"이게 넘어온 이름")

        if (localStorage.getItem('userName')) {
            console.log("발신 유저 이름: " + sendUser)
            console.log("수신 유저 이름: " + receiverUser)
            setLocalUserName(localStorage.getItem('userName'));
        }
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
        video:false
    };
    let localStream;
    let myPeerConnection;
    const localRoom = sendUser + "님과 " + receiverUser + "님의 음성채팅방";
    // const localAudio = document.getElementById('local_Audio');
    const localAudio = useRef(null);

    useEffect(() => {
        console.log("streamAudio test1");
        if (localAudio.current && localStream) {
            localAudio.current.srcObject = localStream;
        }
    }, [localStream, localAudio]);

    const remoteAudio = useRef(null);
    useEffect(() => {
        console.log("streamAudio test2");
        if (remoteAudio.current && localStream) {
            // console.log("상대 스트림");
            remoteAudio.current.srcObject = localStream;
        }
    }, [remoteAudio])


    useEffect(() => {
        if (!socket) return;
        socket.onerror = function (error) {
            console.log("WebSocket Error: ", error);
        };

        socket.onmessage = function (msg) {
            console.log("peertest 시작");
            let message = JSON.parse(msg.data);
            console.log("메시지 타입: " + message.type);

            switch (message.type) {
                case 'Audio-toggle':
                    if (remoteAudio.current.srcObject) {
                        remoteAudio.current.srcObject.getAudioTracks()[0].enabled = message.enabled;
                    }
                    break;

                case "offer":
                    log('Signal OFFER received');
                    handleOfferMessage(message);
                    break;

                case "answer":
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
                    console.log("실행되면 안됨");
                    stop();
                    break;

                default:
                    handleErrorMessage('Wrong type message received from server');
            }
        };
        socket.onopen = function () {
            log('WebSocket connection opened to Room: #' + localRoom);
            console.log(localUserName+"이거 나오냐?????????");
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
    }, [socket])

    useEffect(() => {

        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                //LocalAudioRef.current.srcObject = stream;

                let audioContext = new (window.AudioContext || window.webkitAudioContext)();
                let analyser = audioContext.createAnalyser();
                let microphone = audioContext.createMediaStreamSource(stream);
                let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

                analyser.smoothingTimeConstant = 0.8;
                analyser.fftSize = 1024;

                microphone.connect(analyser);
                analyser.connect(javascriptNode);
                javascriptNode.connect(audioContext.destination);

                javascriptNode.onaudioprocess = () => {
                    var array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);
                    var values = 0;

                    var length = array.length;
                    for (var i = 0; i < length; i++) {
                        values += array[i];
                    }

                    var average = values / length;

                    if (average > 20) { // 임계값을 조정하여 적절한 민감도로 설정하십시오.
                        setIsTalking(true);
                    } else {
                        setIsTalking(false);
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
            })
            .catch(error => console.error('Error accessing audio stream:', error));
    }, []); // 이 useEffect는 컴포넌트가 마운트될 때 한 번만 실행됩니다.


// 방 나가기 함수
    const exitRoom = () => {
        setType2('');
        console.log("exit" + type2);
        stop(); // 웹소켓 연결 종료 및 비디오/오디오 정지
        setShowRtcVoiceChat(false);
    };

    function stop() {
        log("Send 'leave' message to server");
        sendToServer({
            from: localUserName,
            type: 'leave',
            data: localRoom
        });

        cleanupAudioResources();

        console.log(localUserName + "exit")
        console.log(localRoom + "exit");

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

            remoteAudio.current = null;
            localAudio.current = null;

            alert("상대방과의 연결이 끊어졌습니다.");
            setShowRtcVoiceChat(false);

            // myPeerConnection 초기화
            myPeerConnection.close();
            myPeerConnection = null;

            log('Close the socket');
            if (socket != null) {
                socket.close();
            }
            // getMedia(mediaDisconnection);
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

    // 웹 소켓 연결 되었을 때 - open - 상태일때 이벤트 처리


    async function exitRooms(roomId) {
        const url = '/chat/delRoom';
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await axios.post(url, roomId, config);
            console.log(response.data);
            if (response.data === "true") {
                myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
            }
            return response.data;
        } catch (error) {
            console.error('There was a problem with the axios operation:', error.message);
        }
    }

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
                        if (localAudio.current) {
                            localAudio.current.srcObject = localStream;
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
        if (localAudio.current && localAudio.current.srcObject) {
            const tracks = localAudio.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        if (remoteAudio.current && remoteAudio.current.srcObject) {
            const remoteTracks = remoteAudio.current.srcObject.getTracks();
            remoteTracks.forEach(track => track.stop());
        }

        console.log("오디오 종료됨@@@@@@@@@@@")
//         // 필요한 다른 정리 작업들을 여기에 추가하세요.
        socket.close();
    }

//-----------------여기부터 이제 추가될 화상채팅에서 끌어온 로직
    return (
        <div className="rtcVoiceChat">
            <div className="users">
                <div style={isTalking ? {color: 'green'} : null} className="sendUser">{sendUser}</div>
                <div style={isTalking ? {color: 'green'} : null} className="receiverUser">{receiverUser}</div>
                <button onClick={exitRoom}>Exit Room</button>
            </div>

            <audio ref={remoteAudio} autoPlay></audio>
        </div>
    );
};
export default RtcVoiceChat