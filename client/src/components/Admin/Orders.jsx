import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './HeaderAdmin';
import "../../styles/Orders.css";

const Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/orders');
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="order-container">
            <Header />
            <h1 className="order-title">Orders</h1>
            {orders.length > 0 ? (
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
                                <td className="order-cell">{order.price}</td>
                                <th className="order-header-cell">O</th>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="order-no-data">No orders found.</p>
            )}
        </div>
    );
};

export default Orders;
