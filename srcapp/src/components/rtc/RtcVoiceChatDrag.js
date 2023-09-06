import React, {useState, useEffect} from 'react'
import Draggable from 'react-draggable';
import Button from "@mui/material/Button";
import Logo from "../../img/logo_img.png";
import {Rnd} from "react-rnd";
import "./rtcdrag.css";

function Drag({
                  show,
                  onClose,
                  remoteAudio,
                  localRoom,
                  exitRoom,
                  receiverIsTalking,
                  senderIsTalking,
                  src1,
                  src2,
                  toggleMike,
                  localAudio,
                  toggleRecording,
                  isRecording,
                  isMinimize,
                  voiceMini
              }) {
    // const [isMinimized, setIsMinimized] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    //버튼 토글
    const [button1Active, setButton1Active] = useState(false);
    const [button2Active, setButton2Active] = useState(false);
    const [button3Active, setButton3Active] = useState(false);
    const [recoderButton, setRecoderButton] = useState(false);

    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
        console.log("---------------------------------------");
        console.log(show);
        console.log("---------------------------------------");
        if (!show) {
            setIsClosed(false);
        }
    }, [show]);
    useEffect(() => {
        console.log("))))))))))))))))))))))))))))))))))))");
        console.log(isClosed);
    }, [isClosed]);

    const trackPos = (data) => {
        setPosition({x: data.x, y: data.y});
    };
    const Language = (language) => {
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

    const buttonText = isRecording ? `Translating${'.'.repeat(dotCount)}` : 'recording translation';
    const buttonColor = isRecording ? 'lightcoral' : '';  // 녹음 중일 때 빨간색 배경, 아니면 기본 배경색
    const textColor = isRecording ? 'black' : 'white';

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
                        disabled={!voiceMini}
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
                            background: 'black',
                            visibility: !voiceMini ? "visible" : "hidden",
                            opacity: !voiceMini ? "1" : "0",
                            transition: resizing ? 'none' : 'opacity 0.25s ease-in-out, width 0.25s ease-in-out, height 0.25s ease-in-out'
                        }}
                        dragHandleClassName="headerChat"
                        bounds="window"
                        // bounds="window"
                    >
                        <div
                            className="box"
                            style={{
                                display: !voiceMini ? 'block' : 'none',
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
                                    voice chat

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
                                <div className="localRoom_content one">

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
                                            width: '40%',
                                            minHeight: '60%',
                                            height: '60%',
                                            backgroundImage: `url(${src1})`,
                                            backgroundSize: 'cover',  // cover 값을 설정
                                            backgroundPosition: 'center',  // 이미지를 중앙에 배치
                                            zIndex: 2,  // In front of the audio tag
                                            marginRight: '30px',
                                            borderRadius : '5px'
                                        } : {
                                            width: '40%',
                                            minHeight: '60%',
                                            height: '60%',
                                            backgroundImage: `url(${src1})`,
                                            backgroundSize: 'cover',  // cover 값을 설정
                                            backgroundPosition: 'center',  // 이미지를 중앙에 배치
                                            border: '5px solid green',
                                            zIndex: 2,  // In front of the audio tag
                                            marginRight: '30px',
                                            borderRadius : '5px'
                                        }}
                                    >
                                    </div>

                                    {/* receiverIsTalking div 블록 */}
                                    <div
                                        style={!receiverIsTalking ? {
                                            width: '40%',
                                            height: '60%',
                                            backgroundImage: `url(${src2})`,
                                            backgroundSize: 'cover',  // cover 값을 설정
                                            backgroundPosition: 'center',  // 이미지를 중앙에 배치
                                            zIndex: 2,  // In front of the audio tag
                                            borderRadius : '5px'
                                        } : {
                                            width: '40%',
                                            height: '60%',
                                            backgroundImage: `url(${src2})`,
                                            backgroundSize: 'cover',  // cover 값을 설정
                                            backgroundPosition: 'center',  // 이미지를 중앙에 배치
                                            border: '5px solid green',
                                            zIndex: 2,  // In front of the audio tag
                                            borderRadius : '5px'
                                        }}
                                    >
                                    </div>

                                </div>

                                <div className="button-container">
                                    <Button
                                        onClick={() => {
                                            setButton2Active(!button2Active);
                                            toggleMike()
                                        }}
                                        className={button2Active ? "rtc_btn active" : "rtc_btn"}
                                    >
                                        mike {button2Active ? 'OFF' : 'ON'}
                                    </Button>
                                </div>
                                <div className="button-container">
                                    <Button
                                        onClick={toggleRecording}
                                        className={isRecording ? "rtc_trans_btn one" : "rtc_trans_btn"}
                                    >
                                        {buttonText}
                                    </Button>
                                    <div className={"na_trans"}>
                                        <div className={"na_select"} onClick={() => Language('Kor')}>Kor</div>
                                        <div className={"na_select"} onClick={() => Language('Eng')}>Eng</div>
                                        <div className={"na_select"} onClick={() => Language('Jpn')}>Jpn</div>
                                        <div className={"na_select one"} onClick={() => Language('Chn')}>Chn</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Rnd>
                </>
            )}
        </div>
    );
}

export default Drag;