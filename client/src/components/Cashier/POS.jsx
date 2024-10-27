import "../../styles/POS.css"; 
import Header from "./HeaderCashier";
import Footer from "../Customer/Footer";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import React, { useEffect, useState } from 'react';
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

const POStry = () => {
    const [data, setData] = useState([]);
    const [posItems, setPosItems] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [show, setShow] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const [modalShow, setModalShow] = useState(false);
 

    const [isToastVisible, setIsToastVisible] = useState(false);

    // Toggle the toast visibility
    const toggleToast = () => setIsToastVisible(prev => !prev);

    // State variables for form inputs
    const [fname, setFName] = useState("");
    const [file, setFile] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setItemPrice] = useState("");
    const [category, setCategoryName] = useState("");

    const handleShow = () => setModalShow(true);
    const handleClose = () => setModalShow(false);

    const [selectedCategory, setSelectedCategory] = useState('Show All');

    const handleCategorySelect = (categoryName) => {
        setSelectedCategory(categoryName);
        handleCategoryClick(categoryName); // Call your existing function
    };

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
            const res = await axios.get('/categories');
            if (res.data.status === 200) {
                setCategories(res.data.data);
            } else {
                console.log('Error fetching categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const dltUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`/${id}`, {
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

        const res = await axios.post("/addItem", formData, config);

        if (res.data.status === 201) {
            handleClose();
            getUserData(); // Refresh data
        } else {
            console.log("error");
        }
    }

    const addToPOS = async (itemId, quantity, price) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                '/add-to-pos',
                { itemId, quantity, price },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (res.data.status === 'success') {
                console.log('Item added to POS');
                getPosItems();
            } else {
                console.error('Error adding item to POS:', res.data.message);
            }
        } catch (error) {
            console.error('Error adding item to POS:', error);
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

    const getPosItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/getpos', {
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
                '/remove-pos-item',
                { itemId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (res.data.status === 'success') {
                console.log('Item removed from POS');
                getPosItems();  // Refresh POS items after removal
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
                '/update-pos',
                { itemId, change },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (res.data.status === 'success') {
                console.log('Item quantity updated');
                getPosItems();  // Refresh POS items after updating
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
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                '/pos-place-order',
                { posItems },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
    
            if (res.data.success) {
                console.log('Order placed successfully');
                setPosItems([]); // Clear POS items after successful order placement
                setIsToastVisible(true); // Show confirmation modal
            } else {
                console.error('Error placing order:', res.data.error);
            }
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };
    

    // Call getPosItems when component mounts or data changes
    useEffect(() => {
        getUserData();
        getCategories();
        getPosItems();
    }, []);


    return ( 
        <div>
            <Header />
            <div className="d-flex">
                <div className="w-25 mx-2 my-2 pos-cart">
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
                                                    <label id="pos-quantity" className="px-2 py-1">{item.quantity}</label>
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

                <div className="w-75 mx-2 my-2 pos-container">
                    <div className="d-flex w-100% mx-2 my-4 pos-header">
                        <div className="col-7 d-flex justify-content-end">
                            <h1>MENU</h1>
                        </div>
                        <div className="col-5 d-flex px-2 py-2 flex-row-reverse">
                        <DropdownButton id="category-dropdown" title={selectedCategory}>
                            <Dropdown.Item onClick={() => {handleCategorySelect('Show All'); handleShowAll();}}>Show All</Dropdown.Item>
                            {categories.map((cat, i) => (
                                <Dropdown.Item key={i} onClick={() => handleCategoryClick(cat.category_name)}>
                                    {cat.category_name}
                                </Dropdown.Item>
                            ))}
                        </DropdownButton>
                        </div>
                    </div>
                            <div className="mx-2 pos-content">
                            <Row xs={2} md={3} lg={4} className="g-4 mx-2">
                                {filteredData.length > 0 ? (
                                    filteredData.map((el, i) => (
                                        <Col key={i}>
                                            <Card id="cashier-card">
                                                <div className="cashier-img">
                                                    <Card.Img variant="top" src={`/uploads/${el.img}`} className="cashier-itm" alt="itm" />
                                                </div>
                                                <Card.Body>
                                                    <Card.Title>{el.itemname}</Card.Title>
                                                    <div className="d-flex justify-content-between p-2">
                                                        <Card.Text className="d-flex align-items-center">
                                                            <label className="p-1 cashier-price">₱{el.price}</label>
                                                        </Card.Text>
                                                        <Button variant="dark" className="cashier-add-to-cart" onClick={() => addToPOS(el.id, 1, el.price)}>
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
                </div>
            </div>
            {/* <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Order Complete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="confirmation-modal-body">
                    <div className="checkmark-animation">
                        <svg xmlns="http://www.w3.org/2000/svg" className="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p>Checkout completed!</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal> */}

        <div className="position-fixed bottom-0 end-0 p-3">
            <Row>
                <Col xs={12}>
                <Toast onClose={toggleToast} show={isToastVisible} delay={3000} autohide>
                    <Toast.Header>
                    <strong className="me-auto">Order Added to Cart</strong>
                    <small>Just now</small>
                    </Toast.Header>
                    <Toast.Body className="confirmation-toast-body">
                    <p>Item/s added to cart successfully!</p>
                    </Toast.Body>
                </Toast>
                </Col>
            </Row>
            </div>
        </div> 
    );
}
 
export default POStry;