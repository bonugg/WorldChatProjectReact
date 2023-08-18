import React from 'react'
import { useRef,useEffect,useState } from 'react';

const RtcVoiceChat = ({sendUser, receiverUser,setShowRtcVoiceChat}) => {
    const [isTalking, setIsTalking] = useState(false);
    const [socket, setSocket] = useState(null);
    const LocalAudioRef = useRef(null);
    const RemoteAudioRef = useRef(null)

    let localUserName = "";
    const localRoom = sendUser + "님과 " + receiverUser + "님의 화상채팅방";
    

    useEffect(() => {

        let host = "";
        host = window.location.host;
        console.log(host)
        host = host.slice(0, -4);
        const newSocket = new WebSocket("wss://" + host + "9002" + "/voice");

        
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

            return () => {
                javascriptNode.disconnect();
                analyser.disconnect();
                microphone.disconnect();
                socket.close();
            };
          })
          .catch(error => console.error('Error accessing audio stream:', error));
    }, [sendUser, receiverUser]);

 
    

const exitRoom = () => {
    stop();
    setShowRtcVoiceChat(false);
}

function sendToServer(msg) {
    let msgJSON = JSON.stringify(msg);
    socket.send(msgJSON);
}

function stop() {
    
    sendToServer({
        from: localUserName,
        type: 'leave',
        data: localRoom
    });
if (socket != null) {
            socket.close();
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