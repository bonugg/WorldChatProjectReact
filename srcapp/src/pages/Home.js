import { Link } from 'react-router-dom';
import React, { useEffect, useState} from "react";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Earth } from "../components/earth";
import {OrbitControls} from "@react-three/drei";
import "../pages/Home.css";

const CanvasContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: black;
`;
const Home = () => {

    const [message, setMessage] = useState([]);

    useEffect(() => {
        fetch("/api/v1/hello")
            .then((response) => {
                return response.json();
            })
            .then(function (data) {
                setMessage(data);
            });
    }, []);

    return (
        <div>
            <CanvasContainer>
                {/* <TopSection /> */}
                <Canvas>
                    <Suspense fallback={null}>
                        <OrbitControls
                            enableRotate
                            enablePan={false}
                            enableZoom={true}
                            zoomSpeed={0.6}
                            panSpeed={0.5}
                            minDistance={1.15} // 최소 줌 거리를 원하는 값으로 설정하십시오.
                            maxDistance={4} // 최대 줌 거리를 원하는 값으로 설정하십시오.
                            target={[0, 0, 3]}
                        />
                        <Earth/>
                    </Suspense>
                </Canvas>
            </CanvasContainer>
            {/*<h1>홈</h1>*/}
            {/*<p>가장 먼저 보여지는 페이지입니다.</p>*/}
            {/*<ul>*/}
            {/*    {message.map((text, index) => <li key={`${index}-${text}`}>{text}</li>)}*/}
            {/*</ul>*/}
            {/*<ul>*/}
            {/*    <li>*/}
            {/*        <Link to="/about">소개</Link>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*        <Link to="/profiles/velopert">velopert의 프로필</Link>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*        <Link to="/profiles/gildong">gildong의 프로필</Link>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*        <Link to="/profiles/void">존재하지 않는 프로필</Link>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*        <Link to="/articles">게시글 목록</Link>*/}
            {/*    </li>*/}
            {/*</ul>*/}
        </div>
    );
};

export default Home;