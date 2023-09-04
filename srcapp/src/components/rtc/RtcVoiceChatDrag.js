import React, {useState, useEffect} from 'react'
import Draggable from 'react-draggable';
import Button from "@mui/material/Button";

function Drag({show, onClose, remoteAudio, localRoom, exitRoom,receiverIsTalking,senderIsTalking,src1,src2,toggleMike,localAudio,toggleRecording,isRecording}) {
    const [position, setPosition] = useState({x: -183, y: -286});
    const [isMinimized, setIsMinimized] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    //버튼 토글
    const [button1Active, setButton1Active] = useState(false);
    const [button2Active, setButton2Active] = useState(false);
    const [button3Active, setButton3Active] = useState(false);
    const [recoderButton, setRecoderButton] = useState(false);

    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
        if (!show) {
            setIsClosed(false);
        }
    }, [show]);

    const trackPos = (data) => {
        setPosition({x: data.x, y: data.y});
    };
    const Language = (language)=>{
        console.log("선택언어: " + language)
        // setSelectLang(language);
        // lang(language);
        localStorage.setItem('language', language);
    }

    // useEffect로 isRecording 상태가 변경될 때 타이머 설정/해제
useEffect(() => {
    let interval;
    if (isRecording) {
        interval = setInterval(() => {
            setDotCount((prevDotCount) => {
                if (prevDotCount < 3) {
                    return prevDotCount + 1;
                } else {
                    return 1;
                }
            });
        }, 500);  // 0.5초 간격으로 업데이트
    } else {
        setDotCount(0);  // 녹음이 중지되면 dotCount 초기화
    }

    return () => {
        if (interval) {
            clearInterval(interval);  // 컴포넌트 언마운트 또는 isRecording 상태 변경 시 타이머 해제
        }
    };
}, [isRecording]);

