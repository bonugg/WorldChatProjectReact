import {Button, ButtonGroup} from 'reactstrap'; // reactstrap 라이브러리를 사용해 bootstrap 스타일 적용
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'
import axios from "axios";
import qs from "qs";
import React, {useEffect, useRef, useState} from 'react';
import RtcChatDrag from "./RtcChatDrag";

// const addr = "localhost:3001"

const ChatRoom = ({showRtcChat, sendUser, receiverUser, setShowRtcChat,type2,setType2,lang, isMinimize2, rtcMini}) => {
    const [rtcChatDrag, setRtcChatDrag] = useState(false);
    const [socket,setSocket] = useState(null);
    const mypeerconnectionRef = useRef(null);
    const localStreamRef = useRef(null);

    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    // const handleRtcShowDrag = () => {
    //     setRtcChatDrag(true);
    // };
    const handleDragClose = () => {
        setRtcChatDrag(false);
    };

    // const [isAnswerReceived, setIsAnswerReceived] = useState(false);
    // WebSocket 연결 설정
    useEffect(() => {
        if(showRtcChat){
            let host = "";
            host = window.location.host;
            console.log(host)
            host = host.slice(0, -4);
            console.log("wss://" + host + "9002" + "/signal");
            let sockets = new WebSocket("wss://" + host + "9002" + "/signal");
            setSocket(sockets);
        }else {
            if(mypeerconnectionRef.current){
                stop();
            }
        }
    },[showRtcChat]);

    let localUserName = "";
    // useEffect(()=>{
    //     handleRtcShowDrag();
    //     // alert("드래그 실행");
    // },[])
    const localRoom = sendUser + "님과 " + receiverUser + "님의 화상채팅방";
    // let loginUserName = "";
    // console.log(rtcUserName+"이게 넘어온 이름")

    if (localStorage.getItem('userName')) {
        localUserName = localStorage.getItem('userName');
    }

    // socket.onclose = function(event) {
    //     if (event.wasClean) {
    //         console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
    //     } else {
    //         console.log('Connection died');
    //         setTimeout(() => {
    //             reconnect();
    //         }, 5000);  // 5 seconds
    //     }
    // };
    // function reconnect() {
    //     socket = new WebSocket("wss://your-server/signal");
    //     // 여기에 다른 이벤트 리스너 설정 코드를 추가
    // }
    // const socket = new WebSocket('wss://' + window.location.host + '/signal');

    //유저 이름 임의 설정 -> 로그인 연동 후 해당 사용자의 고유값으로 변경 예정!
    // const localUserName = Math.random();


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
        video: { width: 640, height: 480, frameRate: 24 }
    };
    const mediaDisconnection = {
        audio: false,
        video: false
    };
    let localStream;
    let localVideoTracks;
    let myPeerConnection;

    const localVideo = useRef(null);
    useEffect(() => {
        console.log("stream test1");
        if (localVideo.current && localStreamRef.current) {
            localVideo.current.srcObject = localStreamRef.current;
        }
    }, [localStreamRef.current]);

    const remoteVideo = useRef(null);
    // useEffect(() => {
    //     if (remoteVideo.current && localStream) {
    //         console.log("상대 스트림????????????????????");
    //     console.log("stream test2");
    //         remoteVideo.current.srcObject = localStream;
    //     }
    // }, [remoteVideo])


    if(socket){
        socket.onerror = function (error) {
            console.log("WebSocket Error: ", error);
        };
    }

    // 비디오 켜기/끄기 함수
    // const toggleVideo = () => {
    //     // if (localVideo.srcObject) {
    //     //     const enabled = localVideo.srcObject.getVideoTracks()[0].enabled;
    //     //     console.log("카메라 토글1");
    //     //     localVideo.srcObject.getVideoTracks()[0].enabled = !enabled;
    //     // }
    //     if (localVideo.current.srcObject) {
    //         const enabled = localVideo.current.srcObject.getVideoTracks()[0].enabled;
    //         console.log("카메라 토글2");
    //         localVideo.current.srcObject.getVideoTracks()[0].enabled = !enabled;
    //         // remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    //         // localVideo.srcObject.getTracks().forEach(track => track.stop());
    //     }
    // };
    const toggleVideo = () => {
        // if (localVideo.srcObject) {
        //     const enabled = localVideo.srcObject.getVideoTracks()[0].enabled;
        //     localVideo.srcObject.getVideoTracks()[0].enabled = !enabled;
        // }
        if (localVideo.current.srcObject) {
            const enabled = localVideo.current.srcObject.getVideoTracks()[0].enabled;
            console.log("카메라 토글2");
            localVideo.current.srcObject.getVideoTracks()[0].enabled = !enabled;
            // socket.send(JSON.stringify({
            //     type: 'video-toggle',
            //     enabled: !enabled
            // }));
        }
    };

    // 오디오 켜기/끄기 함수
    const toggleMike = () => {
        if (localVideo.current && localVideo.current.srcObject) {
            const audioTracks = localVideo.current.srcObject.getAudioTracks()
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

//마이크 켜기/끄기 함수
    const toggleAudio = () => {
        if (remoteVideo.current && remoteVideo.current.srcObject) {
            const audioTracks = remoteVideo.current.srcObject.getAudioTracks()
            if (audioTracks.length > 0) {
                const enabled = audioTracks[0].enabled;
                console.log("오디오 토글: " + enabled);
                audioTracks[0].enabled = !enabled;
            } else {
                console.error("No audio track found in the stream");
            }
        } else {
            console.error("No local video or stream found");
        }
    };

    // 방 나가기 함수
    const exitRoom = () => {
        console.log("exit@@@@@@@@@@@@@@@@"+type2);
        stop(); // 웹소켓 연결 종료 및 비디오/오디오 정지
        setShowRtcChat(false);
        isMinimize2(false);
    };

    // 페이지 시작시 실행되는 메서드 -> socket 을 통해 server 와 통신한다
    if(socket){
        socket.onmessage = function (msg) {
            console.log("peertest !!!!!!!!!!!!!!!!!!!!!!!!!");
            let message = JSON.parse(msg.data);
            console.log("메시지 타입: " + message.type);
            console.log("메세지 프롬 : " + message.from);
            console.log("localUsername : " + localUserName);


        switch (message.type) {
            case 'video-toggle':
                // if (remoteVideo.current.srcObject) {
                //     remoteVideo.current.srcObject.getVideoTracks()[0].enabled = message.enabled;
                // }
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
                    console.log("User left message received");
                    //alert(message.message);  // "상대방과 연결이 끊겼습니다"를 알림으로 표시
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
        };
    }




    async function chatListCount() {
        const params = {
            from: localUserName,
            type: 'findCount',
            data: sendUser + "님과 " + receiverUser + "님의 화상채팅방",//여기가 방 제목 들어갈 부분(로그인 userName+ 요청받는 userName)
            candidate: 'null',
            sdp: 'null',
            chatType: 'video'
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
                mypeerconnectionRef.current.onnegotiationneeded = handleNegotiationNeededEvent;
            }
            return response.data;
        } catch (error) {
            console.error('An error occurred while fetching data:', error);
        }
    }

    // 웹 소켓 연결 되었을 때 - open - 상태일때 이벤트 처리
    if(socket){
        socket.onopen = function () {
            log('WebSocket connection opened to Room: #' + localRoom);
            sendToServer({
                from: localUserName,
                type: 'join',
                data: localRoom
            });
        };
    }

    // 소켓이 끊겼을 때 이벤트처리
    if(socket){
        socket.onclose = function (message) {
            log('Socket has been closed');
            // alert("연결이 끊어졌습니다.")
            // exitRooms().then(r => {});
        }
    }

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
                mypeerconnectionRef.current.onnegotiationneeded = handleNegotiationNeededEvent;
            }
            return response.data;
        } catch (error) {
            console.error('There was a problem with the axios operation:', error.message);
        }
    }

    // 에러 발생 시 이벤트 처리
    if(socket){
        socket.onerror = function (message) {
            handleErrorMessage("Error: " + message);
        };
    }
    // }

    window.addEventListener('unload', stop);

