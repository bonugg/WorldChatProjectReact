import React, {useCallback, useState} from "react";
import Button from "@mui/material/Button";
import axios from "axios";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const FriendsReceivedListItem = ({list, onRemove}) => {
    const {id, user, friends, statement} = list;
    const [statements, setStatements] = useState('WAITING');

    const acceptFrd = useCallback((e) => {
        const acceptFrdAxios = async () => {
            try {
                const response = await axios.post('/friends/approve', {id: id},
                    {
                        headers: {
                            Authorization: `${localStorage.getItem('Authorization')}`
                        }
                    });
                if (response.data.item.msg == 'request approved') {
                    setStatements('APPROVED');
                    setTimeout(() => onRemove(id), 1000);  // Add this line
                }
            } catch (e) {
            }
        }
        acceptFrdAxios();
    }, [onRemove]);

    const denyRequest = useCallback((e) => {
        const denyRequestAxios = async () => {
            try {
                const response = await axios.post('/friends/decline', {id: id},
                    {
                        headers: {
                            Authorization: `${localStorage.getItem('Authorization')}`
                        }
                    });
                if (response.data.item.msg == 'request denied') {
                    setStatements('DECLINE');
                    setTimeout(() => onRemove(id), 1000);  // Add this line
                }
            } catch (e) {
            }
        }
        denyRequestAxios();
    }, [onRemove]);

    return (
        <div
            className={statements === "APPROVED" ? "received_item3" : statements === "DECLINE" ? "received_item2" : "received_item"}>
            <div className={"request_user"}>{user.userNickName}</div>
            <div className={`statement`}>
               <span>
                       {statements}
               </span>
            </div>
            <div className={"request_btn"}>
                <Button
                    type="submit"
                    endIcon={<CheckIcon />}
                    onClick={acceptFrd}
                    className={"received_btn"}
                >
                </Button>
                <Button
                    type="submit"
                    endIcon={<ClearIcon />}
                    onClick={denyRequest}
                    className={"received_btn_2"}
                >
                </Button>
            </div>
        </div>
    )
}

export default FriendsReceivedListItem;