const buttonText = isRecording ? `번역중${'.'.repeat(dotCount)}` : '녹음 번역';
const buttonColor = isRecording ? 'lightcoral' : '';  // 녹음 중일 때 빨간색 배경, 아니면 기본 배경색
const textColor = isRecording ? 'black' : 'white';




    // let lastEventTimestamp = 0;
    // const THROTTLE_INTERVAL = 10000; // 0.2초
    // useEffect(()=>{
    //     const currentTime = Date.now();
    //     if (currentTime - lastEventTimestamp > THROTTLE_INTERVAL) {
    //         lastEventTimestamp = currentTime;
    //         console.log("test!")
    //     }
    // },[senderIsTalking,receiverIsTalking])
    const handleMinimizeClick = () => {
        setIsMinimized(!isMinimized);
    };

    const handleCloseClick = () => {
        exitRoom();
        setIsClosed(true);
        if (onClose) {
            onClose();
        }
    };

    if (!show || isClosed) {
        return null;
    }

    return (
        <div className="Drag">
            {!isClosed && (
                <>
                    <Draggable defaultPosition={position} onDrag={(e, data) => trackPos(data)} disabled={isMinimized}>
                        <div
                            className="box"
                            style={{
                                position: isMinimized ? 'absolute' : 'fixed',
                                display: isMinimized ? 'none' : 'block',
                                top: '0',
                                cursor: 'auto',
                                color: 'black',
                                width: '450px',
                                height: '500px',
                                borderRadius: '15px',
                                borderTopLeftRadius: '15px',
                                borderBottomLeftRadius: '15px',
                                padding: '1em',
                                margin: 'auto',
                                userSelect: 'none',
                                zIndex: '2',
                                background: 'rgb(50, 50, 50,0.8)',
                                transition: 'height 0.25s ease-in-out'
                            }}
                        >
                            <div className={"header"}>
                                <div className={"btnDiv_create"}>

                                </div>
                                <div className={"title_cate"}>
                                    video chat

                                </div>
                                <div className={"btnDiv"}>
                                    <Button
                                        onClick={handleMinimizeClick}
                                        className={"minimum"}
                                    >
                                    </Button>
                                    <Button
                                        onClick={handleCloseClick}
                                        className={"close"}
                                    >
                                    </Button>
                                </div>

                            </div>
                            <br/>
                            <div style={{textAlign: 'center', color: 'white', fontSize: '20px'}}>{localRoom}</div>
                            <br/>
                            <div style={{marginLeft:'15%', position: 'relative', width: '70%', height: '70%'}}>

                                {/* audio 태그 */}
                                <audio ref={localAudio} muted></audio>
                                <audio
                                    id="local_video"
                                    ref={remoteAudio}
                                    autoPlay playsInline
                                    style={{
                                        // position: 'absolute',  // Absolute positioning
                                        // bottom: '0',
                                        // left: '0',
                                        // width: '40%',
                                        // height: '40%',
                                        zIndex: 1  // Behind the div blocks
                                    }}
                                >
                                </audio>

                                {/* senderIsTalking div 블록 */}
                                <div
                                    style={!senderIsTalking ? {
                                        position: 'absolute',  // Absolute positioning
                                        width: '60%',
                                        minHeight: '100px',
                                        height: '60%',
                                        left: '-15%',
                                        top: '15%',
                                        backgroundImage: `url(${src1})`,
                                        backgroundSize: 'cover',  // cover 값을 설정
                                        backgroundPosition: 'center',  // 이미지를 중앙에 배치
                                        zIndex: 2  // In front of the audio tag
                                    } : {
                                        position: 'absolute',  // Absolute positioning
                                        width: '60%',
                                        minHeight: '100px',
                                        height: '60%',
                                        left: '-15%',
                                        top: '15%',
                                        backgroundImage: `url(${src1})`,
                                        backgroundSize: 'cover',  // cover 값을 설정
                                        backgroundPosition: 'center',  // 이미지를 중앙에 배치
                                        border: '5px solid green',
                                        zIndex: 2  // In front of the audio tag
                                    }}
                                >
                                </div>

                                {/* receiverIsTalking div 블록 */}
                                <div
                                    style={!receiverIsTalking ? {
                                        position: 'absolute',  // Absolute positioning
                                        width: '60%',
                                        height: '60%',
                                        right: '-15%',
                                        top: '15%',
                                        backgroundImage: `url(${src2})`,
                                        backgroundSize: 'cover',  // cover 값을 설정
                                        backgroundPosition: 'center',  // 이미지를 중앙에 배치
                                        zIndex: 2  // In front of the audio tag
                                    } : {
                                        position: 'absolute',  // Absolute positioning
                                        width: '60%',
                                        height: '60%',
                                        right: '-15%',
                                        top: '15%',
                                        backgroundImage: `url(${src2})`,
                                        backgroundSize: 'cover',  // cover 값을 설정
                                        backgroundPosition: 'center',  // 이미지를 중앙에 배치
                                        border: '5px solid green',
                                        zIndex: 2  // In front of the audio tag
                                    }}
                                >
                                </div>

                            </div>
                            {/*</div>*/}


                            <div className="Drag" style={{position: 'relative', display: 'flex'}}>


                            </div>


                            {/*<div style={senderIsTalking ? {color: 'green'} : null}*/}
                            {/*     className="sendUser">{sendUser}</div>*/}
                            {/*<div style={receiverIsTalking ? {color: 'green'} : null}*/}
                            {/*     className="receiverUser">{receiverUser}</div>*/}


                            <div className="button-container"
                                 style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px'}}>
                                {/*<Button*/}
                                {/*    style={{*/}
                                {/*        backgroundColor: button1Active ? '#f05650' : '',*/}
                                {/*        transition: 'background-color 0.3s',*/}
                                {/*        color: 'white',*/}
                                {/*        width: '30%'*/}
                                {/*    }}*/}
                                {/*>*/}
                                {/*    video {button1Active ? 'OFF' : 'ON'}*/}
                                {/*</Button>*/}
                                <Button
                                    onClick={() => {setButton2Active(!button2Active); toggleMike()}}
                                    style={{
                                        backgroundColor: button2Active ? '#f05650' : '',
                                        transition: 'background-color 0.3s',
                                        color: 'white',
                                        width: '30%',
                                        border: '2px solid lightcoral'
                                    }}
                                >
                                    mike {button2Active ? 'OFF' : 'ON'}
                                </Button>

                                <Button
                                    onClick={toggleRecording}
                                    style={{
                                        backgroundColor:buttonColor,
                                        transition: 'background-color 0.3s',
                                        width: '30%',  
                                        color: textColor,     
                                        border:'2px solid lightblue'                          
                                    }}
                                >
                                    {buttonText}

                                </Button>
                                <div style={{position: 'absolute', backgroundColor: '#fff', border: '1px solid #ccc'}}>
                                    <div onClick={() => Language('Kor')}>Kor</div>
                                    <div onClick={() => Language('Eng')}>Eng</div>
                                    <div onClick={() => Language('Jpn')}>Jpn</div>
                                    <div onClick={() => Language('Chn')}>Chn</div>
                                </div>

                                {/*<Button*/}
                                {/*    style={{*/}
                                {/*        backgroundColor: button3Active ? '#f05650' : '',*/}
                                {/*        transition: 'background-color 0.3s',*/}
                                {/*        color: 'white',*/}
                                {/*        width: '30%'*/}
                                {/*    }}*/}
                                {/*>*/}
                                {/*    volume {button3Active ? 'OFF' : 'ON'}*/}
                                {/*</Button>*/}
                            </div>
                            {/*<Button style={{right:'10%', textAlign:'center'}}>test</Button>*/}
                            {/*<Button style={{left:'10%', top:'5%'}}>test</Button>*/}
                            {/*<div style={{color:'white', fontSize: '22px'}}>x: {position.x.toFixed(0)}, y: {position.y.toFixed(0)}</div>*/}
                        </div>
                    </Draggable>
                    {isMinimized && (
                        <Button
                            onClick={handleMinimizeClick}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                bottom: '80px',
                                transform: 'translateX(-50%)',
                            }}
                            className={"maximum_btn"}
                        >
                            R
                        </Button>
                    )}
                </>
            )}
        </div>
    );
                        }

export default Drag;