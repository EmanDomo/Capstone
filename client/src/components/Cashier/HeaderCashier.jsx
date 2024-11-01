import React, { useState, useEffect } from "react";
import { Container, Nav, Navbar, Modal, Button, Table, Toast, Row, Col } from 'react-bootstrap';
import { MdOutlineLogin } from "react-icons/md";
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Updated import
import Logo1 from "../../Assets/logo.png";
import "../../styles/HeaderCashier.css";
import { IoCartOutline } from "react-icons/io5";


function Header1() {
  const [data, setData] = useState([]);
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  
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
      const res = await axios.get('/getpos', {
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
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrders(response.data.orders);
    } catch (error) {
      const errorMsg = error.response ? error.response.data.message : error.message;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCartShow = () => {
    getCartData();
    setShowCart(true);
  };

  const handleCartClose = () => setShowCart(false);

  const handleOrdersShow = () => {
    setShowOrders(true);
    fetchOrders();
  };

  const handleOrdersClose = () => setShowOrders(false);

  const updateCartItemQuantity = async (itemId, change) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/update-pos',
        { itemId, change },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      getCartData(); // Refetch cart data
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  const handleIncreaseQuantity = (itemId) => {
    updateCartItemQuantity(itemId, 1);
  };

  const handleDecreaseQuantity = (itemId) => {
    updateCartItemQuantity(itemId, -1);
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/remove-pos-item',
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

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/pos-place-order',
        { posItems: cartItems },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        console.log('Order placed successfully');
        setIsToastVisible(true);
        getCartData(); // Clear cart after successful checkout
      } else {
        console.error('Error placing order:', res.data.error);
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
    setShowCart(false);
  };

  return (
    <>
      <Navbar expand="lg" sticky="top" className="bg-body-tertiary admin-nav">
        <Container>
          <Navbar.Brand href="/">
            <img alt="Logo" src={Logo1} className="d-inline-block align-top logo1" />
            <label id='header-admin-title' className='text-white'>Welcome, Cashier!</label>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" id='toggle-nav' />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto mt-1">
              <Nav.Link href="/pos" className='text-white'>POS</Nav.Link>
              <Nav.Link href="/orders" className='text-white'>Orders</Nav.Link>
              <div className="d-flex">
                <Nav.Link onClick={handleCartShow} className='text-white ms-0 d-lg-block fs-4 logout-cashier'><IoCartOutline /></Nav.Link>
                <Nav.Link onClick={handleCartShow} className='text-white ms-2 d-lg-none d-sm-block'>My Cart</Nav.Link>
              </div>
              <div className="d-flex">
                <Nav.Link href="/" className='text-white ms-0 d-lg-block fs-4 logout-cashier'><MdOutlineLogin /></Nav.Link>
                <Nav.Link href="/" className='text-white ms-2 d-lg-none d-sm-block'>Logout</Nav.Link>
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
                    <Button variant='outline-danger' onClick={() => handleRemoveItem(item.itemId)}><FaTrash /></Button>
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
          <Button variant="dark" onClick={handleCheckout} disabled={cartItems.length === 0}>
            Checkout
          </Button>
        </Modal.Footer>
      </Modal>
      
      <div className="position-fixed bottom-0 end-0 p-3">
        <Row>
          <Col xs={12}>
            <Toast onClose={() => setIsToastVisible(false)} show={isToastVisible} delay={3000} autohide>
              <Toast.Header>
                <strong className="me-auto">Order Placed!</strong>
                <small>Just now</small>
              </Toast.Header>
              <Toast.Body className="confirmation-toast-body">
                <p>Order Added Successfully!</p>
              </Toast.Body>
            </Toast>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Header1;
