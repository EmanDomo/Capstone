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
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { host } from '../../apiRoutes';

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
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getUserData();
    getTopSellingItems();
    getCartData();
    getCategories();
  }, []);


  const [selectedCategory, setSelectedCategory] = useState('Show All');

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    if (categoryName === 'Show All') {
      setFilteredData(data); // Show all items
    } else {
      handleCategoryClick(categoryName); // Filter by category
    }
  };


  const handleCategoryClick = (category) => {
    // Compare using category_name from item and selected category, adjusting for case sensitivity.
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
        addToast(`${itemName} Added Successfully!`, 'success');
        getCartData();
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        addToast(`${itemName} is already in the cart!`, 'error');
      } else {
        console.error('Error adding item to cart:', error);
      }
    }
  };

  const addToast = (message, type) => {
    setToasts((prev) => [...prev, { message, type, id: Date.now() }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(toast => toast.id !== id));
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

        <section id="top-menu" className="pt-5 block">
          <div className="d-flex flex-column mx-3 my-3 customer-top-selling">
            <h1 className="display-6 text-left my-3">Recommended</h1>
            <Row xs={2} md={3} lg={4} className="g-4">
              {topSellingItems.length > 0 ? (
                topSellingItems.map((item, index) => (
                  <Col key={index}>
                    <Card id="customer-card">
                      <Card.Img variant="top" src={`/uploads/${item.img}`} className="menu-itm" alt="Item image" />
                      <Card.Body>
                        <Card.Title>{item.itemname}</Card.Title>
                        <div className="d-flex justify-content-between">
                          <Card.Text className="d-flex align-items-center">
                            <label className="p-1 customer-price">₱{item.price}</label>
                          </Card.Text>
                          <Button variant="dark" className="customer-add-to-cart" onClick={() => handleAddToCart(item.id, item.itemname)}>
                            <IoMdAdd />
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

        <section id="customer-menu" className="pt-5 block">
          <div className="d-flex flex-column mx-3 my-3">
            <div className="d-flex w-100% mx-2 my-4 pos-header">
              <div className="col-7 d-flex justify-content-end">
                <h1 className="pos-menu-title ">MENU</h1>
              </div>
              <div className="col-5 d-flex px-2 py-2 flex-row-reverse">
                <DropdownButton id="category-dropdown" title={selectedCategory}>
                  <Dropdown.Item onClick={() => { handleCategorySelect('Show All'); handleShowAll(); }}>
                    Show All
                  </Dropdown.Item>
                  {categories.map((cat, i) => (
                    <Dropdown.Item key={i} onClick={() => handleCategorySelect(cat.category_name)}>
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
                      <Card.Text>No items available in the selected category.</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>

          </div>
        </section>

        <ToastContainer className="position-fixed bottom-0 end-0 p-3 toast-menu" style={{ zIndex: 1 }}>
          {toasts.map((toast) => (
            <Toast key={toast.id} onClose={() => removeToast(toast.id)} delay={3000} autohide>
              <Toast.Header>
                <strong className="me-auto">{toast.type === 'success' ? 'Added in the Cart' : 'Already in the Cart'}</strong>
                <small>just now</small>
              </Toast.Header>
              <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
          ))}
        </ToastContainer>
      </div>
      <Footer />
    </div>
  );
};

export default Menu;