import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './NotificationModal.css';

const NotificationModal = ({ show, onHide, onAccept, onDecline, message }) => {
    return (
        <Modal className="request-modal" show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>통화 요청</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onAccept}>
                    수락
                </Button>
                <Button variant="secondary" onClick={onDecline}>
                    거절
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default NotificationModal;
