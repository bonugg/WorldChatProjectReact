import {useEffect, useState} from "react";
import axios from "axios";
import RequestedListItem from "./RequestedListItem";

const RequestedList= () => {
    const [requetedList, setRequestedList] = useState([]);

    useEffect(() => {
        const getRequestedListAxios = async() => {
            try {
                const response = await axios.get('/friends/requested-list', {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                });
                console.log(response);
                if(response.data && response.data.items) {
                    setRequestedList(() => response.data.items);
                }
            } catch (e) {
                console.log(e);
            }
        }
        getRequestedListAxios();
    }, []);


    return (
        <div>
            <table>
                {requetedList && requetedList.map(list => (
                    <RequestedListItem key={list.id} list={list}></RequestedListItem>
                ))}
            </table>
        </div>
    )
}

export default RequestedList;