// 브라우저 뒤로가기 시 이벤트
    window.onhashchange = function () {
        stop();
    }

    function stop() {
        console.log(localUserName+"exit")
        console.log(localRoom+"exit");

        setType2('');

        sendToServer({
            from: localUserName,
            type: 'leave',
            data: localRoom
        });
        if (mypeerconnectionRef.current) {
            log('Close the RTCPeerConnection');

            sendToServer({
                from: localUserName,
                type: 'leave',
                data: localRoom
            });


            // disconnect all our event listeners
            mypeerconnectionRef.current.onicecandidate = null;
            mypeerconnectionRef.current.ontrack = null;
            mypeerconnectionRef.current.onnegotiationneeded = null;
            mypeerconnectionRef.current.oniceconnectionstatechange = null;
            mypeerconnectionRef.current.onsignalingstatechange = null;
            mypeerconnectionRef.current.onicegatheringstatechange = null;
            mypeerconnectionRef.current.onnotificationneeded = null;
            mypeerconnectionRef.current.onremovetrack = null;

            // 비디오 정지
            if (remoteVideo.srcObject) {
                console.log("상대 카메라 꺼짐");
                remoteVideo.srcObject.getTracks().forEach(track => track.stop());
                //remoteVideo.srcObject = null;
            }
            if (localVideo.srcObject) {
                console.log("내 카메라 꺼짐");
                localVideo.srcObject.getTracks().forEach(track => track.stop());
                //localVideo.srcObject = null;
            }

            remoteVideo.current = null;
            localVideo.current = null;

            // myPeerConnection 초기화
            mypeerconnectionRef.current.close();
            mypeerconnectionRef.current = null;
            localStreamRef.current = null;
            setShowRtcChat(false);
            isMinimize2(false);
            //alert("상대방과 연결을 종료하시겠습니까?");

            log("Send 'leave' message to server");

            log('Close the socket');
            if (socket != null) {
                socket.close();

            }


            // getMedia(mediaDisconnection);

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
        console.log("stream test3");
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
            });
        }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(getLocalMediaStream).catch(handleGetUserMediaError);
    }

