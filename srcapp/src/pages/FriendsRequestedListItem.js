import Button from "@mui/material/Button";
import React, {useCallback, useState} from "react";
import axios from "axios";
import ClearIcon from '@mui/icons-material/Clear';

const RequestedListItem = ({list, onRemove}) => {
    const {id, user, friends, statement} = list;
    const [statements, setStatements] = useState(statement);

    const cancleRequest = useCallback((e) => {
        const id = e.target.dataset.id;
        const cancleRequestAxios = async () => {
            try {
                const response = await axios.post('/friends/decline', {id: id},
                    {
                        headers: {
                            Authorization: `${localStorage.getItem('Authorization')}`
                        }
                    });
                if (response.data && response.data.item) {
                    setStatements('CANCLE');
                    setTimeout(() => onRemove(id), 1000);  // Add this line
                }
            } catch (e) {
            }
        }
        cancleRequestAxios();
    }, [onRemove]);

    return (
        <div
            className={statements === "WAITING" ? "received_item" : "received_item2"}>
            <div className={"request_user"}>{friends.userNickName}</div>
            <div className={`statement`}>
               <span>
                       {statements}
               </span>
            </div>
            <div className={"request_btn_2"}>
                <Button
                    type="submit"
                    data-id={id}
                    endIcon={<ClearIcon />}
                    onClick={cancleRequest}
                    className={"received_btn_2"}
                >
                </Button>
            </div>
        </div>
    )
}

export default RequestedListItem;