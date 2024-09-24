import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import moment from 'moment';
import '../../styles/POS.css';
import Header from './HeaderCashier';
import { VscTrash } from "react-icons/vsc";

const Admin = () => {
    const [data, setData] = useState([]);
    const [posItems, setPosItems] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [show, setShow] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const [modalShow, setModalShow] = useState(false);

    // State variables for form inputs
    const [fname, setFName] = useState("");
    const [file, setFile] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setItemPrice] = useState("");
    const [category, setCategoryName] = useState("");

    const handleShow = () => setModalShow(true);
    const handleClose = () => setModalShow(false);

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
        const filteredItems = data.filter(item => item.category === category);
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
                setShowConfirmationModal(true); // Show confirmation modal
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
            <div className='bg'>
                <div className='pos'>
                    <h1>Order Summary</h1>
                    <div className='pos2'>
                        <table id='customers'>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Quantity</th>
                                    <th className="pos-remove">Remove</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posItems.length > 0 ? (
                                    posItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.itemname}</td>
                                            <td id="quantity">
                                                <button
                                                    className="pos-qty"
                                                    id="add"
                                                    onClick={() => updatePos(item.itemId, 1)} // Increase quantity
                                                >
                                                    +
                                                </button>
                                                <label id="pos-lbllQuantity">{item.quantity}</label>
                                                <button
                                                    className="pos-qty"
                                                    id="min"
                                                    onClick={() => updatePos(item.itemId, -1)} // Decrease quantity
                                                >
                                                    -
                                                </button>
                                            </td>
                                            <td>
                                                <button id="pos-remove">
                                                    <VscTrash onClick={() => removeFromPOS(item.itemId)} />
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


                        </table>
                    </div>
                    <div className='checkoutpos'>
                        <hr className='divider' />
                        <h2>Total Amount: ₱{calculateTotal().toFixed(2)}</h2>
                        <button className='checkout' onClick={handleCheckout}>
                            Checkout
                        </button>

                    </div>

                </div>

                <div className='items'>
                    <div className="pos-category">
                        <div className="pos-btnCategory">
                            {categories.map((cat, i) => (
                                <button key={i} className="pos-btnCat" onClick={() => handleCategoryClick(cat.category_name)}>
                                    {cat.category_name}
                                </button>
                            ))}
                            <button className="pos-btnCat" onClick={handleShowAll}>Show All</button>
                        </div>
                    </div>

                    {show && (
                        <Alert variant='danger' onClose={() => setShow(false)} dismissible>
                            Deleted
                        </Alert>
                    )}

                    <div className='title'>
                        <h1 className='text-center mt-2'>MENU</h1>
                    </div>

                    <div className='items1'>
                        {filteredData.length > 0 ? (
                            filteredData.map((el, i) => (
                                <div key={i} className='item'>
                                    <img
                                        variant='top'
                                        src={`/uploads/${el.img}`}
                                        className="itm" alt="itm"
                                    />
                                    <div className='text-container'>
                                        <h3>{el.itemname}</h3>
                                        <label>₱{el.price}</label>
                                        <div>
                                            <button
                                                className="btnItem"
                                                onClick={() => addToPOS(el.id, 1, el.price)} // Quantity is 1 for now
                                            >
                                                Add
                                            </button>
                                            <button onClick={() => dltUser(el.id)} className="btnItem">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No items found</p>
                        )}
                    </div>

                </div>
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
        <p>Checkout completed!</p>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>
            Close
        </Button>
    </Modal.Footer>
</Modal>

        </div>
    );
};

export default Admin;
