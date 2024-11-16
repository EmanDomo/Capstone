import "../../styles/Success.css";
import Button from 'react-bootstrap/Button';
import { FaRegCircleCheck } from "react-icons/fa6";
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { host } from '../../apiRoutes';

const Confirm = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFile } = location.state || {};
  const [showModal, setShowModal] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId'); 

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('qrCodeImage', selectedFile);

      const response = await fetch(`${host}/place-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Response data:', data); 
      if (data.success) {
        console.log('Order placed successfully');
        setShowModal(true);
        setTimeout(() => {
          navigate('/menu');
        }, 3000); 
      } else {
        console.error('Failed to place order:', data.error);
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing the order. Please try again.');
    }
  };

  return (
    <div>
      <div className="mx-2 text-center position-absolute top-50 start-50 translate-middle confirm-header">
        <div className="d-flex justify-content-center confirm-icon">
          <label className="my-5"><FaRegCircleCheck /></label>
        </div>
        <h1 className="">Payment Successful!</h1>
        <label>Thank you for your payment. Your transaction was successful.</label>

        <div className="confirm-btn">
          <Button variant="dark" className="my-5 place-order" onClick={handlePlaceOrder}>Place Order</Button>{' '}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Order has been placed</Modal.Title>
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
}

export default Confirm;