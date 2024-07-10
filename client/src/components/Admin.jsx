import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import moment from 'moment';
import '../styles/Admin.css';
import Header from './HeaderAdmin';

const Admin = () => {
    const [data, setData] = useState([]);
    const [show, setShow] = useState(false);
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
            const res = await axios.get('/getdata', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.data.status === 201) {
                console.log('Data fetched successfully');
                setData(res.data.data);
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

    useEffect(() => {
        getUserData();
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
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Adobo</td>
                                    <td>1</td>
                                    <td>P80</td>
                                </tr>
                                <tr>
                                    <td>Sinigang</td>
                                    <td>3</td>
                                    <td>P180</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='checkoutpos'>
                        <hr className='divider' />
                        <h2>Total Amount: P300.00</h2>
                        <button className='checkout'>Checkout</button>
                    </div>
                </div>

                <div className='items'>
                    <div className='categories'>
                        <button className=''>Savory Meals</button>
                        <button className=''>Snacks</button>
                        <button className=''>Deserts</button>
                        <button className=''>Drinks</button>
                    </div>

                    {show && (
                        <Alert variant='danger' onClose={() => setShow(false)} dismissible>
                            Deleted
                        </Alert>
                    )}

                    <div className='title'>
                        <h1 className='text-center mt-2'>Savory Meals</h1>
                        <Button variant='primary' onClick={handleShow}>
                            Add Item
                        </Button>
                    </div>

                    <div className='card-container'>
                        {data.length > 0 ? (
                            data.map((el, i) => (
                                <Card key={i} style={{ width: '22rem', height: '25rem' }} className='mb-3'>
                                    <Card.Img
                                        variant='top'
                                        src={`/uploads/${el.img}`}
                                        style={{ width: '100px', textAlign: 'center', margin: 'auto' }}
                                        className='mt-2'
                                    />
                                    <Card.Body className='text-center'>
                                        <Card.Title>Name: {el.itemname}</Card.Title>
                                        <Card.Text>Date Added: {moment(el.date).format('DD-MM-YYYY')}</Card.Text>
                                        <Card.Text>Quantity: {el.quantity}</Card.Text>
                                        <Card.Text>Price: ₱{el.price}</Card.Text>
                                        <Button
                                            variant='danger'
                                            onClick={() => dltUser(el.id)}
                                            className='col-lg-6 text-center'
                                        >
                                            Delete
                                        </Button>
                                        <Button variant='danger' className='col-lg-6 text-center'>
                                            Add
                                        </Button>
                                    </Card.Body>
                                </Card>
                            ))
                        ) : (
                            <p>No items found</p>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={modalShow} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name='fname'
                                value={fname}
                                onChange={(e) => setFName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="text"
                                name='quantity'
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="text"
                                name='price'
                                value={price}
                                onChange={(e) => setItemPrice(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Select Your Image</Form.Label>
                            <Form.Control
                                type="file"
                                name='photo'
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" onClick={addUserData}>
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Admin;
