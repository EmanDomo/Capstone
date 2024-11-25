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
import { Spinner } from 'react-bootstrap'; 
import { GoHome } from "react-icons/go";
import { LuShoppingCart } from "react-icons/lu";
import { IoFastFoodOutline } from "react-icons/io5";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FaRegUser } from "react-icons/fa";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import InputGroup from 'react-bootstrap/InputGroup';

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
    const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('No token found');
                    return;
                }
    
                const response = await axios.get(`${host}/UserDetails`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
    
                if (response.status === 200) {
                    const { name, gender, username, mobile_number, password } = response.data.user;
                    setUserName(name);
                    setUserGender(gender);
                    setFormData((prevState) => ({
                        ...prevState,
                        username: username,
                        name: name,
                        number: mobile_number,
                        password: password,  // Set the password
                    }));
                } else {
                    console.error('Error fetching user details:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };
    
        
    
    

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        password: '',
        confirmPassword: '',
        number: ''
    });
    const handleProfileModalShow = () => setShowProfileModal(true);

    // Function to handle closing the profile modal
    const handleProfileModalClose = () => setShowProfileModal(false);

     function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const update = async () => {
        handleSubmit();
    }

    const handleSubmit = async () => {
        // e.preventDefault();
    
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found');
            return;
        }
    
        try {
            const response = await axios.put(`${host}/updateUserDetails`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (response.status === 200) {
                console.log('User details updated successfully');
                // Close the modal or show a success message
                handleProfileModalClose();
            } else {
                console.error('Error updating user details:', response.data.message);
            }
        } catch (error) {
            console.error('Error updating user details:', error);
        }
    };

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
        fetchUserDetails();
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

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loadingLogout, setLoadingLogout] = useState(false);

    const handleLogout = () => {
        setLoadingLogout(true); 
        setTimeout(() => {
          localStorage.removeItem('token');
          setLoadingLogout(false); 
          navigate('/'); 
        }, 2000); 
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
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-home">Home</Tooltip>}>
                            <Nav.Link href="#customer-home" className='text-white d-lg-block home-customer mx-2'> <GoHome/> </Nav.Link>
                        </OverlayTrigger>
                            <Nav.Link href="#customer-home" className='text-white d-lg-none d-sm-block'> Home </Nav.Link>

                            {/* <Nav.Link href="#top-menu" className='text-white'> Top Selling </Nav.Link> */}
                            {/* <Nav.Link href="#customer-menu" className='text-white'> Menu </Nav.Link> */}
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-home">My Orders</Tooltip>}>
                            <Nav.Link onClick={handleOrdersShow} className='text-white d-lg-block home-customer mx-2'> <IoFastFoodOutline/> </Nav.Link>
                        </OverlayTrigger>
                            <Nav.Link onClick={handleOrdersShow} className='text-white d-lg-none d-sm-block'> Orders </Nav.Link>

                        <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-home">Cart</Tooltip>}>
                            <Nav.Link onClick={handleCartShow} className='text-white d-lg-block home-customer mx-2'><LuShoppingCart/></Nav.Link>
                        </OverlayTrigger>
                            <Nav.Link onClick={handleCartShow} className='text-white d-lg-none d-sm-block'>My Cart</Nav.Link>

                        <OverlayTrigger  placement="bottom" overlay={<Tooltip id="tooltip-home">Profile</Tooltip>}>
                            <Nav.Link onClick={handleProfileModalShow} className='text-white d-lg-block home-customer mx-2'><FaRegUser/></Nav.Link>
                        </OverlayTrigger>
                            <Nav.Link onClick={handleProfileModalShow} className='text-white d-lg-none d-sm-block'>My Profile</Nav.Link>

                            <div className="d-flex">
                                <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-home">Log Out</Tooltip>}>
                                    <Nav.Link onClick={() => setShowLogoutModal(true)} className='text-white ms-0 d-lg-block home-customer mx-2'><MdOutlineLogin /></Nav.Link>
                                </OverlayTrigger>
                                <Nav.Link onClick={() => setShowLogoutModal(true)} className='text-white d-lg-none d-sm-block'>Logout</Nav.Link>
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

            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} dialogClassName="fullscreen-modal">
        <Modal.Header closeButton>
          <Modal.Title className='text-danger'>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
  {loadingLogout ? (
    <Button variant="dark" disabled>
      <Spinner animation="border" size="sm" />
      Logging out...
    </Button>
  ) : (
    <>
      <Button variant="dark cancel-logout" onClick={() => setShowLogoutModal(false)}>
        Cancel
      </Button>
      <Button variant="dark confirm-logout" onClick={handleLogout}>
        Yes
      </Button>
    </>
  )}
</Modal.Footer>
</Modal>
      <Modal show={showProfileModal} onHide={handleProfileModalClose} fullscreen="sm-down">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col xs={12}>
                                <Form.Group controlId="formUsername">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter username"
                                        className='mb-2 inputheader'
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group controlId="formName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className='mb-2 inputheader'
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                <div className='d-flex'>

                                
                                    <Form.Control
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className='mb-2 inputheader'
                                        required
                                    />
                                    <InputGroup.Text
                                        className="login-body-icon"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <FaRegEyeSlash className="fs-5 inputheaderp" /> : <FaRegEye className="fs-5 inputheaderp" />}
                                    </InputGroup.Text>
                                    </div>
                                    {/* <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        className='mb-2'
                                        required
                                    /> */}
                                </Form.Group>
                            </Col>

                            <Col xs={12}>
                                <Form.Group controlId="formNumber">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        className='mb-2 inputheader'
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                <div className="d-flex justify-content-end updatehead">
                        <Button variant="dark" onClick={update} className="updateheader">
                            Save Changes
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Header;
