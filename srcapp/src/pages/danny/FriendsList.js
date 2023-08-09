import {useEffect, useState} from "react";
import axios from "axios";
import FriendsListItem from "./FriendsListItem";


const FriendsList = () => {
    const [friendsList, setFriendsList] = useState([]);

    useEffect(() => {
        const getFriendsListAxios = async () => {
            try {
                const response = await axios.get('/friends/friends-list', {
                    headers: {
                        Authorization: `${localStorage.getItem('Authorization')}`
                    }
                })
                console.log(response);
                if(response.data && response.data.items) {
                    setFriendsList(() => response.data.items);
                }
            } catch (e) {
                console.log(e);
            }
        }
        getFriendsListAxios();
    }, []);
    return (
        <div>
            <table>
                {friendsList && friendsList.map(frds => (
                    <FriendsListItem key={frds.id} frds={frds}></FriendsListItem>
                ))}
            </table>
        </div>
    );
};

export default FriendsList;