import React, {useRef, useState, useEffect} from "react";
import {useFrame, useLoader, useThree, extend} from "@react-three/fiber";
import {OrbitControls, Stars} from "@react-three/drei";
import * as THREE from "three";
import EarthDayMap from "../../assets/textures/8k_earth_daymap.jpg";
import EarthNightMap from "../../assets/textures/8k_earth_nightmap.jpg";
import EarthNormalMap from "../../assets/textures/8k_earth_normal_map.jpg";
import Pluto_MadeMap from "../../assets/textures/Pluto_Made.webp";
import EarthSpecularMap from "../../assets/textures/8k_earth_specular_map.jpg";
import EarthCloudsMap from "../../assets/textures/8k_earth_clouds.jpg";
import CloudsMap from "../../assets/textures/cloud.jpg";
import {TextureLoader} from "three";
import MarsMap from "../../assets/textures/mars.jpg";
import SunMap from "../../assets/textures/sun.jpg";

export function Earth(props) {
    const mainCamera = props.mainCamera;
    const mouseLock = props.mouseLock;
    const LoginZoom = props.LoginZoom;
    const loggedIn = props.loggedIn;
    const loggedOut = props.loggedOut;
    const isMapageZoom = props.isMapageZoom;
    const objectGroup = useRef();
    const [mypageMap, cloudsMap2, nightMap, colorMap, normalMap, specularMap, cloudsMap, marsMap, sunMap] = useLoader(
        TextureLoader,
        [Pluto_MadeMap, CloudsMap, EarthNightMap, EarthDayMap, EarthNormalMap, EarthSpecularMap, EarthCloudsMap, MarsMap, SunMap]
    );

    //카메라 초기 위치
    const [initialCameraPosition, setInitialCameraPosition] = useState(null);
    //카메라 초기 위치로 돌아갔는지 확인
    const [isAtInitialPosition, setIsAtInitialPosition] = useState(false);
    //마우스 오버와 클릭한 도시의 색상 유지
    const [selectedCity, setSelectedCity] = useState(null);

    const [zoomIn, setZoomIn] = useState(false);
    const [earthR, setearthR] = useState(false);
    const [zoomInLock, setZoomInLock] = useState(false);
    const [target, setTarget] = useState(null);
    //클릭한 도시 초기 위치
    const [clickedCity, setClickedCity] = useState(null);
    const earthRef = useRef();
    const marsRef = useRef();
    const specularRef = useRef();
    const cloudsRefspecular = useRef();
    const sunRef = useRef();
    const cloudsRef = useRef();
    const cloudsRefMars = useRef();
    const cloudsRefSun = useRef();
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const {camera} = useThree(); // 카메라 객체 가져오기
    const {scene} = useThree();
    //원 배열에 담기 (삭제 기능)
    const [circles, setCircles] = useState([]);


    useEffect(() => {
        if (loggedIn) {
            handleEarthClick();
        } else {
            removeAllCircles();
        }
    }, [loggedIn]);


    // 5초 뒤 강제 클릭 이벤트
    // useEffect(() => {
    //     setTimeout(() => {
    //         clickCity("런던");
    //     }, 5000);
    // }, []);

    // 지구 회전 코드
    useFrame(({clock}) => {
        // if (!earthR) {
        const elapsedTime = clock.getElapsedTime();
        sunRef.current.rotation.y = elapsedTime / 20;
        cloudsRefSun.current.rotation.y = elapsedTime / 20;
        marsRef.current.rotation.y = elapsedTime / 20;
        cloudsRefMars.current.rotation.y = elapsedTime / 20;
        specularRef.current.rotation.y = elapsedTime / 20;
        cloudsRefspecular.current.rotation.y = elapsedTime / 20;
        // }
    });

    useFrame(({camera}) => {
        if (selectedCity) {
            if (zoomIn) {
                selectedCity.material.color.set("#cb3434");
            } else if (!zoomIn) {
                selectedCity.material.color.set("indianred");
            }
        }
        //로그아웃 시 줌 해제
        if (loggedOut) {
            setZoomIn(false);
        }
        //마이페이지 클릭 시 줌 해제
        if (isMapageZoom) {
            setClickedCity(null);
            setSelectedCity(null);
            setZoomIn(false);
            setTarget(null);
        }
        // 카메라 위치 변경
        if (zoomIn && target) {
            if (clickedCity) {
                camera.position.lerp(target, 0.05);
                camera.lookAt(target);
                setearthR(true);
                setZoomInLock(true);
                setIsAtInitialPosition(false);
            }
        } else {
            if(isMapageZoom){
                setearthR(false);
                setZoomInLock(false);
                setIsAtInitialPosition(true);
            }else {
                setearthR(false);
                setZoomInLock(false);
                if (initialCameraPosition) {
                    if (!isAtInitialPosition) {
                        setearthR(true);
                        setZoomInLock(true);
                        camera.position.lerp(initialCameraPosition, 0.03);
                        camera.lookAt(new THREE.Vector3(0, 0, 3));
                        if (camera.position.distanceTo(initialCameraPosition) < 0.05) {
                            setIsAtInitialPosition(true);
                        } else {
                            setIsAtInitialPosition(false);
                        }
                    }
                }
            }
        }
    });

    return (
        <>
            <ambientLight intensity={1.2}/>
            <pointLight color="white" position={[-200, 50, -100]} intensity={1.2}/>
            <Stars
                radius={300}
                depth={60}
                count={10000}
                factor={7}
                saturation={0}
                fade={true}
            />



            <mesh ref={cloudsRefMars} position={[-30, 0, -60]}>
                <sphereGeometry args={[1.253, 47, 47]}/>
                <meshPhongMaterial
                    map={cloudsMap2}
                    opacity={0.25}
                    depthWrite={true}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <group position={[-30, 0, -60]}>
                <mesh
                    ref={marsRef}
                >
                    <sphereGeometry args={[1.2, 32, 32]}/>
                    <meshPhongMaterial specularMap={specularMap}/>
                    <meshStandardMaterial
                        map={marsMap}
                        normalMap={normalMap}
                        metalness={0.6}
                        roughness={0.7}
                    />
                </mesh>
            </group>

            <mesh ref={cloudsRefSun} position={[30, 0, -60]}>
                <sphereGeometry args={[1.255, 32, 32]}/>
                <meshPhongMaterial
                    map={cloudsMap2}
                    opacity={0.4}
                    depthWrite={true}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <group ref={objectGroup} position={[30, 0, -60]}>
                <mesh
                    ref={sunRef}
                >
                    <sphereGeometry args={[1.2, 32, 32]}/>
                    <meshPhongMaterial specularMap={specularMap}/>
                    <meshStandardMaterial
                        map={sunMap}
                        normalMap={normalMap}
                        metalness={0.6}
                        roughness={0.7}
                    />
                </mesh>
            </group>

            <mesh ref={cloudsRefspecular} position={[0, -60, -30]}>
                <sphereGeometry args={[1.28, 32, 32]}/>
                <meshPhongMaterial
                    map={cloudsMap2}
                    opacity={0.3}
                    depthWrite={true}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh position={[0, -60, -30]}>
                <torusGeometry args={[1.75, 0.18, 16, 100]}/>
                <meshPhongMaterial
                    map={cloudsMap2}
                    opacity={0.3}
                    depthWrite={true}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh position={[0, -60, -30]}>
                <torusGeometry args={[1.75, 0.1, 16, 100]}/>
                <meshPhongMaterial
                    color={"black"}
                    depthWrite={true}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <group position={[0, -60, -30]}>
                <mesh
                    ref={specularRef}
                >
                    <sphereGeometry args={[1.2, 100, 100]}/>
                    <meshPhongMaterial specularMap={specularMap}/>
                    <meshStandardMaterial
                        map={mypageMap}
                        normalMap={normalMap}
                        metalness={0.6}
                        roughness={0.7}
                    />
                </mesh>
            </group>

            <mesh ref={cloudsRef} position={[0, 0, 3]}>
                <sphereGeometry args={[1.055, 32, 32]}/>
                <meshPhongMaterial
                    map={cloudsMap}
                    opacity={0.4}
                    depthWrite={true}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <group ref={objectGroup} position={[0, 0, 3]}>
                <mesh
                    ref={earthRef}
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
            </group>


            <OrbitControls
                enableRotate={mouseLock ? !mouseLock : !zoomInLock}
                enablePan={false}
                enableZoom={mouseLock ? !mouseLock : !zoomInLock}
                zoomSpeed={0.6}
                panSpeed={0.5}
                minDistance={LoginZoom == 2 ? 2 : isMapageZoom ? 2 : 1.5}
                maxDistance={LoginZoom == 2 ? 5 : isMapageZoom ? 5 : 4}
                target={mainCamera}
            />
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
                    console.log(objectUserData.city);
                    const clickedCityObject = earthRef.current.children.find((child) => child.userData.city === objectUserData.city);
                    //도시를 줌인한 상태에서 다른 도시 클릭 시 실행
                    if (selectedCity != null && clickedCityObject.userData.city != selectedCity.userData.city) {
                        // 클릭한 도시의 위치 저장
                        setClickedCity(clickedCityObject.position.clone());
                        setSelectedCity(clickedCityObject);
                        setZoomIn(zoomIn);
                        setTarget(new THREE.Vector3(clickedCityObject.position.x, clickedCityObject.position.y, clickedCityObject.position.z + 3));//도시를 줌인한 상태에서 다른 도시 클릭 시 실행
                    } else {
                        //일단 도시 클릭 시 실행
                        setClickedCity(intersects[0].object.position.clone());
                        setSelectedCity(intersects[0].object);
                        if (!zoomIn) {
                            setInitialCameraPosition(camera.position.clone());
                        } else {
                            setSelectedCity(null);
                        }
                        setZoomIn(!zoomIn);
                        setTarget(intersection.clone());
                    }
                }
            }
        }
    }

