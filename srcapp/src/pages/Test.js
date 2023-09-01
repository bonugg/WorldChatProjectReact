import React, {useEffect, useRef, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import * as THREE from 'three';
import {GoogleLogin} from "@react-oauth/google";
import {GoogleOAuthProvider} from "@react-oauth/google";
import jwtDecode from 'jwt-decode';

const Test = ({count = 5000}) => {
    const clientId = '879795063670-a2a8avf7p2vnlqg9mc526r8ge2h5cgvc.apps.googleusercontent.com'
    const userRef = useRef();
    return (
        <>
            <GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin
                    onSuccess={(res) => {
                        console.log(res);
                        console.log(jwtDecode(res.credential));
                        userRef.current = res.credential;
                        console.log(userRef.current);
                    }}
                    onFailure={(err) => {
                        console.log(err);
                    }}
                />
            </GoogleOAuthProvider>
        </>
    );
};

export default Test;