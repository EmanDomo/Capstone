import Header2 from "./Header";
import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import '../../styles/Menu.css';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Footer from "./Footer";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { host } from '../../apiRoutes';
import Modal from 'react-bootstrap/Modal';

var heroData = [
  {
    id: 1,
    image: require('../../Assets/silog1.jfif')
  },
  {
    id: 2,
    image: require('../../Assets/silog4.jfif')
  },
  {
    id: 3,
    image: require('../../Assets/silog3.jfif')
  }
];

const Menu = () => {
  const [data, setData] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toasts, setToasts] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState('Show All');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getUserData();
    getTopSellingItems();
    getCartData();
    getCategories();
  }, []);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    if (categoryName === 'Show All') {
      setFilteredData(data); // Show all items
    } else {
      // Ensure the category is selected correctly
      handleCategoryClick(categoryName);
    }
  };
  
  const handleCategoryClick = (category) => {
    const filteredItems = data.filter(item => item.category.toLowerCase() === category.toLowerCase());
    setFilteredData(filteredItems);
  };


  const handleShowAll = () => {
    setFilteredData(data);
  };

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
        setFilteredData(res.data.data);
      } else {
        console.log('Error fetching data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getCategories = async () => {
    try {
      const res = await axios.get(`${host}/categories`);
      if (res.data.status === 200) {
        setCategories(res.data.data);
      } else {
        console.log('Error fetching categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getTopSellingItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${host}/top-selling`, {
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

  const handleAddToCart = async (itemId, itemName) => {
    const quantity = 1;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${host}/add-to-cart`, { itemId, quantity }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.data.status === 'success') {
        getCartData(); // Refresh cart data
        const newToast = {
          id: new Date().getTime(), // Unique id based on timestamp
          message: `${itemName} added successfully!`,
        };
        setToasts(prevToasts => [...prevToasts, newToast]);

        // Remove the toast after 3 seconds
        setTimeout(() => {
          setToasts(prevToasts => prevToasts.filter(toast => toast.id !== newToast.id));
        }, 3000);
      } else {
        console.log("Response Status: ", res.data.status);
        console.log("Response Message: ", res.data.message);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };
  

  return (
    <div>
      <Header2 />
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

        <ToastContainer className="position-fixed bottom-0 end-0 p-3 toast-menu" style={{ zIndex: 1 }}>
          {toasts.map(toast => (
            <Toast key={toast.id}>
              <Toast.Header>
                <strong className="me-auto text-success">Added to Cart</strong>
                <small>just now</small>
              </Toast.Header>
              <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
          ))}
        </ToastContainer>


        <section id="top-menu" className="pt-5 block">
          <div className="d-flex flex-column mx-3 my-3 customer-top-selling">
            <h1 className="display-6 text-left my-3">Recommended</h1>
            <Row xs={2} md={3} lg={4} className="g-4">
              {topSellingItems.length > 0 ? (
                topSellingItems.map((item, index) => (
                  <Col key={index}>
                    <Card id="customer-card">
                      <Card.Img variant="top" src={`${host}/uploads/${item.img}`} className="menu-itm" alt="Item image" />
                      <Card.Body>
                        <Card.Title className="item-name">{item.itemname}</Card.Title>
                        <div className="d-flex justify-content-between">
                          <Card.Text className="d-flex align-items-center">
                            <label className="p-1 customer-price">₱{item.price}</label>
                          </Card.Text>
                          <Button variant="dark" className="customer-add-to-cart" onClick={() => handleAddToCart(item.id, item.itemname)} disabled={item.max_meals === 0} >
                                                  <IoMdAdd />
                                              </Button>
                        </div>
                        <div className="text-muted text-center available no-purchase">
                              {item.max_meals > 0 
                                  ? `Available Meals: ${item.max_meals}`
                                  : 'Out of Stock'}
                          </div>
                      <div className="text-muted text-center mb-1 no-purchase">
                        {item.totalQuantity > 0
                          ? `${item.totalQuantity} purchased yesterday` 
                        : 'No purchase yesterday'} 
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

        <section id="customer-menu" className="pt-5 block">
          <div className="d-flex flex-column mx-3 my-3">
            <div className="d-flex w-100% mx-2 my-4 pos-header">
                        <div className="col-7 d-flex justify-content-end">
                            <h1 className="pos-menu-title ">MENU</h1>
                        </div>
                        <div className="col-5 d-flex px-2 py-2 flex-row-reverse">
                        <DropdownButton id="category-dropdown" title={selectedCategory}>
                            <Dropdown.Item onClick={() => { handleCategorySelect('Show All'); handleShowAll(); }} >
                                Show All
                            </Dropdown.Item>
                            {categories.map((cat, i) => (
                                <Dropdown.Item key={i} onClick={() => handleCategorySelect(cat.category_name)} >
                                    {cat.category_name}
                                </Dropdown.Item>
                            ))}
                        </DropdownButton>
                    </div>

                    </div>
                    <Row xs={2} md={3} lg={4} className="g-4">
                      {filteredData.length > 0 ? (
                          filteredData.map((el, i) => (
                              <Col key={i}>
                                  <Card id="customer-card">
                                      <Card.Img variant="top" src={`${host}/uploads/${el.img}`} className="menu-itm" alt="itm" />
                                      <Card.Body>
                                          <Card.Title className="item-name">{el.itemname}</Card.Title>
                                          <div className="d-flex justify-content-between p-2">
                                              <Card.Text className="d-flex align-items-center">
                                                  <label className="p-1 customer-price">₱{el.price}</label>
                                              </Card.Text>
                                              <Button variant="dark" className="customer-add-to-cart" onClick={() => handleAddToCart(el.id, el.itemname)} disabled={el.max_meals === 0} >
                                                  <IoMdAdd />
                                              </Button>
                                          </div>
                                          <div className="text-muted text-center available no-purchase">
                                                    {el.max_meals > 0 
                                                        ? `Available Meals: ${el.max_meals}`
                                                        : 'Out of Stock'}
                                                </div>
                                            <div className="text-muted text-center mb-1 no-purchase">
                                              {el.totalQuantity > 0
                                                ? `${el.totalQuantity} purchased yesterday` 
                                              : 'No purchase yesterday'} 
                                            </div>
                                      </Card.Body>
                                  </Card>
                              </Col>
                          ))
                      ) : (
                          <Col>
                              <Card className="text-center">
                                  <Card.Body>
                                      <Card.Text>No items available in the selected category.</Card.Text>
                                  </Card.Body>
                              </Card>
                          </Col>
                      )}
                  </Row>
                  <Modal show={showModal} onHide={() => setShowModal(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Order has been placed</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>TRY</Modal.Body>
                  <Modal.Footer>
                    {/* <Button variant="dark" className="close-order-confirm" onClick={() => setShowModal(false)}>
                      Close
                    </Button> */}
                  </Modal.Footer>
                </Modal>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Menu;
