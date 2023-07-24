import React, {useRef, useState, useEffect} from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {OrbitControls, Stars} from "@react-three/drei";
import * as THREE from "three";
import EarthDayMap from "../../assets/textures/8k_earth_daymap.jpg";
import EarthNormalMap from "../../assets/textures/8k_earth_normal_map.jpg";
import EarthSpecularMap from "../../assets/textures/8k_earth_specular_map.jpg";
import EarthCloudsMap from "../../assets/textures/8k_earth_clouds.jpg";

import {TextureLoader} from "three";

export function Earth(props) {
    const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(
        TextureLoader,
        [EarthDayMap, EarthNormalMap, EarthSpecularMap, EarthCloudsMap]
    );

    useEffect(() => {
        handleEarthClick();
    }, []);

    const [zoomIn, setZoomIn] = useState(false);
    const [target, setTarget] = useState(null);
    const earthRef = useRef();
    const cloudsRef = useRef();
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const { camera } = useThree(); // 카메라 객체 가져오기
    //지구 회전 코드
    // useFrame(({clock}) => {
    //     const elapsedTime = clock.getElapsedTime();
    //     earthRef.current.rotation.y = elapsedTime / 100;
    //     cloudsRef.current.rotation.y = elapsedTime / 100;
    // });
    return (
        <>
            <ambientLight intensity={1}/>
            <pointLight color="#f6f3ea" position={[2, 0, 5]} intensity={1.2}/>
            <Stars
                radius={300}
                depth={60}
                count={40000}
                factor={7}
                saturation={0}
                fade={true}
            />
            <mesh ref={cloudsRef} position={[0, 0, 3]}>
                <sphereGeometry args={[1.005, 32, 32]}/>
                <meshPhongMaterial
                    map={cloudsMap}
                    opacity={0.4}
                    depthWrite={true}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh
                ref={earthRef}
                position={[0, 0, 3]}
                onPointerDown={onMouseDown}
                onPointerMove={onMouseMove} // 추가
            >
                <sphereGeometry args={[1, 32, 32]}/>
                <meshPhongMaterial specularMap={specularMap}/>
                <meshStandardMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    metalness={0.6}
                    roughness={0.7}
                />
            </mesh>
        </>
    );

    function onMouseDown(event) {
        event.stopPropagation();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(earthRef.current.children, true);

        if (intersects.length > 0) {
            const intersection = intersects[0].point;
            const objectUserData = intersects[0].object.userData;
            if (objectUserData) {
                if (objectUserData.city) {
                    console.log("---------");
                    console.log(objectUserData.city);
                    console.log("---------");
                }
                setZoomIn(!zoomIn);
                setTarget(intersection.clone());
            }
        }
    }

    function onMouseMove(event) {
        event.stopPropagation();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(earthRef.current.children, true);

        let isOverCircle = false;
        if (intersects.length > 0) {
            intersects.forEach((intersect) => {
                if (intersect.object.geometry.type === "TorusGeometry") {
                    isOverCircle = true;
                }
            });
        }

        if (isOverCircle) {
            document.body.style.cursor = "pointer";
        } else {
            document.body.style.cursor = "default";
        }
    }

    function handleEarthClick() {
        // SEOUL //
        const seoul_lat = 37.541;
        const seoul_lng = 126.986;
        // NEWYORK //
        const newyork_lat = 40.60857;
        const newyork_lng = -74.01559;

        addRedCircle(addRedCircleXYZ(seoul_lat, seoul_lng), "서울");
        addRedCircle(addRedCircleXYZ(newyork_lat, newyork_lng), "뉴욕");
    }

    function addRedCircle(position, city_name) {
        const geometry = new THREE.TorusGeometry(0.007, 0.003, 10, 10);
        const material = new THREE.MeshBasicMaterial({ color: 'indianred' });

        const circle = new THREE.Mesh( geometry, material );

        const scaleFactor = 1.007; // 기존 위치에서의 바깥 위치 지정
        circle.position.set(position.x * scaleFactor, position.y * scaleFactor, position.z * scaleFactor);
        circle.lookAt(-position.x, -position.y, -position.z);

        // 이벤트 리스너
        circle.userData = {city: city_name};

        earthRef.current.add(circle);
    }

    function addRedCircleXYZ(positionX, positionY) {
        let phi = (90 - positionX) * (Math.PI / 180);
        let theta = (positionY + 180) * (Math.PI / 180);

        let x = -((1) * Math.sin(phi) * Math.cos(theta));
        let z = ((1) * Math.sin(phi) * Math.sin(theta));
        let y = ((1) * Math.cos(phi));

        return {x,y,z}
    }

}