// 두번째 클라이언트가 들어오면 피어 연결을 생성 + 미디어 생성
    function handlePeerConnection(message) {
        createPeerConnection();
// console.log("?")
        getMedia(mediaConstraints);

        if (message.data === "true") {

            mypeerconnectionRef.current.onnegotiationneeded = handleNegotiationNeededEvent;
        }
    }

    function createPeerConnection() {
        mypeerconnectionRef.current = new RTCPeerConnection(peerConnectionConfig);

        mypeerconnectionRef.current.onicecandidate = handleICECandidateEvent;
        mypeerconnectionRef.current.ontrack = handleTrackEvent;

        // the following events are optional and could be realized later if needed
        // myPeerConnection.onremovetrack = handleRemoveTrackEvent;
        // myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
        // myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
        // myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
    }

    function getLocalMediaStream(mediaStream) {
        console.log("stream test4");
        localStreamRef.current = mediaStream;
        localVideo.srcObject = mediaStream;
        localStreamRef.current.getTracks().forEach(track => mypeerconnectionRef.current.addTrack(track, localStreamRef.current));
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
        log('Track Event: set stream to remote video element');
        if (remoteVideo.current) { // remoteVideoRef가 null이 아닌지 확인
            remoteVideo.current.srcObject = event.streams[0];
        }
        console.log("트랙이 찍히는가?: "+event.streams[0].getAudioTracks());
        console.log("트랙이 찍히는가?: "+event.streams[0].getVideoTracks());
        // remoteVideo.srcObject = event.streams[0];
    }

