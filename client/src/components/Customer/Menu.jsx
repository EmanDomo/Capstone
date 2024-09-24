import Header from "./Header";
import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import '../../styles/Menu.css';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import { ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import Footer from "./Footer";

var heroData = [
    {
      id: 1,
      image: require('../../Assets/bg.jpg')
    },
    {
      id: 2,
      image: require('../../Assets/bg.jpg')
    },
    {
      id: 3,
      image: require('../../Assets/bg.jpg')
    }
  ]

const Menuu = () => {
    const [data, setData] = useState([]);
    const [topSellingItems, setTopSellingItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [addedItemName, setAddedItemName] = useState('');
    const [showCart, setShowCart] = useState(false);
    const navigate = useNavigate();
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showAlreadyInCartModal, setShowAlreadyInCartModal] = useState(false);
    const [alreadyInCartItemName, setAlreadyInCartItemName] = useState('');
  
    useEffect(() => {
      getUserData();
      getTopSellingItems();
      getCartData();
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
  
    const getTopSellingItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/top-selling', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (res.status === 200) {
          setTopSellingItems(res.data.data);
        } else {
          console.log('Error fetching top-selling items');
        }
      } catch (error) {
        console.error('Error fetching top-selling items:', error);
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
  
    const handleAddToCart = async (itemId, itemName) => {
      const quantity = 1;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post(
          '/add-to-cart',
          { itemId, quantity },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
    
        if (res.data.status === 'success') {
          setAddedItemName(itemName);
          setShowConfirmationModal(true); // Show success modal
          getCartData();
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // Item is already in the cart, show "already in cart" modal
          setShowAlreadyInCartModal(true); 
        } else {
          console.error('Error adding item to cart:', error);
        }
      }
    };
    
  
    const handleCloseModal = () => setShowModal(false);
  
    const handleCartShow = () => setShowCart(true);
    const handleCartClose = () => setShowCart(false);
  
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
          {
            itemId,
            change,
          },
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
          {
            itemId,
          },
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
  
    return ( 
        <div>
            <div className="header-customer">
                <Header/>
            </div>
            <div className="customer-main">

            <section id="customer-home" className="block">
                <div className="bg-warning hero-block mx-3 my-3">
                    <Carousel>
                        {heroData.map(hero => (
                            <Carousel.Item key={hero.id}>
                                <img
                                    className="d-block w-100"
                                    src={hero.image}
                                    alt={"slide " + hero.id}
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </div>
            </section>

            <section id="top-menu" className="block">
                <div className="d-flex flex-column mx-3 my-3 customer-top-selling">
                    <h1 className="display-6 text-left my-3">Recommended</h1>
                    <Row xs={1} md={2} lg={4} className="g-4">
                        {topSellingItems.length > 0 ? (
                        topSellingItems.map((item, index) => (
                        <Col key={index}>
                            <Card>
                                    <Card.Img variant="top" src={`/uploads/${item.img}`} alt="Item image" />
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <Card.Title>{item.itemname}</Card.Title>
                                        <Card.Text className="d-flex align-items-center">
                                            <label className="h6 text-danger p-1">₱{item.price}</label>
                                        </Card.Text>
                                        <Button variant="dark" className="customer-add-to-cart" onClick={() => handleAddToCart(item.id, item.itemname)}>
                                            Add to Cart
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        ))
                        ) : (
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Text>No top-selling items available.</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        )}
                    </Row>
                </div>
            </section>

            <section id="customer-menu" className="block">
                <div className="d-flex flex-column mx-3 my-3">
                    <h1 className="display-4 text-center my-3">MENU</h1>
                    <Row xs={2} md={3} lg={4} className="g-4">
                        {data.length > 0 ? (
                            data.map((el, i) => (
                                <Col key={i}>
                                    <Card id="customer-card">
                                        <Card.Img variant="top" src={`/uploads/${el.img}`} className="menu-itm" alt="itm" />
                                        <Card.Body>
                                            <Card.Title>{el.itemname}</Card.Title>
                                            <div className="d-flex justify-content-between p-2">
                                                <Card.Text className="d-flex align-items-center">
                                                    <label className="p-1 customer-price">₱{el.price}</label>
                                                </Card.Text>
                                                <Button variant="dark" className="customer-add-to-cart" onClick={() => handleAddToCart(el.id, el.itemname)}>
                                                    <IoMdAdd />
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col>
                                <Card className="text-center">
                                    <Card.Body>
                                        <Card.Text>No items available in the menu.</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </div>
                <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Order Complete</Modal.Title>
    </Modal.Header>
    <Modal.Body className="confirmation-modal-body">
        <div className="checkmark-animation">
            <svg xmlns="http://www.w3.org/2000/svg" className="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <p>Item Added to Cart!</p>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>
            Close
        </Button>
    </Modal.Footer>
</Modal>
<Modal show={showAlreadyInCartModal} onHide={() => setShowAlreadyInCartModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Item Already in Cart</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="crossmark-animation">
      <svg xmlns="http://www.w3.org/2000/svg" className="crossmark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    <p>{addedItemName} is already in your cart!</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowAlreadyInCartModal(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>

            </section>

                    <div className="customer-menu">

                    </div>
            </div>
            <Footer />
        </div>
     );
}
 
export default Menuu;