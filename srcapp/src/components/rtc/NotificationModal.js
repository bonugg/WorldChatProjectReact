import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './NotificationModal.css';
import Profile from "../../img/profile.png";
import { useEffect,useContext,useState } from 'react';
import UserListContext from '../../context/UserListContext';

const NotificationModal = ({ show, onHide, onAccept, onDecline, message,sendUserProfile }) => {
    const {userList, setUserList} = useContext(UserListContext);

    //const sendUserProfile = userList.find(u => u.userName === sendUser)?.userProfileName;
    console.log("모달창 유저프로필 이미지" + sendUserProfile);

    const sender = message.split("님이")[0];
    const prefix = message.replace(sender, '');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("모달창 유저프로필 유즈이펙트 이미지" + sendUserProfile);
        setLoading(true);
        
        updateUserList();
       
    },[])

    const updateUserList = async (retry = true) => {
        try {
            // const response = await fetch('/api/v1/user/friendsList', {
            //     method: 'POST',
            //     headers: {
            //         Authorization: localStorage.getItem('Authorization'),
            //         'userName': localStorage.getItem('userName'),
            //     },
            // });
            // const accessToken = response.headers.get('Authorization');
            // if (accessToken != null) {
            //     localStorage.setItem('Authorization', accessToken);
            // }
            // if (response.headers.get('refresh') != null) {
            //     // 이 부분은 로그아웃 로직에 맞게 처리해야 합니다.
            //     // 예: logoutApi3(true);
            //     return;
            // }
            // const data = await response.json();
            // if (data) {
            //     setUserList(data.items);
            // }
            fetch('/webrtc/getFriendsList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: localStorage.getItem('userName')
            }).then(response => response.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setUserList(data);
                    }
                }).catch(error => {
                console.error('Error:', error);
            });
        } catch (error) {
            if (retry) {
                await updateUserList(false);
            }
        }
        setLoading(false);
    }

    return (
        <Modal className="request-modal" show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>통화 요청</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='modal-image-box'>
            {loading ? (
                    // 로딩 중일 때 표시될 내용
                    <span>Loading...</span>
                ) : (
                    <img 
                        src={sendUserProfile ? "https://kr.object.ncloudstorage.com/bitcamp-bukkit-132/userProfile/" + sendUserProfile : Profile} 
                        alt="Profile" 
                        onLoad={() => setLoading(false)}
                    />
                )}
                </div>
                <div>
                <span className="sender">{sender}</span>{prefix}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button className="request-primary" variant="primary" onClick={onAccept}>
                    수락
                </Button>
                <Button className="request-secondary" variant="secondary" onClick={onDecline}>
                    거절
                </Button>
            </Modal.Footer>
        </Modal>
    );
    
}

export default NotificationModal;
