import {useCallback} from "react";
import axios from "axios";


const Accept = () => {
    const accept = useCallback((e) => {
        const acceptAxios = async() => {
            try {
                const response = await axios.post('/friends/approve', {},
                    {headers: {
                            Authorization: `${localStorage.getItem('Authorization')}`
                        }});
                console.log(response);
            } catch (e) {
                console.log(e);
            }
        }
        acceptAxios();
    },[]);
    return (
        <button type="submit" id="acceptBtn" onClick={accept} >수락</button>
    );
};

export default Accept;