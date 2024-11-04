import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Logo1 from "../../Assets/logo.png";
import React, { useState, useEffect } from "react";
import "../../styles/Header.css";
import { jwtDecode } from 'jwt-decode';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Table, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { MdOutlineLogin } from "react-icons/md";
import { host } from '../../apiRoutes';

function Header() {
    const [data, setData] = useState([]);
    const [userName, setUserName] = useState('');
    const [userGender, setUserGender] = useState('');
    const [openLinks, setOpenLinks] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserName(decodedToken.name);
            setUserGender(decodedToken.gender);
        }
        getUserData();
        getCartData();
        fetchOrders();
    }, []);

    const getUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${host}/get-menu-data`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.data.status === 201) {
                setData(res.data.data);
            } else {
                console.log('Error fetching data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getCartData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${host}/cart`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.data.status === 'success') {
                setCartItems(res.data.data);
            } else {
                console.log('Error fetching cart data');
            }
        } catch (error) {
            console.error('Error fetching cart data:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${host}/my-orders`, {
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

    const handleCartShow = () => {
        getCartData();
        setShowCart(true);
    }

    const handleCartClose = () => setShowCart(false);

    const handleOrdersShow = () => {
        setShowOrders(true);
        setLoading(true);
        setError(null);
        fetchOrders();
    };

    const handleOrdersClose = () => setShowOrders(false);

    const handleIncreaseQuantity = async (itemId) => {
        await updateCartItemQuantity(itemId, 1);
    };

    const handleDecreaseQuantity = async (itemId) => {
        await updateCartItemQuantity(itemId, -1);
    };

    const handleRemoveItem = async (itemId) => {
        await removeCartItem(itemId);
    };

    const updateCartItemQuantity = async (itemId, change) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${host}/update-cart`,
                { itemId, change },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            getCartData();
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
        }
    };

    const removeCartItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${host}/remove-cart-item`,
                { itemId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            getCartData();
        } catch (error) {
            console.error('Error removing cart item:', error);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout', { state: { cartItems } });
    };

    const deleteOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${host}/delete-order/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchOrders();
        } catch (error) {
            setError(error.response ? error.response.data.message : error.message);
        }
    };

    const toggleNavbar = () => {
        setOpenLinks(!openLinks);
    };

    const handleLogoutShow = () => setShowLogoutConfirm(true);
    const handleLogoutClose = () => setShowLogoutConfirm(false);

    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <>
            <Navbar expand="lg" sticky="top" className="bg-body-tertiary customer-nav">
                <Container>
                    <Navbar.Brand href="/">
                        <div className='d-flex'>
                            <img
                                alt="Logo"
                                src={Logo1}
                                className="d-inline-block align-top logo1"
                            />
                            <label id='header-customer-title' className='name ms-1 text-white'>Welcome Back, </label>
                            <label id='header-customer-title' className='ms-1 text-white'>{userName}</label>
                        </div>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" id='toggle-nav-customer' />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto mt-1">
                            <Nav.Link href="#customer-home" className='text-white'> Home </Nav.Link>
                            <Nav.Link href="#top-menu" className='text-white'> Top Selling </Nav.Link>
                            <Nav.Link href="#customer-menu" className='text-white'> Menu </Nav.Link>
                            <Nav.Link onClick={handleCartShow} className='text-white'>My Cart</Nav.Link>
                            <Nav.Link onClick={handleOrdersShow} className='text-white'> My Orders </Nav.Link>
                            <div className="d-flex">
                                <Nav.Link onClick={handleLogoutShow} className='text-white ms-0 d-lg-block d-sm-block fs-4 logout-customer'> <MdOutlineLogin /> </Nav.Link>
                                <Nav.Link onClick={handleLogoutShow} className='text-white ms-2 d-lg-none d-sm-block'> Logout </Nav.Link>
                            </div>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Modal show={showCart} onHide={handleCartClose} dialogClassName="fullscreen-modal">
                <Modal.Header closeButton>
                    <Modal.Title className='cart-title'>Cart Items</Modal.Title>
                </Modal.Header>
                <Table>
                    <thead>
                        <tr>
                            <th className='text-center'>Name</th>
                            <th className='text-center' style={{ width: '50px' }}>Quantity</th>
                            <th className='text-center'>Price</th>
                            <th className='text-center' style={{ width: '50px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='px-2 mx-1'>
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <tr key={item.itemId}>
                                    <td>{item.itemname}</td>
                                    <td className='text-center'>
                                        <div className='d-flex justify-content-between checkOut-container'>
                                            <Button variant='outline-primary' className='quantity-buttonmin' size='sm' onClick={() => handleDecreaseQuantity(item.itemId)}>-</Button>
                                            <label className='px-1 py-1'>{item.quantity}</label>
                                            <Button variant='outline-primary' className='quantity-buttonadd' size='sm' onClick={() => handleIncreaseQuantity(item.itemId)}>+</Button>
                                        </div>
                                    </td>
                                    <td className='text-center'>₱{item.price}</td>
                                    <td>
                                        <Button variant='outline-danger' className='text-center' onClick={() => handleRemoveItem(item.itemId)}><FaTrash /></Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center">Your cart is empty</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
                <Modal.Footer>
                    <Button variant="dark" className='customer-cart' onClick={handleCheckout} disabled={cartItems.length === 0}>
                        Checkout
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal dialogClassName="fullscreen-modal" size="lg" show={showOrders} onHide={handleOrdersClose} aria-labelledby="my-orders-modal-title">
                <Modal.Header closeButton>
                    <Modal.Title id="my-orders-modal-title">My Orders</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : orders.length === 0 ? (
                        <Alert variant="info">No orders found.</Alert>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <Table responsive id='order-table' style={{ fontSize: '0.9em', lineHeight: '1.2' }}>
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Name</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Cancellation Reason</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.orderId}>
                                            <td className='text-center'>{order.orderNumber}</td>
                                            <td>{order.itemname}</td>
                                            <td className='text-center'>{order.quantity}</td>
                                            <td>₱{order.price}</td>
                                            <td>{order.status}</td>
                                            <td className='text-center'>{order.cancelReason || 'N/A'}</td>
                                            <td className='text-center'>
                                                {order.status === 'completed' || order.status === 'cancelled' ? (
                                                    <Button variant="outline-danger" onClick={() => deleteOrder(order.orderId)}>
                                                        <FaTrash />
                                                    </Button>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={handleOrdersClose}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showLogoutConfirm} onHide={handleLogoutClose} dialogClassName="fullscreen-modal">
                <Modal.Header closeButton>
                    <Modal.Title className='text-danger'>Confirm Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to log out?</Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="dark cancel-logout" onClick={handleLogoutClose}>
                        Cancel
                    </Button>
                    <Button variant="dark confirm-logout" onClick={handleLogoutConfirm}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Header;
