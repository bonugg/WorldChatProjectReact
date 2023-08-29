import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './NotificationDeclineModal.css';

const NotificationModal = ({ show, onHide, message,onDeclineAccept }) => {
    return (
        <Modal className="decline-modal" show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>통화 거절</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onDeclineAccept}>
                    확인
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default NotificationModal;