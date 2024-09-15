import React, { useState, useEffect } from "react";
import "../../styles/Header.css";
import Logo from "../../Assets/logo.png";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { CiShoppingCart } from "react-icons/ci";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { jwtDecode } from 'jwt-decode';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ListGroup, Table, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa'; // Import trash icon

const Header = () => {
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
      const res = await axios.get('/getdata', {
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
  getUserData();
  fetchOrders();
  
  return (
    <>
      <div className="navbar">
        <div className="leftSide" id={openLinks ? "open" : "close"}>
          <div className="app-logo">
            <img src={Logo} className="logo" alt="logo" />
            <h4 id="user-header">Welcome Back, {userName}!</h4>
          </div>
          <div className="hiddenLinks">
            <Link to="/"> Home </Link>
            <Link to="/Menu"> Menu </Link>
            <Link to="/Order"> Order </Link>
          </div>
        </div>
        <div className="rightSide">
          <Link to="/"> Home </Link>
          <Link to="/Menu"> Menu </Link>
          <Link onClick={handleCartShow}><CiShoppingCart /></Link>
          <Link onClick={handleOrdersShow}> My Orders </Link>
          <Link to="/Admin" className="user"><HiOutlineUserCircle /></Link>
          <button onClick={toggleNavbar}>
            <GiHamburgerMenu />
          </button>
        </div>
      </div>

      <Modal show={showCart} onHide={handleCartClose}>
        <Modal.Header closeButton>
          <Modal.Title>Cart Items</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cartItems.length > 0 ? (
            <div className="cartTable">
              <div className="cartTableHeader">
                <div className="headerCell">Name</div>
                <div className="headerCell">Quantity</div>
                <div className="headerCell">Price</div>
                <div className="headerCell">Actions</div>
              </div>
              {cartItems.map((item) => (
                <div className="cartTableRow" key={item.itemId}>
                  <div className="cell">{item.itemname}</div>
                  <div className="cell">{item.quantity}</div>
                  <div className="cell">₱{item.price}</div>
                  <div className="cell actions">
                    <Button variant='outline-primary' size='sm' onClick={() => handleIncreaseQuantity(item.itemId)}>+</Button>
                    <Button variant='outline-primary' size='sm' onClick={() => handleDecreaseQuantity(item.itemId)}>-</Button>
                    <Button variant='outline-danger' size='sm' onClick={() => handleRemoveItem(item.itemId)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Your cart is empty</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCartClose}>Close</Button>
          <Button variant='primary' onClick={handleCheckout}>Checkout</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showOrders} onHide={handleOrdersClose}>
        <Modal.Header closeButton>
          <Modal.Title>My Orders</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Cancellation Reason</th>
                  <th>Actions</th> {/* Add Actions column */}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.orderId}>
                    <td>{order.orderNumber}</td>
                    <td>{order.itemname}</td>
                    <td>{order.quantity}</td>
                    <td>₱{order.price}</td>
                    <td>{order.status}</td>
                    <td>{order.cancelReason || 'N/A'}</td>
                    <td>
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
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleOrdersClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Header;
