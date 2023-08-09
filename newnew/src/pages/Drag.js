import React, {useState,useEffect} from 'react'
import Draggable from 'react-draggable';

function Drag({show,onClose}) {
  const [position, setPosition] = useState({ x: -183, y: -286 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsClosed(false);
    }
  }, [show]);

  const trackPos = (data) => {
    setPosition({ x: data.x, y: data.y });
  };

  const handleMinimizeClick = () => {
    setIsMinimized(!isMinimized);
  };

  const handleCloseClick = () => {
    setIsClosed(true);
    if(onClose){
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
                minHeight: isMinimized ? '45px' : '100px',
                minWidth: isMinimized ? '30px' : '150px',
                left: isMinimized ? '50%' : 'auto',
                marginLeft: isMinimized ? '-15px' : 'auto',
                bottom: isMinimized ? '30px' : 'auto',
                position: isMinimized ? 'absolute' : 'static',
                display: isMinimized ? 'none' : 'block',
                position: 'absolute',
                left: '50%',
                top: '50%',
                cursor: 'move',
                color: 'black',
                width: '320px',
                height: '510px',
                borderRadius: '5px',
                padding: '1em',
                margin: 'auto',
                userSelect: 'none',
                background: 'rgb(50, 50, 50,0.8)'
                
              }}
            >
              <button
                onClick={handleMinimizeClick}
                style={{ position: 'absolute', top: '5px', right: '30px' }}
              >
                -
              </button>
              <button
                onClick={handleCloseClick}
                style={{ position: 'absolute', top: '5px', right: '5px' }}
              >
                x
              </button>
              <br />
              {/* 밑으로 컨텐츠 들어갈 부분*/}
              <div style={{textAlign: 'center', color: 'white', fontSize: '20px'}}>랜덤채팅</div>
              <div style={{color:'white', fontSize: '22px'}}>x: {position.x.toFixed(0)}, y: {position.y.toFixed(0)}</div>
            </div>
          </Draggable>
          {isMinimized && (
            <button 
              onClick={handleMinimizeClick}
              style={{
                position: 'fixed',
                left: '50%',
                bottom: '30px',
                transform: 'translateX(-50%)',
              }}
            >
              +
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default Drag;