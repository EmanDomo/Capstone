import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Admin/HeaderAdmin';
import "../../styles/Orders.css";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, [token]);

    const handleCompleteOrder = async (orderId, userId, totalAmount) => {
        try {
            const response = await axios.post('/complete-order', {
                orderId,
                userId,
                totalAmount
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setOrders(orders.filter(order => order.orderId !== orderId));
            } else {
                console.error('Failed to complete order:', response.data.error);
            }
        } catch (error) {
            console.error('Error completing order:', error);
        }
    };

    const handleCancelOrder = async () => {
        try {
            const response = await axios.post('/cancel-order', {
                orderId: selectedOrderId,
                reason: cancelReason,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setOrders(orders.filter(order => order.orderId !== selectedOrderId));
                setShowCancelModal(false);
                setCancelReason('');
            } else {
                console.error('Failed to cancel order:', response.data.error);
            }
        } catch (error) {
            console.error('Error canceling order:', error);
        }
    };

    const handleShowCancelModal = (orderId) => {
        setSelectedOrderId(orderId);
        setShowCancelModal(true);
    };

    const handleCloseCancelModal = () => {
        setShowCancelModal(false);
        setCancelReason('');
    };

    const handleShowImageModal = (imagePath) => {
        setSelectedImage(`/uploads/${imagePath}`);
        setShowImageModal(true);
    };

    const handleCloseImageModal = () => {
        setShowImageModal(false);
        setSelectedImage('');
    };

    return (
        <div>
            <Header />
            <div className="order-container">
                <h1 className="order-title">Orders</h1>
                {orders.length > 0 ? (
                    <>
                        <table className="order-table">
                            <thead>
                                <tr className="order-header">
                                    <th className="order-header-cell">Order ID</th>
                                    <th className="order-header-cell">Username</th>
                                    <th className="order-header-cell">Item Name</th>
                                    <th className="order-header-cell">Quantity</th>
                                    <th className="order-header-cell">Price</th>
                                    <th className="order-header-cell">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.orderId} className="order-row">
                                        <td className="order-cell">{order.orderNumber}</td>
                                        <td className="order-cell">{order.username}</td>
                                        <td className="order-cell">{order.itemname}</td>
                                        <td className="order-cell">{order.quantity}</td>
                                        <td className="order-cell">₱{order.price * order.quantity}.00</td>
                                        <td className="order-cell">
                                            <FaCheck
                                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                                onClick={() => handleCompleteOrder(order.orderId, order.userId, order.price * order.quantity)}
                                            />
                                            <FaTimes
                                                style={{ cursor: 'pointer', color: 'red', marginRight: '10px' }}
                                                onClick={() => handleShowCancelModal(order.orderId)}
                                            />
                                            <FaEye
                                                style={{ cursor: 'pointer', color: 'blue' }}
                                                onClick={() => handleShowImageModal(order.qrCodeImage)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Cancel Order Modal */}
                        <Modal show={showCancelModal} onHide={handleCloseCancelModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Cancel Order</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>Why is this order being canceled?</p>
                                <textarea
                                    className="form-control"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    rows="4"
                                    placeholder="Enter reason here"
                                />
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseCancelModal}>
                                    Close
                                </Button>
                                <Button variant="danger" onClick={handleCancelOrder}>
                                    Cancel Order
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        {/* Image Modal */}
                        <Modal show={showImageModal} onHide={handleCloseImageModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Order QR Code</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <img src={selectedImage} alt="Order QR Code" style={{ width: '100%' }} />
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseImageModal}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </>
                ) : (
                    <p>No orders available.</p>
                )}
            </div>
        </div>
    );
};

export default Orders;
