import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './NotificationDeclineModal.css';

const NotificationModal = ({ show, onHide, message,onDeclineAccept }) => {

    const receiver = message.split("님이")[0];
    const prefix = message.replace(receiver, '');

    return (
        <Modal className="decline-modal" show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>통화 거절</Modal.Title>
            </Modal.Header>
            <Modal.Body><span className="receiver">{receiver}</span>{prefix}</Modal.Body>
            <Modal.Footer>
            <Button className="decline-primary" variant="secondary" onClick={onDeclineAccept}>
                    확인
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default NotificationModal;