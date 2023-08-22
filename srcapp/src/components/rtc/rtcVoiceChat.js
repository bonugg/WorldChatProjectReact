import React from 'react'
import { useRef,useEffect,useState } from 'react';
import axios from "axios";
import qs from "qs";

const RtcVoiceChat = ({sendUser, receiverUser,setShowRtcVoiceChat}) => {
    const [isTalking, setIsTalking] = useState(false);
    const [socket, setSocket] = useState(null);
    const LocalAudioRef = useRef(null);
    const RemoteAudioRef = useRef(null)

    let localUserName = "";
    const localRoom = sendUser + "님과 " + receiverUser + "님의 음성채팅방";
    
    let cleanupAudioResources = () => {
        // 기본적으로 아무 작업도 수행하지 않는 함수로 초기화
    };

    let host = "";
        host = window.location.host;
        console.log(host)
        host = host.slice(0, -4);
        const newSocket = new WebSocket("wss://" + host + "9002" + "/voice");

    useEffect(() => {

        

        
        // console.log(rtcUserName+"이게 넘어온 이름")
        if (localStorage.getItem('userName')) {
            console.log("발신 유저 이름: " + sendUser)
            console.log("수신 유저 이름: " + receiverUser)
            localUserName = localStorage.getItem('userName');
           
            }

        setSocket(newSocket);

        

        newSocket.onopen = (event) => {
            console.log("WebSocket 연결 성공:", event);
        };
    
        // 다른 이벤트 리스너들도 추가할 수 있습니다.
        newSocket.onmessage = (event) => {
            console.log("서버로부터 메시지 수신:", event.data);
        };
    
        newSocket.onerror = (event) => {
            console.error("WebSocket 오류 발생:", event);
        };
    
        newSocket.onclose = (event) => {
            console.log("WebSocket 연결 종료:", event);
        };


        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            LocalAudioRef.current.srcObject = stream;

            // 2. 오디오 스트림에서 볼륨 감지하는 기능 추가
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
            cleanupAudioResources = () => {
                if (LocalAudioRef.current && LocalAudioRef.current.srcObject) {
                    const tracks = LocalAudioRef.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                }
                if(javascriptNode) {
                    javascriptNode.disconnect();
                }
                if(analyser) {
                    analyser.disconnect();
                }
                if(microphone) {
                    microphone.disconnect();
                }
                if(audioContext) {
                    audioContext.close();  // 오디오 컨텍스트 종료
                }
            };
        })
        .catch(error => console.error('Error accessing audio stream:', error));

        return () => {
            
            cleanupAudioResources();
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };

}, [sendUser, receiverUser]);


const exitRoom = () => {
    stop();
    setShowRtcVoiceChat(false);
}

function sendToServer(msg) {
    let msgJSON = JSON.stringify(msg);
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(msgJSON);
    }
}
 

function stop() {
    
    sendToServer({
        from: localUserName,
        type: 'leave',
        data: localRoom
    });

    cleanupAudioResources();

if (socket != null) {
            socket.close();
    }
}

//-----------------여기부터 이제 추가될 화상채팅에서 끌어온 로직

async function chatListCount() {
    const params = {
        from: localUserName,
        type: 'findCount',
        data: sendUser + "님과 " + receiverUser + "님의 화상채팅방",//여기가 방 제목 들어갈 부분(로그인 userName+ 요청받는 userName)
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

newSocket.onmessage = function (msg) {
    let message = JSON.parse(msg.data);
    console.log("메시지 타입: " + message.type);

    switch (message.type) {
        // video-toggle 제거

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
            console.log("join들어옴")
            message.data = chatListCount();
            log('Client is starting to ' + (message.data === "true") ? 'negotiate' : 'wait for a peer');
            handlePeerConnection(message);
            break;

        case "leave":
            console.log("leave 메시지 수신");
            stop();
            break;

        default:
            handleErrorMessage('Wrong type message received from server');
    }
};


let myPeerConnection;
let localStream;

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
            
        })
        .catch(function (reason) {
            // an error occurred, so handle the failure to connect
            //handleErrorMessage('failure to connect error: ', reason);
        });
}

