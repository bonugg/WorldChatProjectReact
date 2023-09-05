import React, {useState, useEffect} from 'react'
import Draggable from 'react-draggable';
import Button from "@mui/material/Button";

function Drag({show, onClose, remoteVideo, localVideo, localRoom, toggleVideo, toggleAudio, toggleMike, exitRoom,toggleRecording,isRecording, lang}) {
    const [position, setPosition] = useState({x: -183, y: -286});
    const [isMinimized, setIsMinimized] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [selectLang, setSelectLang] = useState("eng");


    //버튼 토글
    const [button1Active, setButton1Active] = useState(false);
    const [button2Active, setButton2Active] = useState(false);
    const [button3Active, setButton3Active] = useState(false);
    const [changeVideo, setChangeVideo] = useState(true);
    const [dotCount, setDotCount] = useState(0);
    // const [showLanguageMenu, setShowLanguageMenu] = useState(false);

    // useEffect(() => {
    //     if (localVideo.current && localVideo.current.srcObject) {
    //         const stream = localVideo.current.srcObject;
    //         const audioTracks = stream.getAudioTracks();
    //         if (audioTracks.length > 0) {
    //             stream.removeTrack(audioTracks[0]);
    //         }
    //     }
    // }, [localVideo]);
const Language = (language)=>{
    console.log("선택언어: " + language)
    setSelectLang(language);
    lang(language);
    localStorage.setItem('language', language);
}
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
    const buttonColor = isRecording ? 'red' : '';  // 녹음 중일 때 빨간색 배경, 아니면 기본 배경색

    // useEffect(() => {
    //     if (localVideo.current && localVideo.current.srcObject) {
    //         const stream = localVideo.current.srcObject;
    //         const audioTracks = stream.getAudioTracks();
    //         if (audioTracks.length > 0) {
    //             stream.removeTrack(audioTracks[0]);
    //         }
    //     }
    // }, [localVideo]);


    useEffect(() => {
        if (!show) {
            setIsClosed(false);
        }
    }, [show]);

    const trackPos = (data) => {
        setPosition({x: data.x, y: data.y});
    };

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

const toggleLang=()=>{
        toggleRecording(selectLang);
        // lang(selectLang);
        // console.log("선택된 언어: " + selectLang);
        // setShowLanguageMenu(false);
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
                            <div className="Drag" style={{ position: 'relative', display: 'flex' }}>
                                <video
                                    id="remote_video"
                                    ref={remoteVideo}
                                    onClick={()=>setChangeVideo(!changeVideo)}
                                    autoPlay playsInline
                                    style={changeVideo ? {
                                        width: '100%',
                                        height: 'auto',
                                        zIndex: 1
                                    }:{
                                        width: '40%',
                                        height: '40%',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        zIndex: 2
                                    }}
                                ></video>

                                <video
                                    muted
                                    id="local_video"
                                    ref={localVideo}
                                    onClick={()=>{setChangeVideo(!changeVideo)}}
                                    autoPlay playsInline
                                    style={changeVideo ? {
                                        width: '40%',
                                        height: '40%',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        zIndex: 2
                                    }:{
                                        width: '100%',
                                        height: 'auto',
                                        zIndex: 1
                                    }}
                                ></video>
                            </div>
                            <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <Button
                                    onClick={() => {setButton1Active(!button1Active); toggleVideo()}}
                                    style={{
                                        backgroundColor: button1Active ? '#f05650' : '',
                                        transition: 'background-color 0.3s',
                                        color: 'white',
                                        width: '30%'
                                    }}
                                >
                                    video {button1Active ? 'OFF' : 'ON'}
                                </Button>
                                <Button
                                    onClick={() => {setButton2Active(!button2Active); toggleMike()}}
                                    style={{
                                        backgroundColor: button2Active ? '#f05650' : '',
                                        transition: 'background-color 0.3s',
                                        color: 'white',
                                        width: '30%'
                                    }}
                                >
                                    mike {button2Active ? 'OFF' : 'ON'}
                                </Button>
                                <Button
                                    onClick={() => {setButton3Active(!button3Active); toggleAudio()}}
                                    style={{
                                        backgroundColor: button3Active ? '#f05650' : '',
                                        transition: 'background-color 0.3s',
                                        color: 'white',
                                        width: '30%'
                                    }}
                                >
                                    volume {button3Active ? 'OFF' : 'ON'}
                                </Button>
                                <Button
                                    onClick={toggleLang}
                                    style={{
                                        backgroundColor:buttonColor,
                                        transition: 'background-color 0.3s',
                                        color: 'white',
                                        width: '30%'
                                    }}
                                >
                                    {buttonText}
                                </Button>
                                <div
                                    // onMouseOver={() => setShowLanguageMenu(true)}
                                    // onMouseLeave={() => setShowLanguageMenu(false)}
                                >


                                        <div style={{position: 'absolute', backgroundColor: '#fff', border: '1px solid #ccc'}}>
                                            <div onClick={() => Language('Kor')}>Kor</div>
                                            <div onClick={() => Language('Eng')}>Eng</div>
                                            <div onClick={() => Language('Jpn')}>Jpn</div>
                                            <div onClick={() => Language('Chn')}>Chn</div>
                                        </div>

                                </div>
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