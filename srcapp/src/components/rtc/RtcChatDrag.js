import React, {useState, useEffect} from 'react'
import Button from "@mui/material/Button";
import {Rnd} from "react-rnd";
import Logo from "../../img/logo_img.png";
import "./rtcdrag.css";

function Drag({
                  show,
                  onClose,
                  remoteVideo,
                  localVideo,
                  localRoom,
                  toggleVideo,
                  toggleAudio,
                  toggleMike,
                  exitRoom,
                  toggleRecording,
                  isRecording,
                  lang,
                  isMinimize,
                  rtcMini,
              }) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [selectLang, setSelectLang] = useState("eng");


    //버튼 토글
    const [button1Active, setButton1Active] = useState(false);
    const [button2Active, setButton2Active] = useState(false);
    const [button3Active, setButton3Active] = useState(false);
    const [activeButton, setActiveButton] = useState(null);
    const [changeVideo, setChangeVideo] = useState(true);
    const [dotCount, setDotCount] = useState(0);


    //본욱 추가
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });

            const newPosition = {
                x: (window.innerWidth / 2) - (450 / 2),  //450은 Draggable 컴포넌트의 너비
                y: (window.innerHeight / 2) - (500 / 2), //230은 Draggable 컴포넌트의 높이
            };
            setPosition(newPosition);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    const initialPosition = {
        x: (windowSize.width / 2) - (450 / 2), // 450은 Draggable 컴포넌트의 너비
        y: (windowSize.height / 2) - (500 / 2), // 200은 Draggable 컴포넌트의 높이
    };
    const [position, setPosition] = useState(initialPosition);
    const [size, setSize] = useState({width: "450px", height: "500px"});
    const [resizing, setResizing] = useState(false);
    const handleResizeStart = () => {
        // 사이즈 결정
        setResizing(true);
    };
    const handleResizeStop = (e, direction, ref) => {
        // 사이즈 결정
        setSize({width: ref.style.width, height: ref.style.height});
        setResizing(false); // resizing 상태 업데이트
    };
    //본욱 추가

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
    const Language = (language) => {
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
    const buttonText = isRecording ? `Translating${'.'.repeat(dotCount)}` : 'recording translation';
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
            setActiveButton(null);
            setButton2Active(false);
            setButton1Active(false);
            setButton3Active(false);
            setIsClosed(false);
        }
    }, [show]);

    const trackPos = (data) => {
        setPosition({x: data.x, y: data.y});
    };

    const handleMinimizeClick = () => {
        // setIsMinimized(!isMinimized);
        isMinimize(true);
    };

    const handleCloseClick = () => {
        exitRoom();
        isMinimize(false);
        setIsClosed(true);
        if (onClose) {
            onClose();
        }
    };

    if (!show || isClosed) {
        return null;
    }

    const toggleLang = () => {
        toggleRecording(selectLang);
        // lang(selectLang);
        // console.log("선택된 언어: " + selectLang);
        // setShowLanguageMenu(false);
    }

    return (
        <div className="Drag">
            {!isClosed && (
                <>
                    <Rnd
                        size={size}
                        minWidth={450}
                        minHeight={500}
                        maxWidth={650}
                        maxHeight={650}
                        disabled={!isMinimized}
                        onResizeStop={handleResizeStop}
                        onResizeStart={handleResizeStart}
                        default={{x: position.x, y: position.y}}
                        // onDragStop={(e, d) => {
                        //     dispatch({type: "SET_RANDOMDRAG_POSITION", payload: {x: d.x, y: d.y}});
                        // }}
                        enableResizing={{
                            top: false,
                            right: true,
                            bottom: true,
                            left: false,
                            topRight: true,
                            bottomRight: true,
                            bottomLeft: false,
                            topLeft: false,
                        }}
                        style={{
                            borderRadius: "15px",
                            zIndex: "9999",
                            position: "fixed",
                            visibility: !rtcMini ? "visible" : "hidden",
                            opacity: !rtcMini ? "1" : "0",
                            transition: resizing ? 'none' : 'opacity 0.25s ease-in-out, width 0.25s ease-in-out, height 0.25s ease-in-out'
                        }}
                        dragHandleClassName="headerChat"
                        bounds="window"
                        // bounds="window"
                    >
                        <div
                            className="box"
                            style={{
                                display: !rtcMini ? 'block' : 'none',
                                cursor: 'auto',
                                color: 'black',
                                width: '100%',
                                height: '100%',
                                borderRadius: '15px',
                                borderTopLeftRadius: '15px',
                                borderBottomLeftRadius: '15px',
                                padding: '0px',
                                margin: 'auto',
                                userSelect: 'none',
                                zIndex: '9999',
                            }}
                        >
                            <div className={"headerChat"}>
                                <div className={"btnDiv_create"}>
                                    <img
                                        className={"logo_img"}
                                        src={Logo}
                                    ></img>
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
                            <div className={"content_rtc"}>
                                <div className={"localRoom_text"}>{localRoom}</div>
                                <div className="localRoom_content">
                                    <video
                                        id="remote_video"
                                        ref={remoteVideo}
                                        onClick={() => setChangeVideo(!changeVideo)}
                                        autoPlay playsInline
                                        style={changeVideo ? {
                                            width: '100%',
                                            height: '100%',
                                            zIndex: 1,
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            transition: 'all 0.3s ease-in-out'
                                        } : {
                                            width: '40%',
                                            height: '40%',
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            zIndex: 2,
                                            transition: 'all 0.3s ease-in-out'
                                        }}
                                    ></video>

                                    <video
                                        muted
                                        id="local_video"
                                        ref={localVideo}
                                        onClick={() => {
                                            setChangeVideo(!changeVideo)
                                        }}
                                        autoPlay playsInline
                                        style={changeVideo ? {
                                            width: '40%',
                                            height: '40%',
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            zIndex: 2,
                                            transition: 'all 0.3s ease-in-out'
                                        } : {
                                            bottom: 0,
                                            left: 0,
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            zIndex: 1,
                                            transition: 'all 0.3s ease-in-out'
                                        }}
                                    ></video>
                                </div>
                                <div className="button-container">
                                    <Button
                                        onClick={() => {
                                            setButton1Active(!button1Active);
                                            toggleVideo()
                                        }}
                                        className={button1Active ? "rtc_btn active": "rtc_btn"}
                                    >
                                        video {button1Active ? 'OFF' : 'ON'}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setButton2Active(!button2Active);
                                            toggleMike()
                                        }}
                                        className={button2Active ? "rtc_btn active": "rtc_btn"}
                                    >
                                        mike {button2Active ? 'OFF' : 'ON'}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setButton3Active(!button3Active);
                                            toggleAudio()
                                        }}
                                        className={button3Active ? "rtc_btn active one": "rtc_btn one"}
                                    >
                                        volume {button3Active ? 'OFF' : 'ON'}
                                    </Button>
                                </div>

                                <div className="button-container">
                                    <Button
                                        onClick={toggleLang}
                                        className={isRecording ? "rtc_trans_btn one": "rtc_trans_btn"}
                                    >
                                        {buttonText}
                                    </Button>

                                    <div className={"na_trans"}>
                                        <div className={`na_select ${activeButton === 'Kor' ? 'active' : ''}`}
                                             onClick={() => {
                                                 Language('Kor');
                                                 setActiveButton('Kor');
                                             }}
                                        >Kor</div>
                                        <div className={`na_select ${activeButton === 'Eng' ? 'active' : ''}`}
                                             onClick={() => {
                                                 Language('Eng');
                                                 setActiveButton('Eng');
                                             }}
                                        >Eng</div>
                                        <div className={`na_select ${activeButton === 'Jpn' ? 'active' : ''}`}
                                             onClick={() => {
                                                 Language('Jpn');
                                                 setActiveButton('Jpn');
                                             }}
                                        >Jpn</div>
                                        <div className={`na_select ${activeButton === 'Chn' ? 'active' : ''}`}
                                             onClick={() => {
                                                 Language('Chn');
                                                 setActiveButton('Chn');
                                             }}
                                        >Chn</div>
                                    </div>
                                </div>
                            </div>
                            {/*<Button style={{right:'10%', textAlign:'center'}}>test</Button>*/}
                            {/*<Button style={{left:'10%', top:'5%'}}>test</Button>*/}
                            {/*<div style={{color:'white', fontSize: '22px'}}>x: {position.x.toFixed(0)}, y: {position.y.toFixed(0)}</div>*/}
                        </div>
                    </Rnd>
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