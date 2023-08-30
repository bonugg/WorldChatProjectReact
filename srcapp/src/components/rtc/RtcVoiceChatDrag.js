import React, {useState, useEffect} from 'react'
import Draggable from 'react-draggable';
import Button from "@mui/material/Button";

function Drag({show, onClose, remoteAudio, localRoom, exitRoom,receiverIsTalking,senderIsTalking,src1,src2,toggleMike,localAudio}) {
    const [position, setPosition] = useState({x: -183, y: -286});
    const [isMinimized, setIsMinimized] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    //버튼 토글
    const [button1Active, setButton1Active] = useState(false);
    const [button2Active, setButton2Active] = useState(false);
    const [button3Active, setButton3Active] = useState(false);

    useEffect(() => {
        if (!show) {
            setIsClosed(false);
        }
    }, [show]);

    const trackPos = (data) => {
        setPosition({x: data.x, y: data.y});
    };
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
                                        width: '30%'
                                    }}
                                >
                                    mike {button2Active ? 'OFF' : 'ON'}
                                </Button>
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