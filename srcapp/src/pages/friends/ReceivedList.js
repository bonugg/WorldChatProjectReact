import {useEffect, useState} from "react";
import axios from "axios";
import ReceivedListItem from "./ReceivedListItem";



const ReceivedList = () => {
    const [receivedList, setReceivedList] = useState([]);

    useEffect(() => {
        const getReceivedListAxios = async () => {
            try {
                const response = await axios.get('/friends/received-list', {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                });
                console.log(response);
                console.log(response.data.items);
                console.log(response.data.items[0].user);
                console.log(response.data.items[0].user.userName);
                if(response.data && response.data.items) {
                    setReceivedList(() => response.data.items);
                }
            } catch (e) {
                console.log(e);
            }
        }
        getReceivedListAxios();
    },[]);

    return(
        <div>
            <table>
                {receivedList && receivedList.map(r => (
                    <ReceivedListItem key={r.id} list={r}></ReceivedListItem>
                ))}
            </table>
        </div>
    );
}

export default ReceivedList;