import {Link} from "react-router-dom";

const ChatRoomListItem = ({chatRoom}) => {
    const {id, friends1, friends2, createdAt} = chatRoom;
    return (
        <tr>
            <td>{id}</td>
            <td>로그인 유저{friends1.userName}</td>
            <td>
                <Link to={`/chat/${id}`}>
                    {friends2.userName}
                </Link>
            </td>
            <td>{createdAt}</td>
        </tr>
    )
}

export default ChatRoomListItem;