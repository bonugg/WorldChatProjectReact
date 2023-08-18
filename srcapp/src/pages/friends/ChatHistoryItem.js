const ChatHistoryItem = ({ chats, downloadFile }) => {
    const {sender, message, createdAt, s3DataUrl, fileName, fileDir } = chats;

    return (
        <div>
            <div>{createdAt}<br/>{sender} : {message}</div>
            {s3DataUrl && (
                <div>
                    {fileName.match(/\.(jpg|jpeg|png|gif)$/i)
                        ? <img src={s3DataUrl} width="300" alt="uploaded" />
                        : fileName.match(/\.(mp4|webm|ogg)$/i)
                            ? <video src={s3DataUrl} width="300" controls /> // 동영상 렌더링
                            : <div>{fileName}</div> // 파일 이름 렌더링
                    }
                    <button onClick={() => downloadFile(fileName, fileDir)}>Download</button> {/* 다운로드 버튼 */}
                </div>
            )}
        </div>
    );
};

export default ChatHistoryItem;





