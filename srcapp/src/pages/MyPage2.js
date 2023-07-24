// MyPage2.js
import { Navigate, useNavigate } from 'react-router-dom';
import { useTokenVerification } from './tokenVerification';
import {useEffect, useState} from "react";

const MyPage2 = () => {
    const isUserLoggedIn = useTokenVerification();
    const [isLoggedIn, setIsLoggedIn] = useState(undefined);

    useEffect(() => {
        (async () => {
            setIsLoggedIn(await isUserLoggedIn);
        })();
    }, [isUserLoggedIn]);

    useEffect(() => {
        if (typeof isLoggedIn !== "undefined") {
            console.log(isLoggedIn);
        }
    }, [isLoggedIn]);

    if (isLoggedIn === undefined) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace={true} />;
    } else {
        return <div id="profile">마이 페이지2</div>;
    }
};

export default MyPage2;