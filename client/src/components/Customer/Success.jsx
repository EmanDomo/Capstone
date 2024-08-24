import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFile } = location.state || {};

  const [showModal, setShowModal] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage

      // Prepare form data to send
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('qrCodeImage', selectedFile);

      // Send order placement request to the server
      const response = await fetch('/place-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
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
        console.error('Failed to place order:', data.error);
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing the order. Please try again.');
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
