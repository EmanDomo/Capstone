import Table from 'react-bootstrap/Table';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../../styles/Checkout.css';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { host } from '../../apiRoutes';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems } = location.state || { cartItems: [] };
    const overallTotal = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);

    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Select Payment Method');

    const handlePayGcash = async () => {
        try {
            const response = await fetch(`${host}/pay-gcash`, {
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
            const response = await fetch(`${host}/pay-others`, {
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
        navigate(`${host}/success`, {
            state: { cartItems, selectedFile, overallTotal, orderId: location.state.orderId },
        });
    };

    const handleSelectPaymentMethod = (method) => {
        setPaymentMethod(method);
    };

    const handleCheckout = () => {
        if (paymentMethod === 'G-Cash') {
            handlePayGcash();
        } else if (paymentMethod === 'Other payment method') {
            handleOtherPayment();
        } else if (paymentMethod === 'QR Code') {
            handleQR();
        } else {
            alert('Please select a valid payment method.');
        }
    };

    return (
        <div>
            <div className="mx-1 text-center position-absolute top-50 start-50 translate-middle checkout-container">
                <div className="text-center checkout-header">
                    <h1>Checkout</h1>
                </div>
                <div className="mx-2 my-2 customer-checkout-table">
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.itemname}</td>
                                    <td>{item.quantity}</td>
                                    <td>₱{item.price}</td>
                                    <td>₱{item.quantity * item.price}.00</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <div className='mx-2 my-2 checkout-summary-customer'>
                    <div className='d-flex justify-content-between mx-2 my-2 total-amount-checkout'>
                        <h6 className='p-2'>Total:</h6>
                        <label className='p-2'>₱{overallTotal}.00</label>
                    </div>

                    <div className="d-flex justify-content-between mx-2 my-2 payment-option">
                        <div className="p-1 text-wrap paymentopt-label">
                            <label className='text-wrap'>Payment Option:</label>
                        </div>
                        <div className="paymentopt-drop">
                            <DropdownButton id="payment-option-button" title={paymentMethod}>
                                <Dropdown.Item onClick={() => handleSelectPaymentMethod('G-Cash')} className="gcash-button">G-Cash</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSelectPaymentMethod('Paypal')} className="paypal-button">Paypal</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSelectPaymentMethod('QR Code')} className="qr-button">QR Code</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSelectPaymentMethod('Other payment method')} className="other-payment-button">Other payment method</Dropdown.Item>
                            </DropdownButton>
                        </div>
                    </div>

                </div>
                <div className="d-flex justify-content-between mx-2 mt-4 mb-3 checkout-buttons">
                    <Button variant="dark" onClick={() => navigate('/menu')}>Cancel</Button>
                    <Button variant="dark" id='customer-checkout-button' onClick={handleCheckout} disabled={paymentMethod === 'Select Payment Method'}>
                        Checkout
                    </Button>
                </div>
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
}

export default Checkout;
