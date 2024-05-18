import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import { NavLink } from "react-router-dom"
import Card from 'react-bootstrap/Card';
import axios from 'axios';
import moment from "moment"
import Alert from 'react-bootstrap/Alert';
import '../styles/Admin.css';
import Header from "./HeaderAdmin";

const Admin = () => {

    const [data, setData] = useState([]);

    const [show, setShow] = useState(false);

    const getUserData = async () => {
        const res = await axios.get("/getdata", {
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.data.status == 201) {
            console.log("data get");
            setData(res.data.data)

        } else {
            console.log("error")
        }
    }


    const dltUser = async (id) => {
        console.log(id)
        const res = await axios.delete(`/${id}`, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.data.status == 201) {
            getUserData()
            setShow(true)
        } else {
            console.log("error")
        }
    }

    useEffect(() => {
        getUserData()
    }, [])

    return (
        <div>
            <Header />

<div className='bg'>
        <>  <div className='pos'>
                <div className='pos2'>
                <table id="customers">
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
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
                    <tr>
                        <td>Cheese Stick</td>
                        <td>2</td>
                        <td>P40</td>
                    </tr>
                    </table>
                </div>
                <div className='checkoutpos'>
                    <hr />
                    <div>Total Amount: P300</div>
                    <button>Checkout</button>
                </div>
             </div>
           
            <div className="items">
                <div className="categories">
                    <h7>Savory Meals</h7>
                    <h7>Snacks</h7>
                    <h7>Deserts</h7>
                    <h7>Drinks</h7>
                </div>

            {
                show ? <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                    Deleted
                </Alert> : ""
            }


                <div className='title'>
                    <h1 className='text-center mt-2'>Savory Meals</h1>
                    <Button variant="primary"><NavLink to="/additem" className="text-decoration-none text-light"> Add Item</NavLink></Button>
                </div>

                <div className='card-container'>
                    {
                        data.length > 0 ? data.map((el, i) => {
                            return (
                                <>
                                    <Card style={{ width: '22rem', height: "18rem" }} className="mb-3">
                                        <Card.Img variant="top" src={`/uploads/${el.userimg}`} style={{ width: '100px', textAlign: "center", margin: "auto" }} className="mt-2" />
                                        <Card.Body className='text-center'>
                                            <Card.Title>UserName : {el.username}</Card.Title>
                                            <Card.Text>
                                                Date Added : {moment(el.date).format("DD-MM-YYYY")}
                                            </Card.Text>
                                            <Button variant="danger" onClick={() => dltUser(el.id)} className='col-lg-6 text-center'>Delete</Button>
                                        </Card.Body>
                                    </Card>
                                </>
                            )
                        }) : ""
                    }

                </div>
            </div>
        </>
        </div>
        </div>
    )
}

export default Admin