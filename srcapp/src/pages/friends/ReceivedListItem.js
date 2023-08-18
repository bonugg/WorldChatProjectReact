import {useCallback} from "react";
import axios from "axios";

const ReceivedListItem = ({list}) => {
    const {id, user, friends, statement} = list;

    const acceptFrd = useCallback((e) => {
        const id = e.target.dataset.id;
        const acceptFrdAxios = async() => {
            try {
                const response = await axios.post('/friends/approve', {id:id},
                    {headers: {
                            Authorization: `Bearer ${localStorage.getItem('Authorization')}`
                        }});
                console.log(response);
            } catch (e) {
                console.log(e);
            }
        }
        acceptFrdAxios();
    },[]);

    const denyRequest = useCallback((e) => {
        const id = e.target.dataset.id;
        const denyRequestAxios = async () => {
            try {
                const response = await axios.post('/friends/decline', {id:id},
                    {headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                        }
                });
                console.log(response);
            } catch (e) {
                console.log(e);
            }
        }
        denyRequestAxios();
    }, []);

    return (
       <tr>
           <td>{id}</td>
           <td>요청한사람: {user.userName}</td>
           <td>{user.userId}</td>
           <td>요청받은사람: {friends.userName}</td>
           <td>{statement}</td>
           <button type="submit" id="accept" data-id={id} onClick={acceptFrd}>수락</button>
           <button type="submit" id="deny" data-id={id} onClick={denyRequest}>거절</button>
       </tr>
    )
}

export default ReceivedListItem;