let log = (message) => {

}

function handleErrorMessage(message) {
    console.error(message);
}

function handleAnswerMessage(message) {
    log('Accepting Answer Message');
    log(message);

    // Ensure the PeerConnection is initialized
    if (!myPeerConnection) {
        log('PeerConnection has not been initialized. Cannot handle answer.');
        return;
    }

    // Use the received SDP from the answer message as the remote description
    let desc = new RTCSessionDescription(message.sdp);
    myPeerConnection.setRemoteDescription(desc).then(function() {
        log('Remote description set successfully for answer.');
    }).catch(function(err) {
        log('Error setting remote description: ', err);
    });
}

function handleNewICECandidateMessage(message) {
    let candidate = new RTCIceCandidate(message.candidate);
    log("Adding received ICE candidate: " + JSON.stringify(candidate));
    myPeerConnection.addIceCandidate(candidate).catch(handleErrorMessage);
}


function handleOfferMessage(message) {
    log('Accepting Offer Message');
    log(message);
    let desc = new RTCSessionDescription(message.sdp);
    if (desc != null && message.sdp != null) {
        log('RTC Signalling state: ' + myPeerConnection.signalingState);
        
        myPeerConnection.setRemoteDescription(desc).then(function () {
            log("Setting up local audio stream");
            return navigator.mediaDevices.getUserMedia({ audio: true });
        })
        .then(function (stream) {
            log("-- Local audio stream obtained");
            localStream = stream;
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
        .catch(handleErrorMessage);
    }
}

const peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.stunprotocol.org:3478'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

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
    // 원격 피어로부터 전송된 미디어 스트림을 가져옵니다.
    const remoteStream = event.streams[0];

    // 웹 페이지의 오디오 요소에 연결합니다. 
    // 여기서 'remoteAudio'는 오디오 요소의 id입니다.
    const remoteAudio = document.getElementById('remoteAudio');

    // 오디오 요소의 srcObject로 미디어 스트림을 설정하여 소리를 들려줍니다.
    remoteAudio.srcObject = remoteStream;
}


function handlePeerConnection(message) {
    log('Setting up the RTCPeerConnection for voice chat.');

    if (!myPeerConnection) {
        log('Creating new RTCPeerConnection.');

        myPeerConnection = new RTCPeerConnection(peerConnectionConfig);

        // ICE Candidate 이벤트 처리 설정
        myPeerConnection.onicecandidate = handleICECandidateEvent;

        // 스트림 추가를 위한 이벤트 처리 설정
        myPeerConnection.ontrack = handleTrackEvent;

        // 음성 데이터의 스트림 가져오기 및 추가
        if (LocalAudioRef.current && LocalAudioRef.current.srcObject) {
            LocalAudioRef.current.srcObject.getTracks().forEach(track => {
                myPeerConnection.addTrack(track, LocalAudioRef.current.srcObject);
            });
        }

        // 필요한 경우 offer를 생성하도록 설정
        if (message.data === "true") {
            log('Only peer in the room, waiting for another peer to join.');
        } else {
            log('Another peer is in the room, starting negotiation.');
            handleNegotiationNeededEvent();
        }
    }
}








  return (
    <div className="rtcVoiceChat">
    <div className="users">
      <div style={isTalking ? { color: 'green' } : null} className="sendUser">{sendUser}</div>
      <div style={isTalking ? { color: 'green' } : null} className="receiverUser">{receiverUser}</div>
      <button onClick={exitRoom}>Exit Room</button>
    </div>
    <audio ref={LocalAudioRef} controls></audio>
    <audio ref={RemoteAudioRef} controls></audio>
  </div>
  )
}

export default RtcVoiceChat