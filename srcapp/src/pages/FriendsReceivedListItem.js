import {useCallback, useState} from "react";
import Button from "@mui/material/Button";
import axios from "axios";

const FriendsReceivedListItem = ({list, onRemove}) => {
    const {id, user, friends, statement} = list;
    const [statements, setStatements] = useState('WAITING');
    const [fadeClass, setFadeClass] = useState('');

    const acceptFrd = useCallback((e) => {
        const id = e.target.dataset.id;
        const acceptFrdAxios = async() => {
            try {
                const response = await axios.post('/friends/approve', {id:id},
                    {headers: {
                            Authorization: `Bearer ${localStorage.getItem('Authorization')}`
                        }});
                console.log(response);
                setFadeClass('fade-out');
                setTimeout(() => {
                    setStatements('APPROVED');
                    setFadeClass('');
                }, 500);
                setTimeout(() => onRemove(id), 1000);  // Add this line
            } catch (e) {
                console.log(e);
            }
        }
        acceptFrdAxios();
    },[onRemove]);

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
                setFadeClass('fade-out');
                setTimeout(() => {
                    setStatements('DISAPPROVED');
                    setFadeClass('');
                }, 500);
                setTimeout(() => onRemove(id), 1000);  // Add this line
            } catch (e) {
                console.log(e);
            }
        }
        denyRequestAxios();
    }, [onRemove]);

    return (
       <div className={"received_item"}>
           <div className={"request_user"}>{user.userName}</div>
           <div className={`statement ${fadeClass}`}>{statements}</div>
           <div className={"request_btn"}>
               <Button
                   type="submit"
                   data-id={id}
                   onClick={acceptFrd}
                   className={"received_btn"}
               >
                   Approved
               </Button>
               <Button
                   type="submit"
                   data-id={id}
                   onClick={denyRequest}
                   className={"received_btn_2"}
               >
                   disapproved
               </Button>
           </div>
       </div>
    )
}

export default FriendsReceivedListItem;