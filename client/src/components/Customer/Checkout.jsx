import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../../styles/Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, grandTotal } = location.state || { cartItems: [], grandTotal: 0 };
  const overallTotal = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);

  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handlePayGcash = async () => {
    try {
      const response = await fetch('/pay-gcash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalAmount: overallTotal }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to get payment link');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleOtherPayment = async () => {
    try {
        const response = await fetch('/pay-others', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ totalAmount: overallTotal }),
        });
        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error('Failed to get payment link');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


  const handleQR = () => {
    setShowQRModal(true);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleCancel = () => {
    setShowQRModal(false);
  };

  const handleComplete = () => {
    // Simply navigate to the Success component
    navigate('/success', {
      state: { cartItems, selectedFile, overallTotal, orderId: location.state.orderId },
    });
  };

  return (
    <div className="containerCheckout">
      <h1 className="titleCheckout">Checkout Page</h1>
      <ul className="itemsCheckout">
        {cartItems.map((item, index) => (
          <li key={index}>
            <span>{item.itemname}</span>
            <span>{item.quantity} x</span>
            <span>₱{item.price}</span>
            <span>₱{item.quantity * item.price}.00</span>
          </li>
        ))}
      </ul>
      <h2>Total: ₱{overallTotal}.00</h2>
      <div className="payment-buttons">
        <form action="/pay" method="post" className="checkout-form">
          <input type="hidden" name="totalAmount" value={overallTotal} />
          <button type="submit" className="paypal-button">Pay with PayPal</button>
        </form>
        <button onClick={handlePayGcash} className="gcash-button">Pay via Gcash</button>
        <button onClick={handleQR} className="other-payment-button">Pay g-cash via QR Code</button>
        <button onClick={handleOtherPayment} className="other-payment-button">Other payment method</button>
      </div>

      <Modal show={showQRModal} onHide={handleCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan QR Code to Pay</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="qr-modal-content">
            <img src="/uploads/qr.jfif" alt="QR Code" className="qr-image" />
            <input type="file" onChange={handleFileChange} className="form-control mt-3" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleComplete}>
            Complete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Checkout;