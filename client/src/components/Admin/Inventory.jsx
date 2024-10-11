import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Inventory.css';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { IoTrashOutline } from "react-icons/io5";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Table from 'react-bootstrap/Table';
import Header1 from './HeaderAdmin';
import { MdEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

const Inventory = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [stockData, setStockData] = useState([]);
    const [rawMaterialsData, setRawMaterials] = useState([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [selectedIngredientUnit, setSelectedIngredientUnit] = useState('');
    const [ingredientQuantity, setIngredientQuantity] = useState('');
    
    const [show, setShow] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [stockModalShow, setStockModalShow] = useState(false);
    
    // Form state variables
    const [fname, setFName] = useState('');
    const [file, setFile] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setItemPrice] = useState('');
    const [category, setCategoryName] = useState('');
    
    // Stock state variables
    const [stockName, setStockName] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [stockUnit, setStockUnit] = useState('');
    
    const [showInventory, setShowInventory] = useState(true);
    const [showStocks, setShowStocks] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState('Food Inventory');

    // Fetch data and categories on component mount
    useEffect(() => {
        getUserData();
        getCategories();
        getStockData();
        getRawMaterialsData();
    }, []);

    const handleClose = () => {
        setModalShow(false);
        setStockModalShow(false);
        setIsAddingCategory(false);
        setNewCategory('');
    };

    const handleShow = () => setModalShow(true);
    const handleStockShow = () => setStockModalShow(true);

    const getUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/getinventorydata', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.data.status === 200) {
                setData(res.data.data);
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
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const getStockData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/getstock', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.data.status === 'success') {
                setStockData(res.data.data);
                setIngredients(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching stock data:', error);
        }
    };

    const getRawMaterialsData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/get-raw-materials', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.data.status === 'success') {
                setRawMaterials(res.data.data);
                // setIngredients(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching stock data:', error);
        }
    };
    

    const dltUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`/delete/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.data.status === 201) {
                getUserData();
                setShow(true);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const addIngredient = () => {
        const ingredient = ingredients.find(ing => ing.stock_item_name === selectedIngredient);
        
        if (ingredient && ingredientQuantity && selectedIngredientUnit) {
            setSelectedIngredients(prevIngredients => [
                ...prevIngredients,
                {
                    stock_id: ingredient.stockId,
                    name: selectedIngredient,
                    quantity: ingredientQuantity,
                    unit: selectedIngredientUnit,
                }
            ]);
            // Clear input fields
            setSelectedIngredient('');
            setIngredientQuantity('');
            setSelectedIngredientUnit('');
        }
    };

    const removeIngredient = (index) => {
        setSelectedIngredients(prevIngredients => prevIngredients.filter((_, i) => i !== index));
    };

    const handleIngredientSelection = (e) => {
        const selected = e.target.value;
        const ingredient = ingredients.find(ing => ing.stock_item_name === selected);
        
        setSelectedIngredient(selected);
        setSelectedIngredientUnit(ingredient ? ingredient.unit : '');
    };

    const addUserData = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("fname", fname);
        formData.append("quantity", quantity);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("ingredients", JSON.stringify(selectedIngredients));

        try {
            const res = await axios.post("/addItem", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data.status === 201) {
                handleClose();
                getUserData(); // Refresh data
            }
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };

    const addStockData = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        const stock = { stockName, stockQuantity, stockUnit };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const res = await axios.post("/addStock", stock, config);

        if (res.data.status === 201) {
            handleClose();
            getStockData();
            setStockModalShow(false);
        }
    };

    const addCategory = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('/category', { category: newCategory }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.status === 201) {
                getCategories(); // Refresh categories
                setCategoryName(newCategory);
                setNewCategory('');
                setIsAddingCategory(false);
            }
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    const handleTabSelect = (key) => {
        setSelectedInventory(key);
        setShowInventory(key === "Food Inventory");
        setShowStocks(key === "Stocks Inventory");
    };

    return ( 
        <div>
            <Header1 />
            <div className="inventoryd">
                <div className="d-flex">
                    <h1 className="display-6 logo-label">Inventory</h1>
                    <div className="tab-header">
                        <Tabs
                            activeKey={selectedInventory}
                            onSelect={handleTabSelect}
                            id="fill-tab-example"
                            className="tabs mb-3"
                            fill
                        >
                            <Tab eventKey="Food Inventory" title="Food" />
                            <Tab eventKey="Stocks Inventory" title="Stocks" />
                            <Tab eventKey="Kitchen Inventory" title="Kitchen" />
                        </Tabs>
                    </div>
                </div>
                
                <div className="">
                    {selectedInventory === 'Food Inventory' && (
                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            <Table responsive className="table-fixed">
                                <thead>
                                    <tr>
                                        <th className='text-center'>Item Name</th>
                                        <th className='text-center'>Stock Details</th>
                                        <th className='text-center'>Price</th>
                                        <th className='text-center' id='action-inventory' style={{ width: '140px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((el, i) => (
                                        <tr key={i}>
                                            <td>{el.Item_Name}</td>
                                            <td>{el.Stock_Details}</td>
                                            <td>{el.Price}</td>
                                            <td>
                                                <div className='action-buttons'>
                                                    <Button id='edit-inventory'><MdEdit/></Button>
                                                    <Button id='delete-inventory' onClick={() => dltUser(el.Item_Name)}><FaRegTrashAlt /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                    {selectedInventory === 'Stocks Inventory' && (
                        <div style={{ maxHeight: '350px', overflowY: 'auto'}}>
                            <Table responsive className="table-fixed">
                                <thead className='position-sticky z-3'>
                                    <tr>
                                        <th className='text-center'>Name</th>
                                        <th className='text-center'>Quantity</th>
                                        <th className='text-center'>Unit</th>
                                        <th className='text-center' style={{ width: '120px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockData.map((el, i) => (
                                        <tr key={i}>
                                            <td>{el.stock_item_name}</td>
                                            <td>{el.stock_quantity}</td>
                                            <td>{el.unit}</td>
                                            <td className='text-center'>
                                                <div className='action-buttons-stocks'>
                                                    <Button id='edit-inventory'><MdEdit/></Button>
                                                    <Button id='delete-inventory'><FaRegTrashAlt /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                    {selectedInventory === 'Kitchen Inventory' && (
                        <div style={{ maxHeight: '350px', overflowY: 'auto'}}>
                        <Table responsive className="table-fixed">
                            <thead className='position-sticky z-3'>
                                <tr>
                                    <th className='text-center'>Name</th>
                                    <th className='text-center'>Quantity</th>
                                    <th className='text-center'>Unit</th>
                                    <th className='text-center'>Date Added</th>
                                    <th className='text-center' style={{ width: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rawMaterialsData.map((el, i) => (
                                    <tr key={i}>
                                        <td>{el.raw_material_name}</td>
                                        <td>{el.raw_material_quantity}</td>
                                        <td>{el.raw_material_unit}</td>
                                        <td>{el.date_added}</td>
                                        <td className='text-center'>
                                            <div className='action-buttons-stocks'>
                                                <Button id='edit-inventory'><MdEdit/></Button>
                                                <Button id='delete-inventory'><FaRegTrashAlt /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    )}
                </div>
                <div className="inventory-button">
                {showInventory && (
                    <Button variant="dark" className='btn-add-inventory' onClick={handleShow}>Add Product</Button>
                )}
                {showStocks && (
                    <Button variant="dark" className='btn-add-inventory' onClick={handleStockShow}>Add Stock</Button>
                )}
            </div>
            </div>
            {/* Add Product Modal */}
                                 <Modal show={modalShow} onHide={handleClose} dialogClassName="fullscreen-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Add New Food</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formItemName">
                            <Form.Label>Food Name</Form.Label>
                            <Form.Control
                                type="text"
                                name='fname'
                                value={fname}
                                onChange={(e) => setFName(e.target.value)}
                                className='form-item-name'
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formItemPrice">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                name='price'
                                value={price}
                                onChange={(e) => setItemPrice(e.target.value)}
                                className='form-item-price'
                            />
                        </Form.Group>


                        <Form.Group className="mb-3" controlId="formItemCategory">
                            <Form.Label>Food Category</Form.Label>
                            <Form.Control
                                as="select"
                                value={category}
                                onChange={(e) => setCategoryName(e.target.value)}
                                className='form-item-category'
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat, i) => (
                                    <option key={i} value={cat.category_name}>{cat.category_name}</option>
                                ))}
                                <option value="addNew">Add New Category</option>
                            </Form.Control>
                        </Form.Group>

                        {category === 'addNew' && (
                            <Form.Group className="mb-3" controlId="formNewCategory">
                                <Form.Label>New Category</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className='form-new-category'
                                />
                                <Button variant="secondary" onClick={addCategory} className='add-category-btn'>
                                    Add Category
                                </Button>
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3" controlId="formItemIngredients">
                            <Form.Label>Ingredients</Form.Label>
                            <Form.Select
                                aria-label="Select Ingredient"
                                value={selectedIngredient}
                                onChange={handleIngredientSelection}
                                className='form-item-ingredient'
                            >
                                <option>Select Ingredient</option>
                                {ingredients.map((ingredient, i) => (
                                    <option key={i} value={ingredient.stock_item_name}>
                                        {ingredient.stock_item_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {selectedIngredient && (
                            <>
                                <Form.Group className="mb-3" controlId="formIngredientQuantity">
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={ingredientQuantity}
                                        onChange={(e) => setIngredientQuantity(e.target.value)}
                                        className='form-ingredient-quantity'
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formIngredientUnit">
                                    <Form.Label>Unit</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={selectedIngredientUnit}
                                        readOnly
                                        className='form-ingredient-unit'
                                    />
                                </Form.Group>
                                <div className='d-flex justify-content-end'>
                                <Button onClick={addIngredient} className='bg-dark add-ingredient'>
                                    Add Ingredient
                                </Button>
                                </div>
                            </>
                        )}

                        {selectedIngredients.length > 0 && (
                            <div className="ingredients-list">
                                <h5>Added Ingredients</h5>
                                <Table responsive className='table-ingredients'>
                                    <tr>
                                        <th>Ingredient Name</th>
                                        <th className='ing-th'>Quantity & Unit</th>
                                        <th className='ing-th1'>Action</th>
                                    </tr>
                                    {selectedIngredients.map((ingredient, index) => (
                                        <tr key={index}>

                                            <td>{ingredient.name}</td>
                                            <td className='ing-td'>{ingredient.quantity} {ingredient.unit}</td>
                                            <td><button type="button" className="btn-remove-ingredient" onClick={() => removeIngredient(index)}><IoTrashOutline /></button></td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        )}

                        <Form.Group className="mb-3" controlId="formItemImage">
                            <Form.Label>Image</Form.Label>
                            <Form.Control
                                type="file"
                                name="photo"
                                onChange={(e) => setFile(e.target.files[0])}
                                className='form-item-image'
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {/* <Button className="bg-black" onClick={handleClose}>
                        Close
                    </Button> */}
                    <Button className="food-save" onClick={addUserData}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Stock Modal */}
            <Modal show={stockModalShow} onHide={handleClose} dialogClassName="fullscreen-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Add New Stock</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formStockName">
                            <Form.Label>Stock Name</Form.Label>
                            <Form.Control
                                type="text"
                                name='stockName'
                                value={stockName}
                                onChange={(e) => setStockName(e.target.value)}
                                className='form-stock-name'
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formStockQuantity">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                name='stockQuantity'
                                value={stockQuantity}
                                onChange={(e) => setStockQuantity(e.target.value)}
                                className='form-stock-quantity'
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formStockUnit">
                            <Form.Label>Unit</Form.Label>
                            <Form.Control
                                type="text"
                                name='stockUnit'
                                value={stockUnit}
                                onChange={(e) => setStockUnit(e.target.value)}
                                className='form-stock-unit'
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="food-save" onClick={addStockData}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Inventory;