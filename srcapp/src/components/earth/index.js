import React, {useRef, useState, useEffect} from "react";
import {useFrame, useLoader, useThree} from "@react-three/fiber";
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
import KRMAP from "../../img/flag/KR.png";
import USMAP from "../../img/flag/US.png";
import CAMAP from "../../img/flag/CA.png";
import ITMAP from "../../img/flag/IT.png";
import JPMAP from "../../img/flag/JP.png";
import RUMAP from "../../img/flag/RU.png";
import AUMAP from "../../img/flag/AU.png";
import PHMAP from "../../img/flag/PH.png";
import CNMAP from "../../img/flag/CN.png";

const Earth = React.memo(({
                              mainCamera,
                              mouseLock,
                              LoginZoom,
                              loggedIn,
                              loggedOut,
                              isMapageZoom,
                              isFriendsListZoom,
                              FriendListApiOn,
                              FriendsNationally,
                              isLoginZoom,
                              isSignUpZoom,
                              FrdId,
                              FrdId2
                          }) => {

    const objectGroup = useRef();
    const [KR,US,CA,IT,JP,RU,AU,PH,CN,mypageMap, cloudsMap2, nightMap, colorMap, normalMap, specularMap, cloudsMap, marsMap, sunMap] = useLoader(
        TextureLoader,
        [KRMAP,USMAP,CAMAP,ITMAP,JPMAP,RUMAP,AUMAP,PHMAP,CNMAP,Pluto_MadeMap, CloudsMap, EarthNightMap, EarthDayMap, EarthNormalMap, EarthSpecularMap, EarthCloudsMap, MarsMap, SunMap]
    );
    //클릭 도시 이름 저장 변수

    const [FriendsNationally2, setFriendsNationally2] = useState('');
    const [FriendsNationally3, setFriendsNationally3] = useState('');
    //onMouseDown잠금 상태 변수
    const [isOnMouseDownLock, setIsOnMouseDownLock] = useState(false);
    //onMouseDown잠금 상태 변수
    const [isOnMouseClickLock, setIsOnMouseClickLock] = useState(false);
    //도시 클릭 시 근접 상태 값
    const [isCityZoom, setIsCityZoom] = useState(false);
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

    const nomarRef = useRef();
    const cloudsRefnomar = useRef();

    const countryCoordinates = {
        KR: { lat: 37.541, lng: 126.986 },
        US: { lat: 40.60857, lng: -74.01559 },
        CA: { lat: 45.42153, lng: -75.69719 },
        JP: { lat: 35.652832, lng: 139.839478 },
        CN: { lat: 39.90469, lng: 116.40717 },
        PH: { lat: 14.609053, lng: 121.022256 },
        RU: { lat: 55.755825, lng: 37.617298 },
        TW: { lat: 25.0330, lng: 121.5654 },
        UA: { lat: 50.4501, lng: 30.5234 },
        AU: { lat: -35.2809, lng: 149.1300 },
        IT: { lat: 41.902782, lng: 12.496366 }
    };
    const countryTextures = {
        KR: KR,
        US: US,
        CA: CA,
        IT: IT,
        JP: JP,
        RU: RU,
        AU: AU,
        PH: PH,
        CN: CN
    };
    useEffect(() => {
        if (isCityZoom) {
            isFriendsListZoom(true);
            setFriendsNationally3(FriendsNationally2);
        } else {
            isFriendsListZoom(false);
        }
    }, [isCityZoom]);

    useEffect(() => {
        if (clickedCity) {
            if(FriendsNationally2 != FriendsNationally3){
                FriendListApiOn(true);
                FriendsNationally(FriendsNationally2);
            }else {
                FriendListApiOn(false);
            }
        }else {
            FriendListApiOn(false);
        }
    }, [clickedCity]);

    useEffect(() => {
        if (loggedIn) {
            console.log("실행");
            handleEarthClick();
            if(FrdId2 == 0){
                setZoomIn(false);
            }
        } else {
            removeAllCircles();
        }
    }, [loggedIn, FrdId, FrdId2, isMapageZoom]);


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

    // useRef 추가
    const previousTime = useRef();
    const distanceWithinThresholdTime = useRef(0);


    useFrame(({camera, clock}) => {
        //로그아웃 시 줌 해제
        if (loggedOut) {
            setZoomIn(false);
        }
        //마이페이지 클릭 시 줌 해제
        if (isMapageZoom) {
            AllresetCityColors();
            setClickedCity(null);
            setSelectedCity(null);
            setZoomIn(false);
            setTarget(null);
        }

        if (previousTime.current === undefined) {
            previousTime.current = clock.getElapsedTime();
        }
        const currentTime = clock.getElapsedTime();
        const deltaTime = currentTime - previousTime.current;

        // 카메라 위치 변경
        if (zoomIn && target) {
            if (clickedCity) {
                if (!isCityZoom) {
                    resetCityColors(); // Add this line
                    setIsOnMouseClickLock(true);
                    camera.position.lerp(target, 0.1);
                    camera.lookAt(target);
                    let zoomInDistance = 0.45;
                    let durationThreshold = 1000; // 원하는 시간 설정 (밀리초 단위)
                    setearthR(true);
                    setZoomInLock(true);
                    setIsAtInitialPosition(false);

                    let currentDistance = camera.position.distanceTo(target);
                    console.log(currentDistance);
                    if (currentDistance <= zoomInDistance) {
                        distanceWithinThresholdTime.current += deltaTime * 1000; // ms로 변환

                        if (distanceWithinThresholdTime.current >= durationThreshold) {
                            setIsOnMouseClickLock(false);
                            setIsCityZoom(true);
                            setearthR(true);
                            setZoomInLock(true);
                            distanceWithinThresholdTime.current = 0; // Reset
                        }
                    } else {
                        distanceWithinThresholdTime.current = 0; // Reset
                        setIsCityZoom(false);
                    }
                } else {
                    camera.position.lerp(target, 0.1);
                    camera.lookAt(new THREE.Vector3(0, 0, 3));
                }
            }
        } else {
            isFriendsListZoom(false);
            if (isMapageZoom) {
                setearthR(false);
                setZoomInLock(false);
                setIsAtInitialPosition(true);
            } else {
                setearthR(false);
                setZoomInLock(false);
                if (initialCameraPosition) {
                    if (!isAtInitialPosition) {
                        setearthR(true);
                        setZoomInLock(true);
                        camera.position.lerp(initialCameraPosition, 0.06);
                        camera.lookAt(new THREE.Vector3(0, 0, 3));

                        if (camera.position.distanceTo(initialCameraPosition) < 0.05) {
                            setIsAtInitialPosition(true);
                            setClickedCity(null);
                            setFriendsNationally3('');
                            FriendsNationally('');
                        } else {
                            setIsAtInitialPosition(false);
                            AllresetCityColors();
                        }
                        //로그아웃이 돼서 홈화면으로 돌아가는 중에 login또는 signup클릭 시 실행
                        if (isLoginZoom || isSignUpZoom) {
                            setIsAtInitialPosition(true);
                        }
                    }
                }
            }
        }
        previousTime.current = currentTime;
    });

    return (
        <>
            <ambientLight intensity={1.2}/>
            <pointLight color="white" position={[-200, 50, -100]} intensity={1.2}/>
            <Stars
                radius={100}
                depth={50}
                count={200}
                factor={7}
                saturation={0}
                fade={true}
            />

            <mesh ref={cloudsRefMars} position={[-30, 0, -60]}>
                <sphereGeometry args={[1.21, 47, 47]}/>
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
                <sphereGeometry args={[1.21, 32, 32]}/>
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
                <sphereGeometry args={[1.21, 32, 32]}/>
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
                    color={'rgba(25,25,25,1)'}
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
                <sphereGeometry args={[1.01, 32, 32]}/>
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
                    onPointerMove={onMouseMove}
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
        if (isOnMouseClickLock) return;
        event.stopPropagation();

        const rect = event.nativeEvent.target.getBoundingClientRect();
        mouse.x = ((event.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        console.log(earthRef.current.children);
        console.log('Ray origin (camera space):', raycaster.ray.origin);
        console.log('Ray direction (camera space):', raycaster.ray.direction);
        const intersects = raycaster.intersectObjects(earthRef.current.children, true);
        if (intersects.length > 0) {
            const intersection = intersects[0].point;
            const objectUserData = intersects[0].object.userData;
            if (objectUserData) {
                if (objectUserData.city) {
                    setFriendsNationally2(objectUserData.city);
                    const clickedCityObject = earthRef.current.children.find((child) => child.userData.city === objectUserData.city);
                    //도시를 줌인한 상태에서 다른 도시 클릭 시 실행
                    if (selectedCity != null && clickedCityObject.userData.city != selectedCity.userData.city) {
                        // 클릭한 도시의 위치 저장
                        setClickedCity(clickedCityObject.position.clone());
                        //도시 줌인 카메라 상태 초기화
                        setIsCityZoom(false);
                        setSelectedCity(clickedCityObject);
                        setZoomIn(zoomIn);
                        setTarget(new THREE.Vector3(clickedCityObject.position.x, clickedCityObject.position.y, clickedCityObject.position.z + 3));//도시를 줌인한 상태에서 다른 도시 클릭 시 실행
                    } else {
                        //일단 도시 클릭 시 실행
                        setClickedCity(intersects[0].object.position.clone());
                        setSelectedCity(intersects[0].object);
                        if (!zoomIn) {
                            setInitialCameraPosition(camera.position.clone());
                            //도시 줌인 카메라 상태 초기화
                            setIsCityZoom(false);
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

    function resetCityColors() {
        earthRef.current.children.forEach((child) => {
            if (child.geometry.type === "SphereGeometry" && child !== selectedCity) {
                child.material.color.set("white");
            }
        });
    }

    function AllresetCityColors() {
        earthRef.current.children.forEach((child) => {
            child.material.color.set("white");
        });
    }

    window.addEventListener('resize', () => {
        updateMouseCoordinates();
        onMouseMove();
    });

    function updateMouseCoordinates() {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();

        raycaster.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(event) {
        console.log("1")
        if (isOnMouseDownLock) return;
        event.stopPropagation();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera); // 이 라인을 추가하세요
        const intersects = raycaster.intersectObjects(earthRef.current.children, true);

        let isOverCircle = false;
        const currentOverCities = [];

        if (intersects.length > 0) {
            intersects.forEach((intersect) => {
                if (intersect.object.geometry.type === "SphereGeometry" && !isOnMouseDownLock) {
                    isOverCircle = true;
                    intersect.object.material.color.set("#a62727");
                    currentOverCities.push(intersect.object);
                }
            });
        }
        // 상호작용하지 않은 도시의 색을 처음 색상으로 변경
        earthRef.current.children.forEach((child) => {
            if (child.geometry.type === "SphereGeometry" && !currentOverCities.includes(child) && child !== selectedCity) {
                child.material.color.set("white");
            }
        });

        if (isOverCircle) {
            document.body.style.cursor = "pointer";
        } else {
            document.body.style.cursor = "default";
        }
    }

    function handleEarthClick() {
        const getNationally = async (retry = true) => {

            try {
                const response = await fetch('/friends/nationally-list', {
                    method: 'GET',
                    headers: {
                        Authorization: localStorage.getItem('Authorization'),
                        'userName': localStorage.getItem('userName'),
                    },
                });

                const accessToken = response.headers.get('Authorization');
                if (accessToken != null) {
                    localStorage.setItem('Authorization', accessToken);
                }
                if (response.headers.get('refresh') != null) {
                    return;
                }
                const data = await response.json();
                console.log(data);
                console.log(data.items);
                removeAllCircles();
                if(data && data.items) {
                    data.items.forEach((countryCode) => {
                        const coordinates = countryCoordinates[countryCode];
                        if (coordinates) {
                            addRedCircle(addRedCircleXYZ(coordinates.lat, coordinates.lng), countryCode);
                        } else {
                            console.error(`Coordinates for country code ${countryCode} not found.`);
                        }
                    });
                }else {

                }
            } catch (error) {
                if (retry) {
                    await getNationally(false);
                }
            }
        }
        getNationally();
    }

    function addRedCircle(position, city_name) {
        const mapTexture = countryTextures[city_name];
        // const geometry = new THREE.TorusGeometry(0.017, 0.007, 10, 10);
        const geometry = new THREE.CircleGeometry(0.015, 100);
        // const geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 32);
        // const geometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
        //
        // const geometry = new THREE.PlaneGeometry(0.05, 0.05); // Plane geometry 사용
        // const geometry = new THREE.SphereGeometry(0.01, 32, 32);
        const material = new THREE.MeshBasicMaterial({ map: mapTexture, side: THREE.DoubleSide});

        const circle = new THREE.Mesh(geometry, material);

        const scaleFactor = 1.010; // 기존 위치에서의 바깥 위치 지정
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

});
export default Earth;