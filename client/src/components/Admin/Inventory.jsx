import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../../styles/Inventory.css';
import Header from './HeaderAdmin';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const Inventory = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      getUserData();
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
          console.log('Data fetched successfully');
          setData(res.data.data);
        } else {
          console.log('Error fetching data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

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
        <h1 id='inventory'>INVENTORY</h1>
        <div className='inventory'>
          <table id='table-inventory'>
            <thead>
              <tr>
                <th className='col1'>Name</th>
                <th className='col2'>Quantity</th>
                <th className='col3'>Price</th>
                <th className='col4'>Date</th>
                <th className='col5'>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((el, i) => (
                <tr key={i}>
                  <td>{el.itemname}</td>
                  <td>{el.quantity}</td>
                  <td>{el.price}</td>
                  <td>{el.date}</td>
                  <td>--</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
            <button id='inv-addproduct' onClick={handleShow}>Add Product</button>
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
}
 
export default Inventory;