// WebRTC called handler to begin ICE negotiation
// WebRTC 의 ICE 통신 순서
// 1. WebRTC offer 생성
// 2. local media description 생성?
// 3. 미디어 형식, 해상도 등에 대한 내용을 서버에 전달
    function handleNegotiationNeededEvent() {
        mypeerconnectionRef.current.createOffer().then(function (offer) {
            return mypeerconnectionRef.current.setLocalDescription(offer);
        })
            .then(function () {
                if (socket.readyState !== socket.CONNECTING) {
                    sendToServer({
                        from: localUserName,
                        data: localRoom,
                        type: 'offer',
                        sdp: mypeerconnectionRef.current.localDescription
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
            log('RTC Signalling state: ' + mypeerconnectionRef.current.signalingState);
            mypeerconnectionRef.current.setRemoteDescription(desc).then(function () {
                log("Set up local media stream");
                return navigator.mediaDevices.getUserMedia(mediaConstraints);
            })
                .then(function (stream) {
                    log("-- Local video stream obtained");
                    console.log("stream test5");
                    localStreamRef.current = stream;
                    try {
                        if (localVideo.current) {
                            localVideo.current.srcObject = localStreamRef.current;
                        }
                    } catch (error) {
                        localVideo.src = window.URL.createObjectURL(stream);
                    }
                    log("-- Adding stream to the RTCPeerConnection");
                    localStreamRef.current.getTracks().forEach(track => mypeerconnectionRef.current.addTrack(track, localStreamRef.current));
                })
                .then(function () {
                    log("-- Creating answer");
                    return mypeerconnectionRef.current.createAnswer();
                })
                .then(function (answer) {
                    log("-- Setting local description after creating answer");
                    return mypeerconnectionRef.current.setLocalDescription(answer);
                })
                .then(function () {
                    log("Sending answer packet back to other peer");
                    sendToServer({
                        from: localUserName,
                        data: localRoom,
                        type: 'answer',
                        sdp: mypeerconnectionRef.current.localDescription
                    });

                })
                .catch(handleErrorMessage)
        }
    }

    function handleAnswerMessage(message) {
        mypeerconnectionRef.current.setRemoteDescription(message.sdp).catch(handleErrorMessage);
        // log("The peer has accepted request");
        // let desc = new RTCSessionDescription(message.sdp);
        // if (desc != null && message.sdp != null) {
        //     myPeerConnection.setRemoteDescription(desc).catch(handleErrorMessage);
        //     navigator.mediaDevices.getUserMedia(mediaConstraints).then(function (stream) {
        //         log("-- Local video stream obtained");
        //         if (localVideo.current) {
        //             localVideo.current.srcObject = stream;
        //         }
        //     });
        // }
    }
    let recordedChunksArray = [];
    const toggleRecording = (test) => {
        console.log("허이야" + test)
        if (!isRecording) {
            const videoStream = localVideo.current.srcObject;
            const audioTracks = videoStream.getAudioTracks();
            // 녹음 시작
            const audioStream = new MediaStream([audioTracks[0]]);
            const recorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
            console.log("녹음시작@@@@@@@@@@@@@@@");
            console.log("녹음리코더 : ", recorder);


            recorder.ondataavailable = event => {
                if (event.data.size >= 0) {
                    recordedChunksArray.push(event.data);
                    console.log("음성내용@@@@@@@@@" + recordedChunksArray)
                }
            };



            recorder.onstop = () => {
                console.log("마지막 언어 체크: " + lang);
                const blob = new Blob(recordedChunksArray, { type: 'audio/webm' });
                console.log("sender: "+sendUser+" / receiver:"+receiverUser);
                const formData = new FormData();
                formData.append('sender', localStorage.getItem("userName") == sendUser? sendUser : receiverUser);
                formData.append('receiver', localStorage.getItem("userName") == sendUser? receiverUser : sendUser);
                formData.append('audio', blob, 'recorded_audio.wav');
                formData.append('lang',test.toString());
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
    function handleNewICECandidateMessage(message) {
        let candidate = new RTCIceCandidate(message.candidate);
        log("Adding received ICE candidate: " + JSON.stringify(candidate));
        mypeerconnectionRef.current.addIceCandidate(candidate).catch(handleErrorMessage);
    }

    const isMinimizeHandle = (isMinimize) => {
        isMinimize2(isMinimize);
    }

    return (
        <main role="main" className="container-fluid text-center" style={{position: 'fixed', zIndex : '3'}}>
            <RtcChatDrag onClose={handleDragClose} localVideo={localVideo} remoteVideo={remoteVideo} show={showRtcChat} localRoom={localRoom} toggleVideo={toggleVideo} toggleAudio={toggleAudio} toggleMike={toggleMike} exitRoom={exitRoom} toggleRecording={toggleRecording} isRecording={isRecording} lang={lang} isMinimize={isMinimizeHandle} rtcMini={rtcMini}></RtcChatDrag>
            {/*<h1>ChatForYOU with WebRTC</h1>*/}
            {/*<div className="col-lg-12 mb-3">*/}
            {/*    <div className="mb-3">Local User Id</div>*/}
            {/*    <div className="col-lg-12 mb-3">*/}
            {/*        <div className="d-flex justify-content-around mb-3">*/}
            {/*            <div id="buttons" className="row">*/}
            {/*                <ButtonGroup className="mr-2">*/}
            {/*                    <Button onClick={toggleVideo} outline color="success" id="video_off">Video*/}
            {/*                        On/Off</Button>*/}
            {/*                </ButtonGroup>*/}
            {/*                <ButtonGroup className="mr-2">*/}
            {/*                    <Button onClick={toggleAudio} outline color="success" id="audio_off">Audio*/}
            {/*                        On/Off</Button>*/}
            {/*                </ButtonGroup>*/}
            {/*                <Button onClick={exitRoom} outline color="danger" id="exit" name="exit">*/}
            {/*                    Exit Room*/}
            {/*                </Button>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}

            {/*    <div className="row justify-content-around mb-3">*/}
            {/*        <div className="col-lg-6 mb-3">*/}
            {/*            /!*<video id="local_video" ref={localVideo} autoPlay playsInline></video>*!/*/}
            {/*        </div>*/}
            {/*        <div className="col-lg-6 mb-3">*/}
            {/*            /!*<video id="remote_video" ref={remoteVideo} autoPlay playsInline></video>*!/*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </main>
    );
};

export default ChatRoom;