
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
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa'; // Import trash icon
import { useRef } from 'react';
import { IoMdExit } from "react-icons/io";

function Header() {
    const [data, setData] = useState([]);
    const [userName, setUserName] = useState('');
    const [openLinks, setOpenLinks] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false); // State for orders modal
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserName(decodedToken.name);
      }
      getUserData();
      getCartData();
      fetchOrders();
    }, []);
  
    const getUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/get-menu-data', {
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
        const res = await axios.get('/cart', {
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
          const response = await axios.get('/my-orders', {
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
  
    const handleCartShow = () => setShowCart(true);
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
          '/update-cart',
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
          '/remove-cart-item',
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
        await axios.delete(`/delete-order/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchOrders(); // Refresh the order list after deletion
      } catch (error) {
        setError(error.response ? error.response.data.message : error.message);
      }
    };
  
    const toggleNavbar = () => {
      setOpenLinks(!openLinks);
    };
  
    getCartData();
    // getUserData();
    // fetchOrders();

  return (
    <>
    <Navbar expand="lg" className="bg-body-tertiary admin-nav">
      <Container>
        <Navbar.Brand href="/">
          <img
            alt="Logo"
            src={Logo1}
            className="d-inline-block align-top logo1"
          />{' '}
          {/* <label id='header-customer-title'>Welcome {userName}!</label> */}
          <label id='header-customer-title'>Welcome back, {userName}!</label>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" id='toggle-nav'/>
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto mt-1">
                <Nav.Link href="#customer-home"> Home </Nav.Link>
                <Nav.Link href="#top-menu"> Top Selling </Nav.Link>
                <Nav.Link href="#customer-menu"> Menu </Nav.Link>
                <Nav.Link onClick={handleCartShow}>My Cart</Nav.Link>
                <Nav.Link onClick={handleOrdersShow}> My Orders </Nav.Link>
            </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    <Modal show={showCart} onHide={handleCartClose} dialogClassName="fullscreen-modal">
        <Modal.Header closeButton>
          <Modal.Title>Cart Items</Modal.Title>
        </Modal.Header>
        <Table>
        <thead>
          <tr>
            <th className='text-center'>Name</th>
            <th className='text-center' style={{ width: '50px' }}>Quantity</th>
            <th className='text-center' >Price</th>
            <th className='text-center' style={{ width: '50px' }}>Actions</th>
          </tr>
        </thead>
        <tbody className='px-2 mx-1'>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <tr key={item.itemId}>
                <td >{item.itemname}</td>
                <td className='text-center'>
                    <div className='d-flex justify-content-between checkOut-container'>
                    <Button variant='outline-primary' className='quantity-button' size='sm' onClick={() => handleIncreaseQuantity(item.itemId)}>+</Button>
                    {item.quantity}
                    <Button variant='outline-primary' className='quantity-button' size='sm' onClick={() => handleDecreaseQuantity(item.itemId)}>-</Button>
                    </div>
                  </td>
                <td className='text-end'>₱{item.price}</td>
                <td>
                  <Button variant='outline-danger' className='text-center' onClick={() => handleRemoveItem(item.itemId)}><FaTrash/></Button>
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
          <Button variant="dark" className='customer-cart' onClick={handleCheckout}>Checkout</Button>
        </Modal.Footer>
      </Modal>

      <Modal dialogClassName="fullscreen-modal"
    size="lg"
    show={showOrders} onHide={handleOrdersClose}
    aria-labelledby="my-orders-modal-title"
>
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
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}> {/* Adjust maxHeight as needed */}
                <Table responsive id='order-table' style={{ fontSize: '0.9em', lineHeight: '1.2' }}> {/* Adjust font size and line height */}
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
                        {orders.map((order, index) => (
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


</>

    
  );
}

export default Header;