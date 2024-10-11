import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './HeaderCashier';
import "../../styles/Orders.css";
import { FaEye } from "react-icons/fa";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [groupedOrders, setGroupedOrders] = useState({});
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrderGroup, setSelectedOrderGroup] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
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
                setOrders(response.data);
                groupOrdersByNumber(response.data);  // Group by orderNumber
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, [token]);

    const groupOrdersByNumber = (orders) => {
        const grouped = orders.reduce((acc, order) => {
            if (!acc[order.orderNumber]) {
                acc[order.orderNumber] = [];
            }
            acc[order.orderNumber].push(order);
            return acc;
        }, {});
        setGroupedOrders(grouped);
    };

    const handleCompleteOrder = async () => {
        try {
            // Get all orderIds for the selected order group (same orderNumber)
            const orderIds = selectedOrderGroup.map(order => order.orderId);
            const userId = selectedOrderGroup[0].userId;
            const totalAmount = selectedOrderGroup.reduce((total, order) => total + order.price * order.quantity, 0);
            const quantity = selectedOrderGroup.reduce((totalQty, order) => totalQty + order.quantity, 0);
            const userName = selectedOrderGroup[0].userName;
    
            const response = await axios.post('/complete-order', {
                orderIds,  // Send all orderIds
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
                // Remove the completed orders from the orders array
                setOrders(orders.filter(order => !orderIds.includes(order.orderId)));
                groupOrdersByNumber(orders.filter(order => !orderIds.includes(order.orderId)));
                handleShowConfirmationModal();  // Show the confirmation modal
                setShowOrderModal(false);
            } else {
                console.error('Failed to complete orders:', response.data.error);
            }
        } catch (error) {
            console.error('Error completing orders:', error);
        }
    };
    const handleCancelOrder = async () => {
        try {
            // Get all orderIds for the selected order group (same orderNumber)
            const orderIds = selectedOrderGroup.map(order => order.orderId);
    
            const response = await axios.post('/cancel-order', {
                orderIds,  // Send all orderIds for cancellation
                reason: cancelReason,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.data.success) {
                // Remove the canceled orders from the orders array
                setOrders(orders.filter(order => !orderIds.includes(order.orderId)));
                groupOrdersByNumber(orders.filter(order => !orderIds.includes(order.orderId)));
                setShowCancelModal(false);
                setCancelReason('');
            } else {
                console.error('Failed to cancel orders:', response.data.error);
            }
        } catch (error) {
            console.error('Error canceling orders:', error);
        }
    };
    
    const handleShowOrderModal = (orderGroup) => {
        setSelectedOrderGroup(orderGroup);
        setShowOrderModal(true);
    };

    const handleCloseOrderModal = () => {
        setShowOrderModal(false);
        setSelectedOrderGroup(null);
    };

    const handleShowCancelModal = (orderId) => {
        setSelectedOrderId(orderId);
        setShowCancelModal(true);
    };

    const handleCloseCancelModal = () => {
        setShowCancelModal(false);
        setCancelReason('');
    };

    const handleShowConfirmationModal = () => {
        setShowConfirmationModal(true);
    };

    return (
        <div>
            <Header />
            <div className="order-container">
                <h1 className="order-title">Orders</h1>
                {Object.keys(groupedOrders).length > 0 ? (
                    <div className="order-list-container">
                        <Row xs={3} md={4} className="g-4">
                            {Object.entries(groupedOrders).map(([orderId, orderGroup]) => (
                                <Col key={orderId}>
                                    <Card className="order-card">
                                        <Card.Header className="order-card-header">
                                            <strong>Order ID: {orderGroup[0].orderNumber}</strong>
                                            <FaEye
                                                className="order-action-icon view-icon"
                                                onClick={() => handleShowOrderModal(orderGroup)}
                                            />
                                        </Card.Header>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ) : (
                    <p>No orders available.</p>
                )}

                {/* Order Modal */}
                {selectedOrderGroup && (
                    <Modal show={showOrderModal} onHide={handleCloseOrderModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Order Summary</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h5>User: {selectedOrderGroup[0].userName}</h5>
                            <div className="order-items-list">
                                {Object.values(selectedOrderGroup.reduce((acc, order) => {
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
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={() => handleShowCancelModal(selectedOrderGroup[0].orderId)}>
                                Cancel Order
                            </Button>
                            <Button variant="success" onClick={handleCompleteOrder}>
                                Complete Order
                            </Button>
                        </Modal.Footer>
                    </Modal>
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
