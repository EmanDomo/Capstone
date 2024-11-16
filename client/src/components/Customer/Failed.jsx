import React, { useState, useEffect } from 'react';
import "../../styles/Success.css";
import Button from 'react-bootstrap/Button';
import { TbXboxXFilled } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';

const Success = () => {
  const [showModal, setShowModal] = useState(false);  
  const navigate = useNavigate(); 

  const handleBackClick = () => {
    setShowModal(true); 
  };

  useEffect(() => {
    let timer;
    if (showModal) {
      timer = setTimeout(() => {
        setShowModal(false);  
      }, 3000); 

      const navigateTimer = setTimeout(() => {
        navigate('/menu');
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(navigateTimer);
      };
    }
  }, [showModal, navigate]);

  return (
    <div>
      <div className="mx-2 text-center position-absolute top-50 start-50 translate-middle confirm-header">
        <div className="d-flex justify-content-center confirm-icon">
          <label className="my-5 text-danger"><TbXboxXFilled /></label>
        </div>
        <h1 className="">Payment Unsuccessful!</h1>
        <label>We apologize for the inconvenience.</label>
        <p className='text-secondary mt-3'> Please rest assured that we are working to resolve the issue as quickly as possible.</p>

        <div className="confirm-btn">
          <Button variant="dark" className="my-5 place-order" onClick={handleBackClick}>Back</Button>{' '}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Failed</Modal.Title>
        </Modal.Header>
        <Modal.Body>You will be redirected to the menu shortly.</Modal.Body>
        <Modal.Footer>
          <Button variant="dark" className="close-order-confirm" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Success;
