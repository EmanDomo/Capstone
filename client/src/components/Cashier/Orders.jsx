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
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Toast } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { host } from '../../apiRoutes';

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

    const [isToastVisible, setIsToastVisible] = useState(false);

    // Toggle the toast visibility
    const toggleToast = () => setIsToastVisible(prev => !prev);

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            View order
        </Tooltip>
    );

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${host}/orders`, {
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

            const response = await axios.post(`${host}/complete-order`, {
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
                setIsToastVisible(true); // Show confirmation modal
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
        setShowOrderModal(false);
    };

    const handleCloseCancelModal = () => {
        setShowCancelModal(false);
        setCancelReason('');
    };

    const handleShowConfirmationModal = () => {
        setShowConfirmationModal(true);
    };

    const calculateTotal = () => {
        return selectedOrderGroup.reduce((total, order) => total + order.price * order.quantity, 0);
    };

    return (
        <div>
            <Header />
            <div className="ordersd">
                <h1 className="display-6 order-cashier-label">Orders</h1>
                {Object.keys(groupedOrders).length > 0 ? (
                    <div className="order-list-container">
                        <Row xs={2} md={4} lg={6} className="g-4 mb-5 pb-5 px-2">
                            {Object.entries(groupedOrders).map(([orderId, orderGroup]) => (
                                <Col key={orderId}>
                                    <Card className="order-card" onClick={() => handleShowOrderModal(orderGroup)}>
                                        <Card.Header className="order-card-header d-flex justify-content-between text-black">
                                            <strong htmlFor="">Order #</strong>
                                            <OverlayTrigger
                                                placement="bottom"
                                                delay={{ show: 200, hide: 200 }}
                                                overlay={renderTooltip}
                                            >
                                                <div>
                                                    <FaEye
                                                        className="order-action-icon view-icon"
                                                        onClick={() => handleShowOrderModal(orderGroup)}
                                                    />
                                                </div>
                                            </OverlayTrigger>

                                        </Card.Header>
                                        <strong className='text-center p-2 fs-2'> {orderGroup[0].orderNumber}</strong>
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
                    <Modal show={showOrderModal} onHide={handleCloseOrderModal} dialogClassName="fullscreen-modal">
                        <Modal.Header closeButton>
                            <Modal.Title className='modalorder'>Order #: {selectedOrderGroup[0].orderNumber}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className='d-flex justify-content-between'>
                                <div><h5>User:</h5></div>
                                <div><label className='text-secondary'>{selectedOrderGroup[0].userName}</label></div>
                            </div>
                            <div className="order-items-list">
                                <Table>
                                    <thead>
                                        <tr>
                                            <th className='text-center'>Name</th>
                                            <th className='text-center'>Quantity</th>
                                            <th className='text-center'>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
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
                                            <tr key={index}>
                                                <td>{groupedItem.itemname}</td>
                                                <td className='text-center'>{groupedItem.quantity}</td>
                                                <td className='text-center'>₱{groupedItem.totalPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <div className="d-flex justify-content-between">
                                <h6>Total Amount:</h6>
                                <strong className="col-7 d-flex justify-content-end">₱{calculateTotal().toFixed(2)}</strong>
                            </div>
                        </Modal.Body>

                        <Modal.Footer className='d-flex justify-content-between'>
                            <Button variant="dark" onClick={() => handleShowCancelModal(selectedOrderGroup[0].orderId)}>
                                Cancel Order
                            </Button>
                            <Button variant="dark" className='cashier-complete-order' onClick={handleCompleteOrder}>
                                Complete Order
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}

                {/* Cancel Order Modal */}
                <Modal show={showCancelModal} onHide={handleCloseCancelModal} dialogClassName="fullscreen-modal">
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
                <div className="position-fixed bottom-0 end-0 p-3">
                    <Row>
                        <Col xs={12}>
                            <Toast onClose={toggleToast} show={isToastVisible} delay={3000} autohide>
                                <Toast.Header>
                                    <strong className="me-auto text-success">Order Complete</strong>
                                    <small>Just now</small>
                                </Toast.Header>
                                <Toast.Body className="confirmation-toast-body">
                                    <p>Checkout completed!</p>
                                </Toast.Body>
                            </Toast>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default Orders;
