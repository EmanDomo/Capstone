import React, { useEffect, useState } from 'react';
import "../../styles/POS.css"; 
import Header from "./HeaderCashier";
import Footer from "../Customer/Footer";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import moment from 'moment';
import { VscTrash} from "react-icons/vsc";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { IoMdAdd } from "react-icons/io";
import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { Toast} from 'react-bootstrap';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { host } from '../../apiRoutes';

const POS = () => {
    const [data, setData] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [posItems, setPosItems] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [show, setShow] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [isOutOfStockToastVisible, setIsOutOfStockToastVisible] = useState(false);
    const [isInsufficientStockToastVisible, setIsInsufficientStockToastVisible] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [isToastVisible, setIsToastVisible] = useState(false);
    const toggleToast = () => setIsToastVisible(prev => !prev);
    const [fname, setFName] = useState("");
    const [file, setFile] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setItemPrice] = useState("");
    const handleShow = () => setModalShow(true);
    const handleClose = () => setModalShow(false);
    const toggleInsufficientStockToast = () => setIsInsufficientStockToastVisible(prev => !prev);
    const toggleOutOfStockToast = () => setIsOutOfStockToastVisible(prev => !prev);

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

    const dltUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${host}/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.data.status === 201) {
                getUserData();
                setShow(true);
            } else {
                console.error('Failed to delete item');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const addUserData = async (e) => {
        e.preventDefault();

        var formData = new FormData();
        formData.append("photo", file);
        formData.append("fname", fname);
        formData.append("quantity", quantity);
        formData.append("price", price);

        const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }

        const res = await axios.post(`${host}/addItem`, formData, config);

        if (res.data.status === 201) {
            handleClose();
            getUserData(); // Refresh data
        } else {
            console.log("error");
        }
    }

    const addToPOS = async (itemId, quantity, price, itemName) => {
        try {
            const token = localStorage.getItem('token');
            const existingItem = posItems.find(item => item.itemId === itemId);
    
            if (existingItem) {
                await updatePos(itemId, quantity);
                addToast(`${itemName} added successfully!`, 'success');
            } else {
                const token = localStorage.getItem('token');
                const res = await axios.post(
                    `${host}/add-to-pos`,
                    { itemId, quantity, price },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    }    
                );
    
                if (res.data.status === 'success') {
                    addToast(`${itemName} added successfully!`, 'success');
                    getPosItems();
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                addToast(`${itemName} is already in the cart!`, 'error');
            } else {
                console.error('Error adding item to POS:', error);
            }
        }
    };

    const getPosItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${host}/getpos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (res.data.status === 'success') {
                setPosItems(res.data.data);
            } else {
                console.log('Error fetching POS items');
            }
        } catch (error) {
            console.error('Error fetching POS items:', error);
        }
    };

    const removeFromPOS = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${host}/remove-pos-item`,
                { itemId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (res.data.status === 'success') {
                console.log('Item removed from POS');
                getPosItems();  
            } else {
                console.error('Error removing item from POS:', res.data.message);
            }
        } catch (error) {
            console.error('Error removing item from POS:', error);
        }
    };

    const updatePos = async (itemId, change) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${host}/update-pos`,
                { itemId, change },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (res.data.status === 'success') {
                console.log('Item quantity updated');
                getPosItems(); 
            } else {
                console.error('Error updating item quantity:', res.data.message);
            }
        } catch (error) {
            console.error('Error updating item quantity:', error);
        }
    };

    const calculateTotal = () => {
        return posItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleCheckout = async () => {
        const insufficientStockItems = posItems.filter(item => item.quantity > item.max_meals);
    
        if (insufficientStockItems.length > 0) {
            setIsInsufficientStockToastVisible(true);
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${host}/pos-place-order`,
                { posItems },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
        
            if (res.data.success) {
                console.log('Order placed successfully');
                setPosItems([]); 
                setIsToastVisible(true); 
            } else {
                console.error('Error placing order:', res.data.error);
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setIsInsufficientStockToastVisible(true);
                console.error('Insufficient stock for some items.');
            } else {
                console.error('Error placing order:', error);
            }
        }
    };

    useEffect(() => {
        getUserData();
        getCategories();
        getPosItems();
    }, []);
    
    const getCategories = async () => {
        try {
            const res = await axios.get(`${host}/categories`);
            if (res.data.status === 200) {
                setCategories(res.data.data); 
                console.log('Categories:', res.data.data); 
            } else {
                console.log('Error fetching categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    getPosItems();

    const addToast = (message, type) => {
        setToasts((prev) => [...prev, { message, type, id: Date.now() }]);
      };
    
      const removeToast = (id) => {
        setToasts((prev) => prev.filter(toast => toast.id !== id));
      };

      const [selectedCategory, setSelectedCategory] = useState('Show All');

      const handleCategorySelect = (categoryName) => {
        console.log('Category Selected:', categoryName);
        setSelectedCategory(categoryName);
    
        if (categoryName === 'Show All') {
            setFilteredData(data);
        } else {
            handleCategoryClick(categoryName);
        }
    };
    const handleCategoryClick = (category) => {
        console.log('Category Selected:', category);
        console.log('Data:', data);
    
        const selectedCategory = category.trim().toLowerCase();

        const filteredItems = data.filter(item => {
            const itemCategory = item.category ? item.category.trim().toLowerCase() : '';
            console.log('Item Category:', itemCategory);  
    
            return itemCategory === selectedCategory;
        });
    
        console.log('Filtered Items:', filteredItems);
        setFilteredData(filteredItems);
    };
    
      const handleShowAll = () => {
        setFilteredData(data);
      };

    return ( 
        <div>
            <Header />
            <div className="container-fluid posd">
                <div className="row">
                    <div className='col-12 col-lg-4 col-md-3 d-lg-block orders-sum-pos d-sm-none '>
                        <div className="mx-2 my-2">
                            <h3 className="text-center">Order Summary</h3>
                        </div>
                        <div className="order-summary pos-table-container">
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th className="text-center">Name</th>
                                        <th className="text-center">Quantity</th>
                                        <th className="pos-remove">Remove</th>
                                        <th className="text-center">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posItems.length > 0 ? (
                                        posItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.itemname}</td>
                                                <td id="quantity" className="text-center">
                                                    <ButtonGroup className="pos-btng">
                                                        <Button className="pos-add" onClick={() => updatePos(item.itemId, 1)}>+</Button>
                                                        <label id="pos-quantity" className="px-2 py-1 pe-3">{item.quantity}</label>
                                                        <Button className="pos-minus" onClick={() => updatePos(item.itemId, -1)}>-</Button>
                                                    </ButtonGroup>
                                                </td>
                                                <td>
                                                    <button id="pos-remove" onClick={() => removeFromPOS(item.itemId)}>
                                                        <VscTrash />
                                                    </button>
                                                </td>
                                                <td>₱{item.price}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">No items in POS</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                        <div className="mt-4 px-2 py-2 order-summary-total">
                            <div className="d-flex">
                                <h5>Total Amount:</h5>
                                <label className="col-7 d-flex justify-content-end">₱{calculateTotal().toFixed(2)}</label>
                            </div>
                    
                            <div className="mt-2 d-flex flex-row-reverse cashier-checkout">
                            <Button variant='dark' id="cashier-checkout-button" onClick={handleCheckout}>
                                Checkout
                            </Button>
                            </div>
                        </div>
                    </div>
                    <div className='col-12 col-lg-8 col-md-12 col-sm-12 pos-main'>
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
                    <div className="mx-2 pos-content">
                        <Row xs={2} md={3} lg={3} xl={4} className="gy-4">
                            {filteredData.length > 0 ? (
                                filteredData.map((el, i) => (
                                    <Col key={i}>
                                        <Card id="cashier-card">
                                            <div className="cashier-img">
                                                <Card.Img variant="top" src={`${host}/uploads/${el.img}`} className="cashier-itm" alt="itm" />
                                            </div>
                                            <Card.Body>
                                                <Card.Title className="item-name">{el.itemname}</Card.Title>
                                                <div className="d-flex justify-content-between p-2">
                                                    <Card.Text className="d-flex align-items-center">
                                                        <label className="p-1 cashier-price">₱{el.price}</label>
                                                    </Card.Text>
                                                    <Button 
                                                variant="dark" 
                                                className="cashier-add-to-cart" 
                                                onClick={() => addToPOS(el.id, 1, el.price, el.itemname)} // Pass itemname instead of max_meals
                                                disabled={el.max_meals === 0} // Disable if out of stock
                                            >
                                                <IoMdAdd />
                                            </Button>

                                                </div>
                                                {/* Display available stock/meals */}
                                                <div className="text-muted text-center my-1 available">
                                                    {el.max_meals > 0 
                                                        ? `Available Meals: ${el.max_meals}`
                                                        : 'Out of Stock'}
                                                </div>
                                                <div className="text-muted text-center mb-1 no-purchase">
                                                   {el.totalQuantity > 0
                                                    ? `${el.totalQuantity} purchased yesterday` 
                                                    : ''} 
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
                    </div>
                </div>               
            </div>
            <div className="position-fixed bottom-0 end-0 p-3">
            <Row>
                <Col xs={12}>
                <Toast onClose={toggleToast} show={isToastVisible} delay={3000} autohide>
                    <Toast.Header>
                    <strong className="me-auto order-add">Order Added!</strong>
                    <small>Just now</small>
                    </Toast.Header>
                    <Toast.Body className="confirmation-toast-body">
                    <p>Proceed to My Orders to complete your order/s!</p>
                    </Toast.Body>
                </Toast>
                <Toast onClose={toggleOutOfStockToast} show={isOutOfStockToastVisible} delay={3000} autohide>
                <Toast.Header>
                    <strong className="me-auto">Out of Stock</strong>
                    <small>Just now</small>
                </Toast.Header>
                <Toast.Body className="out-of-stock-toast-body">
                    <p>This item is out of stock and cannot be added to the cart.</p>
                </Toast.Body>
            </Toast>

            <Toast onClose={toggleInsufficientStockToast} show={isInsufficientStockToastVisible} delay={3000} autohide>
                <Toast.Header>
                    <strong className="me-auto">Insufficient Stock</strong>
                    <small>Just now</small>
                </Toast.Header>
                <Toast.Body className="insufficient-stock-toast-body">
                    <p>Some items in your cart exceed available stock and cannot be checked out.</p>
                </Toast.Body>
            </Toast>
                </Col>
            </Row>
            </div>
            <ToastContainer className="position-fixed bottom-0 end-0 p-3 toast-menu" style={{ zIndex: 1 }}>
                {toasts.map((toast) => (
                    <Toast key={toast.id} onClose={() => removeToast(toast.id)} delay={3000} autohide>
                    <Toast.Header>
                    <strong className={`me-auto ${toast.type === 'success' ? 'text-success' : 'text-danger'}`}>
                        {toast.type === 'success' ? 'Added in the Cart' : 'Already in the Cart'}
                        </strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>{toast.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </div>
     );
}
 
export default POS;