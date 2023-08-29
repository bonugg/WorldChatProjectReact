import React from 'react';

function Prompt({ message, onConfirm, onCancel }) {
  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      zIndex: 2,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',//반투명한 모달창 배경
    }}>
      <div style={{
        // 중앙에 알림상자와 텍스트,버튼 스타일
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        borderRadius: '5px',
        backgroundColor: 'white',
        width: '300px',
        maxWidth: 'calc(100% - 1rem)',
      }}>
        {/* Drag.js에서 전달받은 message를 표시하는 p태그 "퇴장하시겠습니까" */}
        <p>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
          <button onClick={onConfirm}>확인</button>
          <button onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default Prompt;
