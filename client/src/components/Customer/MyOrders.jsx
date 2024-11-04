import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Container, Alert } from 'react-bootstrap';
import { host } from '../../apiRoutes';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token'); // Assumes token is stored in localStorage
                const response = await axios.get(`${host}/api/my-orders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setOrders(response.data.orders);
            } catch (error) {
                setError(error.response ? error.response.data.message : error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <Container>
            <h1>My Orders</h1>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : orders.length === 0 ? (
                <Alert variant="info">No orders found.</Alert>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Order Number</th>
                            <th>Item ID</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.orderId}>
                                <td>{order.orderNumber}</td>
                                <td>{order.id}</td>
                                <td>{order.quantity}</td>
                                <td>{order.price}</td>
                                <td>{order.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default MyOrders;