//도시 이름 입력 후 호출 시 클릭이벤트 생성
    function clickCity(cityName) {
        const cityObject = earthRef.current.children.find((child) => child.userData.city === cityName);
        if (cityObject) {
            const cityPosition = cityObject.position.clone();

            setClickedCity(cityPosition);
            setSelectedCity(cityObject);
            if (!zoomIn) {
                setInitialCameraPosition(camera.position.clone());
            } else {
                setSelectedCity(null);
            }
            setZoomIn(!zoomIn);
            setTarget(new THREE.Vector3(cityPosition.x, cityPosition.y, cityPosition.z + 3));

        } else {
            console.error(`City ${cityName} not found.`);
        }
    }

    function onMouseMove(event) {
        event.stopPropagation();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(earthRef.current.children, true);
        intersects.forEach((intersect) => {
            intersect.object.material.color.set("indianred");
        });

        let isOverCircle = false;
        const currentOverCities = [];

        if (intersects.length > 0) {
            intersects.forEach((intersect) => {
                if (intersect.object.geometry.type === "TorusGeometry") {
                    isOverCircle = true;
                    intersect.object.material.color.set("#cb3434");
                    currentOverCities.push(intersect.object);
                }
            });
        }
        // 상호작용하지 않은 도시의 색을 처음 색상으로 변경
        earthRef.current.children.forEach((child) => {
            if (child.geometry.type === "TorusGeometry" && !currentOverCities.includes(child) && child !== selectedCity) {
                child.material.color.set("indianred");
            }
        });

        if (isOverCircle) {
            document.body.style.cursor = "pointer";
        } else {
            document.body.style.cursor = "default";
        }
    }

    function handleEarthClick() {
        // 대한민국 (KR)
        const kr_lat = 37.541;
        const kr_lng = 126.986;
        // 미국 (US)
        const us_lat = 40.60857;
        const us_lng = -74.01559;

        // 캐나다 (CA)
        const ca_lat = 45.42153;
        const ca_lng = -75.69719;

        // 일본 (JP)
        const jp_lat = 35.652832;
        const jp_lng = 139.839478;

        // 중국 (CN)
        const cn_lat = 39.90469;
        const cn_lng = 116.40717;

        // 필리핀 (PH)
        const ph_lat = 14.609053;
        const ph_lng = 121.022256;

        // 러시아 (RU)
        const ru_lat = 55.755825;
        const ru_lng = 37.617298;

        // 대만 (TW)
        const tw_lat = 25.0330;
        const tw_lng = 121.5654;

        // 우크라이나 (UA)
        const ua_lat = 50.4501;
        const ua_lng = 30.5234;

        // 호주 (AU)
        const au_lat = -35.2809;
        const au_lng = 149.1300;

        // 이탈리아 (IT)
        const it_lat = 41.902782;
        const it_lng = 12.496366;

        addRedCircle(addRedCircleXYZ(kr_lat, kr_lng), "KR");
        addRedCircle(addRedCircleXYZ(us_lat, us_lng), "US");
        addRedCircle(addRedCircleXYZ(ca_lat, ca_lng), "CA");
        addRedCircle(addRedCircleXYZ(jp_lat, jp_lng), "JP");
        addRedCircle(addRedCircleXYZ(cn_lat, cn_lng), "CN");
        addRedCircle(addRedCircleXYZ(ph_lat, ph_lng), "PH");
        addRedCircle(addRedCircleXYZ(ru_lat, ru_lng), "RU");
        addRedCircle(addRedCircleXYZ(tw_lat, tw_lng), "TW");
        addRedCircle(addRedCircleXYZ(ua_lat, ua_lng), "UA");
        addRedCircle(addRedCircleXYZ(au_lat, au_lng), "AU");
        addRedCircle(addRedCircleXYZ(it_lat, it_lng), "IT");
    }

    function addRedCircle(position, city_name) {
        const geometry = new THREE.TorusGeometry(0.007, 0.007, 10, 10);
        const material = new THREE.MeshBasicMaterial({color: 'indianred'});

        const circle = new THREE.Mesh(geometry, material);

        const scaleFactor = 1.007; // 기존 위치에서의 바깥 위치 지정
        circle.position.set(position.x * scaleFactor, position.y * scaleFactor, position.z * scaleFactor);
        circle.lookAt(-position.x, -position.y, -position.z);

        // 이벤트 리스너
        circle.userData = {
            city: city_name,
            x: position.x,
            y: position.y,
            z: position.z
        };
        earthRef.current.add(circle);
        setCircles((prevCircles) => [...prevCircles, circle]);
    }

    function removeAllCircles() {
        // earthRef에서 모든 원 객체 제거
        circles.forEach((circle) => {
            earthRef.current.remove(circle);
        });

        // 상태 업데이트하여 원 배열 비우기
        setCircles([]);
    }

    function removeCircle(circle) {
        // 지구에 추가된 원 삭제
        earthRef.current.remove(circle);

        // 상태에서 원 삭제
        setCircles((prevCircles) => prevCircles.filter((c) => c !== circle));
    }

    function addRedCircleXYZ(positionX, positionY) {
        let phi = (90 - positionX) * (Math.PI / 180);
        let theta = (positionY + 180) * (Math.PI / 180);

        let x = -((1) * Math.sin(phi) * Math.cos(theta));
        let z = ((1) * Math.sin(phi) * Math.sin(theta));
        let y = ((1) * Math.cos(phi));

        return {x, y, z}
    }

}