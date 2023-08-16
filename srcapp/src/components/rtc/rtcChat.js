import {Button, ButtonGroup} from 'reactstrap'; // reactstrap 라이브러리를 사용해 bootstrap 스타일 적용
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'
import axios from "axios";
import qs from "qs";
import React, {useEffect, useRef} from 'react';

// const addr = "localhost:3001"

const ChatRoom = () => {
    // const [isAnswerReceived, setIsAnswerReceived] = useState(false);
    // WebSocket 연결 설정
    let host = "";
    host = window.location.host;
    console.log("wss://" + host + "9002" + "/signal")
    host = host.slice(0,-4);
    console.log("wss://" + host + "9002" + "/signal")
    const socket = new WebSocket("wss://" + host + "9002" + "/signal");
    // const socket = new WebSocket("wss://localhost:9002/signal");

    //유저 이름 임의 설정 -> 로그인 연동 후 해당 사용자의 고유값으로 변경 예정!
    const localUserName = Math.random();

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
        video: true
    };
    let localStream;
    let localVideoTracks;
    let myPeerConnection;

    // const localVideo = document.getElementById('local_video');
    const localVideo = useRef(null);
    useEffect(() => {
        if (localVideo.current && localStream) {
            localVideo.current.srcObject = localStream;
        }
    }, [localStream]);

    const remoteVideo = useRef(null);
    useEffect(() => {
        if (remoteVideo.current && localStream) {
            remoteVideo.current.srcObject = localStream;
        }
    }, [remoteVideo])
    const localRoom = "1";

    socket.onerror = function (error) {
        console.log("WebSocket Error: ", error);
    };

    // 비디오 켜기/끄기 함수
    const toggleVideo = () => {
        if (localVideo.srcObject) {
            const enabled = localVideo.srcObject.getVideoTracks()[0].enabled;
            localVideo.srcObject.getVideoTracks()[0].enabled = !enabled;
        }
        if (localVideo.current.srcObject) {
            const enabled = localVideo.current.srcObject.getVideoTracks()[0].enabled;
            localVideo.current.srcObject.getVideoTracks()[0].enabled = !enabled;
        }
    };

    // 오디오 켜기/끄기 함수
    const toggleAudio = () => {
        if (localVideo.srcObject) {
            const enabled = localVideo.srcObject.getAudioTracks()[0].enabled;
            localVideo.srcObject.getAudioTracks()[0].enabled = !enabled;
        }
    };

    // 방 나가기 함수
    const exitRoom = () => {
        stop(); // 웹소켓 연결 종료 및 비디오/오디오 정지
    };

    // 페이지 시작시 실행되는 메서드 -> socket 을 통해 server 와 통신한다
    socket.onmessage = function (msg) {
        let message = JSON.parse(msg.data);
        console.log(message.type+"!111111111111111")
        switch (message.type) {
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
                message.data = chatListCount();
                log('Client is starting to ' + (message.data === "true") ? 'negotiate' : 'wait for a peer');
                log("messageDATA : " + message.data)
                handlePeerConnection(message);
                break;

            case "leave":
                stop();
                break;

            default:
                handleErrorMessage('Wrong type message received from server');
        }
    };


    async function chatListCount() {
        const params = {
            from: localUserName,
            type: 'findCount',
            data: '1',//여기가 방 제목 들어갈 부분(로그인 userName+ 요청받는 userName)
            candidate: 'null',
            sdp: 'null'
        };
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            const response = await axios.post('/webrtc/usercount', qs.stringify(params), config);
            if (response.data.toString() === "true") {
                myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
            }
            return response.data;
        } catch (error) {
            console.error('An error occurred while fetching data:', error);
        }
    }

    // 웹 소켓 연결 되었을 때 - open - 상태일때 이벤트 처리
    socket.onopen = function () {
        log('WebSocket connection opened to Room: #' + localRoom);
        sendToServer({
            from: localUserName,
            type: 'join',
            data: localRoom
        });
    };

    // 소켓이 끊겼을 때 이벤트처리
    socket.onclose = function (message) {
        log('Socket has been closed');

    };

    // 에러 발생 시 이벤트 처리
    socket.onerror = function (message) {
        handleErrorMessage("Error: " + message);
    };
    // }

    window.addEventListener('unload', stop);

// 브라우저 뒤로가기 시 이벤트
    window.onhashchange = function () {
        stop();
    }

    function stop() {
        log("Send 'leave' message to server");
        sendToServer({
            from: localUserName,
            type: 'leave',
            data: localRoom
        });

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
            if (remoteVideo.srcObject) {
                remoteVideo.srcObject.getTracks().forEach(track => track.stop());
            }
            if (localVideo.srcObject) {
                localVideo.srcObject.getTracks().forEach(track => track.stop());
            }

            remoteVideo.src = null;
            localVideo.src = null;

            // myPeerConnection 초기화
            myPeerConnection.close();
            myPeerConnection = null;

            log('Close the socket');
            if (socket != null) {
                socket.close();
            }
        }
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
        localStream = mediaStream;
        localVideo.srcObject = mediaStream;
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
                // Do nothing; this is the same as the user canceling the call.
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
        log('Track Event: set stream to remote video element');
        if (remoteVideo.current) { // remoteVideoRef가 null이 아닌지 확인
            remoteVideo.current.srcObject = event.streams[0];
        }
        // remoteVideo.srcObject = event.streams[0];
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
                    log("-- Local video stream obtained");
                    localStream = stream;
                    try {
                        if (localVideo.current) {
                            localVideo.current.srcObject = localStream;
                        }
                    } catch (error) {
                        localVideo.src = window.URL.createObjectURL(stream);
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
        log("The peer has accepted request");
        myPeerConnection.setRemoteDescription(message.sdp).catch(handleErrorMessage);
        navigator.mediaDevices.getUserMedia(mediaConstraints).then(function (stream) {
            log("-- Local video stream obtained");
            localVideo.current.srcObject = stream;
        });
    }

    function handleNewICECandidateMessage(message) {
        let candidate = new RTCIceCandidate(message.candidate);
        log("Adding received ICE candidate: " + JSON.stringify(candidate));
        myPeerConnection.addIceCandidate(candidate).catch(handleErrorMessage);
    }

    return (
        <main role="main" className="container-fluid text-center">
            <h1>ChatForYOU with WebRTC</h1>
            <div className="col-lg-12 mb-3">
                <div className="mb-3">Local User Id</div>
                <div className="col-lg-12 mb-3">
                    <div className="d-flex justify-content-around mb-3">
                        <div id="buttons" className="row">
                            <ButtonGroup className="mr-2">
                                <Button onClick={toggleVideo} outline color="success" id="video_off">Video
                                    On/Off</Button>
                            </ButtonGroup>
                            <ButtonGroup className="mr-2">
                                <Button onClick={toggleAudio} outline color="success" id="audio_off">Audio
                                    On/Off</Button>
                            </ButtonGroup>
                            <Button onClick={exitRoom} outline color="danger" id="exit" name="exit">
                                Exit Room
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-around mb-3">
                    <div className="col-lg-6 mb-3">
                        <video id="local_video" ref={localVideo} autoPlay playsInline></video>
                    </div>
                    <div className="col-lg-6 mb-3">
                        <video id="remote_video" ref={remoteVideo} autoPlay playsInline></video>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ChatRoom;
