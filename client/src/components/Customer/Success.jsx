import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const Success = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Response data:', data); // Debug response data
      if (data.success) {
        console.log('Order placed successfully');
        setShowModal(true);
        setTimeout(() => {
          navigate('/menu');
        }, 3000); // Redirect after 3 seconds
      } else {
        console.error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <div className="success-container">
      <h1>Payment Successful!</h1>
      <p>Thank you for your payment. Your transaction was successful.</p>
      <Button variant="primary" onClick={handlePlaceOrder}>
        Place Order
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Order has been placed</Modal.Title>
        </Modal.Header>
        <Modal.Body>You will be redirected to the menu shortly.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Success;
