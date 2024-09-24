import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './HeaderCashier';
import "../../styles/Orders.css";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [groupedOrders, setGroupedOrders] = useState({});
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(response.data);
                setOrders(response.data);
                groupOrdersById(response.data);  // Group orders by orderId
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, [token]);

    // Function to group orders by orderId
    const groupOrdersById = (orders) => {
        const grouped = orders.reduce((acc, order) => {
            if (!acc[order.orderId]) {
                acc[order.orderId] = [];
            }
            acc[order.orderId].push(order);
            return acc;
        }, {});
        setGroupedOrders(grouped);
    };

    const handleCompleteOrder = async (orderId, userId, totalAmount, quantity, userName) => {
        try {
            const response = await axios.post('/complete-order', {
                orderId,
                userId,
                totalAmount,
                userName,
                quantity
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.data.success) {
                setOrders(orders.filter(order => order.orderId !== orderId));
                groupOrdersById(orders.filter(order => order.orderId !== orderId));
                handleShowConfirmationModal();  // Show the confirmation modal
            } else {
                console.error('Failed to complete order:', response.data.error);
            }
        } catch (error) {
            console.error('Error completing order:', error);
        }
    };

    const handleShowConfirmationModal = () => {
        setShowConfirmationModal(true);
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
                groupOrdersById(orders.filter(order => order.orderId !== selectedOrderId));
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
                {Object.keys(groupedOrders).length > 0 ? (
                    <div className="order-list-container"> {/* Added scrollable container */}
                        <Row xs={3} md={4} className="g-4">
                            {Object.entries(groupedOrders).map(([orderId, orderGroup]) => (
                                <Col key={orderId}>
                                    <Card className="order-card">
                                        <Card.Header className="order-card-header">
                                            <strong>Order ID: {orderGroup[0].orderNumber}</strong>
                                        </Card.Header>
                                        <Card.Body>
                                            <Card.Title className="order-card-title">User: {orderGroup[0].userName}</Card.Title>
                                            <div className="order-items-list">
                                                {Object.values(orderGroup.reduce((acc, order) => {
                                                    if (!acc[order.itemname]) {
                                                        acc[order.itemname] = {
                                                            itemname: order.itemname,
                                                            quantity: 0,
                                                            totalPrice: 0
                                                        };
                                                    }
                                                    acc[order.itemname].quantity += order.quantity;
                                                    acc[order.itemname].totalPrice += order.price * order.quantity;
                                                    return acc;
                                                }, {})).map((groupedItem, index) => (
                                                    <div key={index} className="order-item">
                                                        <p><strong>Item:</strong> {groupedItem.itemname} x {groupedItem.quantity}</p>
                                                        <p><strong>Total:</strong> ₱{groupedItem.totalPrice}.00</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="order-actions">
                                                <FaCheck
                                                    className="order-action-icon complete-icon"
                                                    onClick={() => handleCompleteOrder(
                                                        orderGroup[0].orderId,
                                                        orderGroup[0].userId,
                                                        orderGroup.reduce((total, order) => total + order.price * order.quantity, 0),
                                                        orderGroup.reduce((totalQty, order) => totalQty + order.quantity, 0),
                                                        orderGroup[0].userName
                                                    )}
                                                />
                                                <FaTimes
                                                    className="order-action-icon cancel-icon"
                                                    onClick={() => handleShowCancelModal(orderGroup[0].orderId)}
                                                />
                                                {orderGroup[0].qrCodeImage && (
                                                    <FaEye
                                                        className="order-action-icon view-icon"
                                                        onClick={() => handleShowImageModal(orderGroup[0].qrCodeImage)}
                                                    />
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ) : (
                    <p>No orders available.</p>
                )}

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

                {/* Confirmation Modal */}
                <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Order Complete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="confirmation-modal-body">
                        <div className="checkmark-animation">
                            <svg xmlns="http://www.w3.org/2000/svg" className="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                        </div>
                        <p>Order has been successfully completed!</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default Orders;
