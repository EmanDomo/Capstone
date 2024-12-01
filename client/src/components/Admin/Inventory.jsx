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
import { IoMdAdd } from "react-icons/io";
import { host } from '../../apiRoutes';
import { Toast } from 'react-bootstrap';
import { ToastContainer } from 'react-bootstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

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
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);  
    const [show, setShow] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [stockModalShow, setStockModalShow] = useState(false);
    const [rawMaterialModalShow, setRawMaterialModalShow] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [fname, setFName] = useState('');
    const [file, setFile] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setItemPrice] = useState('');
    const [category, setCategoryName] = useState('');
    const [stockName, setStockName] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [stockUnit, setStockUnit] = useState('');
    const [rawMaterialName, setRawMaterialName] = useState('');
    const [rawMaterialQuantity, setRawMaterialQuantity] = useState('');
    const [rawMaterialUnit, setRawMaterialUnit] = useState('');
    const [rawMaterialNameError, setRawMaterialNameError] = useState('');
    const [rawMaterialQuantityError, setRawMaterialQuantityError] = useState('');
    const [rawMaterialUnitError, setRawMaterialUnitError] = useState('');  
    const [showInventory, setShowInventory] = useState(true);
    const [showStocks, setShowStocks] = useState(false);
    const [showRawMaterials, setShowRawMaterial] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState('Food Inventory');
    const [requiresRawMaterial, setRequiresRawMaterial] = useState(false);
    const [selectedRawMaterialId, setSelectedRawMaterialId] = useState('');
    const [quantityRequired, setQuantityRequired] = useState('');
    const [conversionRatio, setConversionRatio] = useState('');
    const [rawMaterialUsageQuantity, setRawMaterialUsageQuantity] = useState(''); 
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedRawMaterial, setSelectedRawMaterial] = useState({});
    const [editStockModalShow, setEditStockModalShow] = useState(false);
    const [selectedStock, setSelectedStock] = useState({});
    const [editFoodModalShow, setEditFoodModalShow] = useState(false);
    const [selectedFood, setSelectedFood] = useState({});
    const [updatedIngredients, setUpdatedIngredients] = useState([]);
    const [errors, setErrors] = useState({});
    const [isToastVisible, setIsToastVisible] = useState(false);
    const toggleToast = () => setIsToastVisible(!isToastVisible);
    const [errorMessage, setErrorMessage] = useState('');
    const handleShow = () => setModalShow(true);
    const handleStockShow = () => setStockModalShow(true);
    const handleRawMaterialShow = () => setRawMaterialModalShow(true);
    const [units, setUnits] = useState([]);
    const [unit, setUnit] = useState('');
    const [newUnit, setNewUnit] = useState('');
    const [isAddingUnit, setIsAddingUnit] = useState(false);
    const [unitStocks, setUnitStocks] = useState([]); 
    const [newUnitStock, setNewUnitStock] = useState('');
    const [rawMaterialUnitStock, setRawMaterialUnitStock] = useState(''); 
    const [isAddingUnitStock, setIsAddingUnitStock] = useState(false); 
    const [toastsRaw, setToastsRaw] = useState([]);

    useEffect(() => {
        getUserData();
        getCategories();
        getStockData();
        getRawMaterialsData();
        getUnits();
        getUnitStocks();
        
    }, []);

    const handleClose = () => {
        setModalShow(false);
        setStockModalShow(false);
        setRawMaterialModalShow(false);
        setIsAddingCategory(false);
        setNewCategory('');

        setFName('');
        setItemPrice('');
        setCategoryName('');
        setNewCategory('');
        setSelectedIngredient('');
        setIngredientQuantity('');
        setSelectedIngredients([]);
        setFile(null);  

        setStockName('');                  
        setStockQuantity('');              
        setStockUnit('');                 
        setRequiresRawMaterial(false);  
        setSelectedRawMaterialId('');   
        setRawMaterialUsageQuantity(''); 
        setQuantityRequired('');       
        setConversionRatio(''); 

        setRawMaterialName('');
        setRawMaterialQuantity('');
        setRawMaterialUnit(''); 
        setErrorMessage('');
    };
    
    const addToastRaw = (message, type = 'success') => {
        const id = new Date().getTime(); 
        setToastsRaw((prevToasts) => [...prevToasts, { id, message, type }]);
    };
    
    const removeToastRaw = (id) => {
        setToastsRaw((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    const getUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${host}/getinventorydata`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (res.data.status === 200) {
                const updatedData = res.data.data.map(item => ({
                    ...item,
                    id: item.id || item.food_id 
                }));
                setData(updatedData);
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
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const getStockData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${host}/getstock`, {
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
            const res = await axios.get(`${host}/get-raw-materials`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.data.status === 'success') {
                setRawMaterials(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching raw material data:', error);
        }
    };

    const handleEditClick = (material) => {
        setSelectedRawMaterial(material);
        setEditModalShow(true);
    };

    const handleEditChange = (e) => {
        setSelectedRawMaterial({
            ...selectedRawMaterial,
            [e.target.name]: e.target.value,
        });
    };

    const saveRawMaterialChanges = async () => {
        const newErrors = {};
        if (!selectedRawMaterial.raw_material_name) newErrors.raw_material_name = "Name is required.";
        if (!selectedRawMaterial.raw_material_quantity) newErrors.raw_material_quantity = "Quantity is required.";
        if (!selectedRawMaterial.raw_material_unit) newErrors.raw_material_unit = "Unit is required.";
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${host}/update-raw-material/${selectedRawMaterial.raw_material_id}`, selectedRawMaterial, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setEditModalShow(false);
            getRawMaterialsData();
            setErrors({});
        } catch (error) {
            console.error('Error updating raw material:', error);
        }
    };
    

    const handleEditStockClick = (stock) => {
        setSelectedStock(stock);
        setEditStockModalShow(true);
    };
    

    const handleStockEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedStock((prev) => ({
            ...prev,
            [name]: value,
        }));
    
        if (value === 'addNewUnitStock') {
            setIsAddingUnitStock(true);
        } else {
            setIsAddingUnitStock(false);
        }
    };
    

    const saveStockChanges = async () => {
        const newErrors = {};
        if (!selectedStock.stock_item_name) newErrors.stock_item_name = "Stock name is required.";
        if (!selectedStock.stock_quantity) newErrors.stock_quantity = "Quantity is required.";
        if (!selectedStock.unit) newErrors.unit = "Unit is required.";
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${host}/update-stock/${selectedStock.stockId}`, selectedStock, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setEditStockModalShow(false);
            getStockData();
            getRawMaterialsData();
            setErrors({});
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };
    
    
    const handleArchive = async (id, type) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${host}/archive/${type}/${id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (res.status === 200) {
                console.log(`${type} archived successfully`);
                if (type === "item") {
                    getUserData();
                } else if (type === "stock") {
                    getStockData();
                } else if (type === "raw_material") {
                    getRawMaterialsData();
                }

                getStockData();
                getUserData();
                getRawMaterialsData();
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setModalMessage(error.response.data.message);
                setShowModal(true);
            } else {
                console.error('Error archiving item:', error);
            }
        }
    };
    const handleEditFoodClick = (food) => {
        console.log('Selected food:', food); 
        if (!food.id) {
            console.error('Food item is missing an ID');
            return;
        }
        setSelectedFood({
            id: food.id,
            Item_Name: food.Item_Name,
            Price: food.Price,
            ingredients: food.ingredients || [], 
        });
        setUpdatedIngredients(food.ingredients || []);
        setEditFoodModalShow(true);
    };
    
    const handleEditFoodChange = (e) => {
        setSelectedFood({
            ...selectedFood,
            [e.target.name]: e.target.value,
        });
    };
    
    const addUpdatedIngredient = () => {
        const ingredient = ingredients.find((ing) => ing.stock_item_name === selectedIngredient);
        if (ingredient && ingredientQuantity && selectedIngredientUnit) {
            setUpdatedIngredients([...updatedIngredients, {
                stock_id: ingredient.stockId,
                name: selectedIngredient,
                quantity: ingredientQuantity,
                unit: selectedIngredientUnit,
            }]);
            setSelectedIngredient('');
            setIngredientQuantity('');
            setSelectedIngredientUnit('');
        }
    };
    
    const removeUpdatedIngredient = (index) => {
        setUpdatedIngredients((prevIngredients) => prevIngredients.filter((_, i) => i !== index));
    };
    
    const saveFoodChanges = async () => {
        if (!selectedFood.id) {
            console.error('Error: selectedFood.id is undefined');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${host}/update-food/${selectedFood.id}`, {  
                ...selectedFood,
                ingredients: updatedIngredients,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
            });
            setEditFoodModalShow(false);
            getUserData(); 
        } catch (error) {
            console.error('Error updating food item:', error);
        }
    };
    
    
    const dltUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${host}/delete/${id}`, {
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

    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateIngredient, setDuplicateIngredient] = useState(null);
    
    const addIngredient = () => {
        const ingredient = ingredients.find(ing => ing.stock_item_name === selectedIngredient);
        
        if (ingredient && ingredientQuantity && selectedIngredientUnit) {
            const ingredientExists = selectedIngredients.some(ing => ing.stock_id === ingredient.stockId);
            
            if (ingredientExists) {
                setDuplicateIngredient(ingredient);
                setShowDuplicateModal(true);
            } else {
                setSelectedIngredients(prevIngredients => [
                    ...prevIngredients,
                    {
                        stock_id: ingredient.stockId,
                        name: selectedIngredient,
                        quantity: ingredientQuantity,
                        unit: selectedIngredientUnit,
                    }
                ]);
                setSelectedIngredient('');
                setIngredientQuantity('');
                setSelectedIngredientUnit('');
            }
        }
    };
    
    const increaseQuantity = (index) => {
        setSelectedIngredients(prevIngredients => {
            const updatedIngredients = [...prevIngredients];
            updatedIngredients[index].quantity = Number(updatedIngredients[index].quantity) + 1; // Ensure it's treated as a number
            return updatedIngredients;
        });
    };
    
    const decreaseQuantity = (index) => {
        setSelectedIngredients(prevIngredients => {
            const updatedIngredients = [...prevIngredients];
            const currentQuantity = Number(updatedIngredients[index].quantity); // Ensure it's treated as a number
            if (currentQuantity > 1) {
                updatedIngredients[index].quantity = currentQuantity - 1; // Decrease the quantity
            }
            return updatedIngredients;
        });
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
        
        if (file && !file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return; 
        }
    
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("fname", fname);
        formData.append("quantity", quantity);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("ingredients", JSON.stringify(selectedIngredients));
    
        try {
            const res = await axios.post(`${host}/addItem`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
    
            if (res.data.status === 201) {
                handleClose();
                getUserData(); 
                setShowConfirmationModal(true);

                addToastRaw("Food added successfully.", 'success');
            }
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };
    
    const addStockData = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        let calculatedQuantity = stockQuantity;
    
        if (!stockName || !stockUnit || (!requiresRawMaterial && !stockQuantity)) {
            setErrorMessage("Please provide all required fields.");
            return;
        }

    
        if (requiresRawMaterial && rawMaterialUsageQuantity && conversionRatio) {
            calculatedQuantity = rawMaterialUsageQuantity * conversionRatio;
        }
    
        const stock = {
            stockName,
            stockQuantity: calculatedQuantity,
            stockUnit, 
            requiresRawMaterial,
            raw_material_id: requiresRawMaterial ? selectedRawMaterialId : null,
            quantity_required: requiresRawMaterial ? quantityRequired : null,
            conversion_ratio: requiresRawMaterial ? conversionRatio : null,
            raw_material_usage_quantity: requiresRawMaterial ? rawMaterialUsageQuantity : null,
            is_archive: 0 
        };
    
        console.log("Stock Data:", stock);  
    
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
    
        try {
            const res = await axios.post(`${host}/addStock`, stock, config);
            if (res.data.status === 201) {
                handleClose();
                await getStockData();
                getRawMaterialsData();
                setShowConfirmationModal(true);

                addToastRaw("Item added successfully.", 'success');
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setErrorMessage(error.response.data.message);
            } else {
                console.error('Error adding stock:', error);
                setErrorMessage("An error occurred while adding stock.");
            }
        }
    };
    
    const addRawMaterial = async (e) => {
        e.preventDefault();
    
        setRawMaterialNameError('');
        setRawMaterialQuantityError('');
        setRawMaterialUnitError('');
        setErrorMessage('');
    
        if (!rawMaterialName) {
            setRawMaterialNameError("Item name is required.");
            return; 
        }
    
        if (!rawMaterialQuantity) {
            setRawMaterialQuantityError("Quantity is required.");
            return; 
        }
    
        if (!rawMaterialUnit) {
            setRawMaterialUnitError("Unit is required.");
            return;
        }
    
        const token = localStorage.getItem('token');
    
        const rawMaterial = {
            rawMaterialName,
            rawMaterialQuantity,
            rawMaterialUnit
        };
    
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
    
        try {
            const res = await axios.post(`${host}/add-raw-material`, rawMaterial, config);
    
            if (res.data.status === 201) {
                handleClose();  
                await getRawMaterialsData(); 
                setRawMaterialName('');
                setRawMaterialQuantity('');
                setRawMaterialUnit('');
                setIsToastVisible(true);

                addToastRaw("Item added to Storage successfully.", 'success');
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setErrorMessage(error.response.data.message);
            } else {
                console.error('Error adding raw material:', error);
            }
        }
    };

    const addCategory = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${host}/category`, { category: newCategory }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.status === 201) {
                getCategories();
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
        setShowRawMaterial(key === "Kitchen Inventory")
    };

    const getUnits = async () => {
        try {
            const res = await axios.get(`${host}/units`);
            if (res.data.status === 200) {
                setUnits(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    const addUnit = async (e) => {
        e.preventDefault();  
    
        if (!newUnit.trim()) return;  
    
        try {
            const res = await axios.post('/unit', { unit_name: newUnit }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (res.data.status === 201) {
                const addedUnit = res.data.data;
                setUnits((prevUnits) => [...prevUnits, addedUnit]);
                setRawMaterialUnit(addedUnit.unit_name); 
                setSelectedRawMaterial((prev) => ({
                    ...prev,
                    raw_material_unit: addedUnit.unit_name,  
                }));
                setNewUnit('');
                setIsAddingUnit(false); 
            }
        } catch (error) {
            console.error('Error adding unit:', error);
        }
    };

const getUnitStocks = async () => {
    try {
        const res = await axios.get(`${host}/unit-stocks`);
        if (res.data.status === 200) {
            setUnitStocks(res.data.data); 
        }
    } catch (error) {
        console.error('Error fetching unit stocks:', error);
    }
};


const addUnitStock = async (e) => {
    e.preventDefault();

    if (!newUnitStock.trim()) {
        setErrorMessage("Unit name cannot be empty.");
        return;
    }

    try {
        const res = await axios.post(`${host}/unit-stock`, { unit_stock_name: newUnitStock }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (res.data.status === 201) {
            setUnitStocks(prevState => [...prevState, res.data.data]);
            setNewUnitStock('');
            setErrorMessage('');
            setStockUnit(res.data.data.unit_stock_name);  
            setIsAddingUnitStock(false);
        }
    } catch (error) {
        console.error('Error adding unit stock:', error);
        setErrorMessage("An error occurred while adding the new unit.");
    }
};

    return ( 
        <div>
            <Header1 />
            <div className="inventoryd">
                <div className="invheader">
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
                            <Tab eventKey="Kitchen Inventory" title="Storage" />
                        </Tabs>
                    </div>
                </div>
                
                <div className="">
                    {selectedInventory === 'Food Inventory' && (
                        <div className='inventory-tables'>
                            <Table hover responsive className="table-fixed">
                                <thead>
                                    <tr>
                                        <th className='text-center'>Item Name</th>
                                        <th className='text-center'>Stock Details</th>
                                        <th className='text-center'>Price</th>
                                        <th className='text-center' id='action-inventory' style={{ width: '80px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((el, i) => (
                                        <tr key={i}>
                                            <td>{el.Item_Name}</td>
                                            <td className='text-center'>{el.Stock_Details}</td>
                                            <td className='text-center'>₱ {el.Price}</td>
                                            <td>
                                                <div className='d-flex justify-content-between action-buttons'>
                                                <Button onClick={() => handleEditFoodClick(el)} id='edit-inventory'><MdEdit /></Button>

                                                <Button onClick={() => handleArchive(el.id, 'item')} id='delete-inventory'><FaRegTrashAlt /></Button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                    {selectedInventory === 'Stocks Inventory' && (
                        <div className='inventory-tables'>
                            <Table hover responsive className="table-fixed">
                                <thead className='position-sticky z-3'>
                                    <tr>
                                        <th className='text-center'>Name</th>
                                        <th className='text-center'>Quantity</th>
                                        <th className='text-center'>Unit</th>
                                        <th className='text-center' style={{ width: '80px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                        {stockData.map((stock) => (
                            <tr key={stock.stockId}>
                                <td>{stock.stock_item_name}</td>
                                <td className='text-center'>{stock.stock_quantity}</td>
                                <td className='text-center'>{stock.unit}</td>
                                <td>
                                    <div className='d-flex justify-content-between action-buttons'>
                                        <Button onClick={() => handleEditStockClick(stock)} id='edit-inventory'><MdEdit /></Button>
                                        <Button onClick={() => handleArchive(stock.stockId, 'stock')} id='delete-inventory'><FaRegTrashAlt /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                            </Table>
                        </div>
                    )}
                    {selectedInventory === 'Kitchen Inventory' && (
                        <div className='inventory-tables'>
                        <Table hover responsive className="table-fixed">
                            <thead className='position-sticky z-3'>
                                <tr>
                                    <th className='text-center'>Name</th>
                                    <th className='text-center'>Quantity</th>
                                    <th className='text-center'>Unit</th>
                                    <th className='text-center'>Date Added</th>
                                    <th className='text-center' style={{ width: '80px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                    {rawMaterialsData.map((material) => (
                                        <tr key={material.raw_material_id}>
                                            <td>{material.raw_material_name}</td>
                                            <td className='text-center'>{material.raw_material_quantity}</td>
                                            <td className='text-center'>{material.raw_material_unit}</td>
                                            <td className='text-center'>{material.date_added}</td>
                                            <td>
                                                <div className='d-flex justify-content-between action-buttons'>
                                                    <Button onClick={() => handleEditClick(material)} id='edit-inventory'><MdEdit /></Button>
                                                    <Button onClick={() => handleArchive(material.raw_material_id, 'raw_material')}id='delete-inventory'><FaRegTrashAlt /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                        </Table>
                    </div>
                    )}
                </div>
                <div className="position-absolute bottom-0 end-0 m-5 inventory-button-2">
                    {showInventory && (
                        <Button variant="dark" onClick={handleShow} className='btn-add-inventory2'><IoMdAdd/></Button>
                    )}
                    {showStocks && (
                        <Button variant="dark"onClick={handleStockShow} className='btn-add-inventory2'><IoMdAdd/></Button>
                    )}
                    {showRawMaterials && (
                        <Button variant="dark" onClick={handleRawMaterialShow} className='btn-add-inventory2'><IoMdAdd/></Button>
                    )}                 
                </div>

                <div className="mt-5 inventory-button d-flex justify-content-center inventory-button">
                {showInventory && (
                    <Button variant="dark" className='btn-add-inventory' onClick={handleShow}>Add Product</Button>
                )}
                {showStocks && (
                    <Button variant="dark" className='btn-add-inventory' onClick={handleStockShow}>Add Stock</Button>
                )}
                {showRawMaterials && (
                    <Button variant="dark" className='btn-add-inventory' onClick={handleRawMaterialShow}>Add to Storage</Button>
                )}
            </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Cannot Remove Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal 
                show={showDuplicateModal} 
                onHide={() => setShowDuplicateModal(false)} 
                backdrop="static" 
                keyboard={false}
                dialogClassName="fullscreen-modal">
                <Modal.Header closeButton>
                    <Modal.Title className='text-danger'>Cannot Add Ingredient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{duplicateIngredient ? `The ingredient is already exits.` : ''}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={() => setShowDuplicateModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal 
            show={modalShow} 
            onHide={handleClose} 
            dialogClassName="fullscreen-modal"
            backdrop="static" 
            keyboard={false}>
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
                                required/>
                                <div className='pt-3 d-flex justify-content-end'>
                                    <Button variant="dark" onClick={addCategory} className='add-category-btn'>
                                        Add Category
                                    </Button>
                                </div>
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
                            <h5 className='p-1 text-center added-ing-title'>Added Ingredients</h5>
                            <Table responsive className='table-ingredients'>
                                <thead>
                                    <tr className='p-1'>
                                        <th className='p-2'>Ingredient Name</th>
                                        <th className='ing-th p2 text-center'>Qty</th>
                                        <th className='ing-th p2 text-center'>Unit</th>
                                        <th className='ing-th1 p2'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedIngredients.map((ingredient, index) => (
                                        <tr key={index}>
                                            <td className='p-2'>{ingredient.name}</td>
                                            <td className='ing-td p2 text-center'>
                                                <ButtonGroup aria-label="Basic example" className='btngroup'>
                                                    <Button className="decrease-ing" variant="dark" onClick={() => decreaseQuantity(index)}>-</Button>
                                                    <label className="px-2 pt-1">{ingredient.quantity}</label>
                                                    <Button className="increase-ing" variant="dark" onClick={() => increaseQuantity(index)}>+</Button>
                                                </ButtonGroup>
                                            </td>
                                            <td className='ing-td p2 text-center'>
                                                {ingredient.unit}
                                                
                                            </td>
                                            <td className='text-center'>
                                                <button type="button" className="btn-remove-ingredient" onClick={() => removeIngredient(index)}>
                                                    <IoTrashOutline />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
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
                            accept="image/*" 
                        />
                    </Form.Group>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="food-save"variant="dark"  onClick={addUserData}>
                        Save Food
                    </Button>
                </Modal.Footer>
            </Modal>
            
            <Modal 
                show={stockModalShow} 
                onHide={handleClose} 
                dialogClassName="fullscreen-modal" 
                backdrop="static" 
                keyboard={false}>
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
                                isInvalid={!!errorMessage}
                                />
                                <Form.Control.Feedback type="invalid">
                                {errorMessage}
                                </Form.Control.Feedback>        
                        </Form.Group>

                        <Form.Group controlId="requiresRawMaterial">
                            <Form.Check
                                type="checkbox"
                                className='text-secondary mb-1'
                                label="Does this stock require raw materials?"
                                checked={requiresRawMaterial}
                                onChange={(e) => setRequiresRawMaterial(e.target.checked)}
                            />
                        </Form.Group>

                        {!requiresRawMaterial && (
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
                        )}

                        <Form.Group className="mb-3" controlId="formStockUnit">
                        <Form.Label>Unit</Form.Label>
                        <Form.Control
                            as="select"
                            value={stockUnit} 
                            onChange={(e) => setStockUnit(e.target.value)} 
                            className="form-stock-unit"
                        >
                            <option value="">Select Unit</option>
                            {unitStocks.map((unit, i) => (
                            <option key={i} value={unit.unit_stock_name}>
                                {unit.unit_stock_name}
                            </option>
                            ))}
                            <option value="addNewUnit">Add New Unit</option>
                        </Form.Control>
                        </Form.Group>

                        {stockUnit === 'addNewUnit' && (
                        <Form.Group className="mb-3" controlId="formNewStockUnit">
                            <Form.Label>New Unit</Form.Label>
                            <Form.Control
                            type="text"
                            value={newUnitStock} 
                            onChange={(e) => setNewUnitStock(e.target.value)} 
                            className="form-new-stock-unit"
                            required
                            />
                            <div className="pt-3 d-flex justify-content-end">
                            <Button variant="dark" onClick={addUnitStock} className="add-unit-stock-btn">
                                Add Unit
                            </Button>
                            </div>
                        </Form.Group>
                        )}

                    {requiresRawMaterial && (
                        <>
                            <Form.Group className="mb-3" controlId="formRawMaterialId">
                                <Form.Label>Choose item from food storage </Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedRawMaterialId}
                                    onChange={(e) => setSelectedRawMaterialId(e.target.value)}
                                >
                                    <option value="">Tap to select</option>
                                    {rawMaterialsData.map((material) => (
                                        <option key={material.raw_material_id} value={material.raw_material_id}>
                                            {material.raw_material_name}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formRawMaterialUsageQuantity">
                                <Form.Label>Quantity of Item to Use from Storage</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={rawMaterialUsageQuantity}
                                    onChange={(e) => setRawMaterialUsageQuantity(e.target.value)}
                                    placeholder="Enter quantity to use"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formQuantityRequired">
                                <Form.Label>Quantity Required for Recipe</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={quantityRequired}
                                    onChange={(e) => setQuantityRequired(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formConversionRatio">
                                <Form.Label>Conversion Ratio</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={conversionRatio}
                                    onChange={(e) => setConversionRatio(e.target.value)}
                                />
                            </Form.Group>
                        </>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="food-save" variant="dark"onClick={addStockData}>
                    Save Stock
                </Button>
            </Modal.Footer>
        </Modal>

        <Modal
        show={rawMaterialModalShow}
        onHide={handleClose}
        dialogClassName="fullscreen-modal"
        backdrop="static"
        keyboard={false}
        >
        <Modal.Header closeButton>
        <Modal.Title>Add New Item in Storage</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form>
            <Form.Group className="mb-3" controlId="formRawMaterialName">
            <Form.Label>Item Name</Form.Label>
            <Form.Control
                type="text"
                name="rawMaterialName"
                value={rawMaterialName}
                onChange={(e) => setRawMaterialName(e.target.value)}
                className="form-raw-material-name"
                isInvalid={!!errorMessage}
                                />
                                <Form.Control.Feedback type="invalid">
                                {errorMessage}
                                </Form.Control.Feedback> 
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRawMaterialQuantity">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
                type="number"
                name="rawMaterialQuantity"
                value={rawMaterialQuantity}
                onChange={(e) => setRawMaterialQuantity(e.target.value)}
                className="form-raw-material-quantity"
                isInvalid={!!rawMaterialQuantityError}
            />
            <Form.Control.Feedback type="invalid">
                {rawMaterialQuantityError}
            </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRawMaterialUnit">
            <Form.Label>Unit</Form.Label>
            <Form.Control
                as="select"
                value={rawMaterialUnit}
                onChange={(e) => setRawMaterialUnit(e.target.value)}
                className="form-item-unit"
                isInvalid={!!rawMaterialUnitError} 
            >
                <option value="">Select Unit</option>
                {units.map((unit, i) => (
                <option key={i} value={unit.unit_name}>{unit.unit_name}</option>
                ))}
                <option value="addNewUnit">Add New Unit</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
                {rawMaterialUnitError}
            </Form.Control.Feedback>
            </Form.Group>

            {rawMaterialUnit === 'addNewUnit' && (
            <Form.Group className="mb-3" controlId="formNewUnit">
                <Form.Label>New Unit</Form.Label>
                <Form.Control
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="form-new-unit"
                required
                />
                <div className="pt-3 d-flex justify-content-end">
                <Button variant="dark" onClick={addUnit} className="add-unit-btn">
                    Add Unit
                </Button>
                </div>
            </Form.Group>
            )}
        </Form>
        </Modal.Body>
            <Modal.Footer>
                <Button className="food-save" variant="dark" onClick={addRawMaterial}>
                    Save Ingredient
                </Button>
            </Modal.Footer>
        </Modal>

        <ToastContainer className="position-fixed bottom-0 end-0 p-3 toast-menu" style={{ zIndex: 1 }}>
            {toastsRaw.map((toast) => (
                <Toast key={toast.id} onClose={() => removeToastRaw(toast.id)} delay={3000} autohide>
                    <Toast.Header>
                        <strong className={`me-auto ${toast.type === 'success' ? 'text-success' : 'text-danger'}`}>
                            {toast.type === 'success' ? 'Success' : 'Error'}
                        </strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body>{toast.message}</Toast.Body>
                </Toast>
            ))}
        </ToastContainer>

              
              <Modal 
              show={editModalShow} 
              onHide={() => setEditModalShow(false)} 
              dialogClassName="fullscreen-modal"
              backdrop="static" 
              keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Item from Storage</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formRawMaterialName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="raw_material_name"
                                value={selectedRawMaterial.raw_material_name || ''}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formRawMaterialQuantity">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                name="raw_material_quantity"
                                value={selectedRawMaterial.raw_material_quantity || ''}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formRawMaterialUnit">
                        <Form.Label>Unit</Form.Label>
                        <Form.Control
                            as="select"
                            name="raw_material_unit"
                            value={selectedRawMaterial.raw_material_unit || ''} 
                            onChange={(e) => handleEditChange(e)} disabled
                        >
                            <option value="">Select Unit</option>
                            {units.map((unit, i) => (
                                <option key={i} value={unit.unit_name}>{unit.unit_name}</option>
                            ))}
                            <option value="addNewUnit">Add New Unit</option>
                        </Form.Control>
                    </Form.Group>

                    {selectedRawMaterial.raw_material_unit === 'addNewUnit' && (
                        <Form.Group className="mb-3" controlId="formNewUnit">
                            <Form.Label>New Unit</Form.Label>
                            <Form.Control
                                type="text"
                                value={newUnit}
                                onChange={(e) => setNewUnit(e.target.value)} 
                                className="form-new-unit"
                                required
                            />
                            <div className="pt-3 d-flex justify-content-end">
                                <Button variant="dark" onClick={addUnit} className="add-unit-btn">
                                    Add Unit
                                </Button>
                            </div>
                        </Form.Group>
                    )}
                </Form>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                        <Button variant="dark" onClick={() => setEditModalShow(false)}>Close</Button>
                        <Button variant="dark" className="food-save" onClick={saveRawMaterialChanges}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
            <Modal 
            show={editStockModalShow} 
            onHide={() => setEditStockModalShow(false)} 
            dialogClassName="fullscreen-modal"
            backdrop="static" 
            keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Stock</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formStockName">
                            <Form.Label>Stock Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="stock_item_name"
                                value={selectedStock.stock_item_name || ''}
                                onChange={handleStockEditChange}
                            />
                        </Form.Group>

                        {selectedStock.requires_raw_material ? (
                            <>
                                <Form.Group controlId="formRawMaterialUsageQuantity">
                                    <Form.Label>Quantity of Raw Material to Use</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="raw_material_usage_quantity"
                                        value={selectedStock.raw_material_usage_quantity || ''}
                                        onChange={handleStockEditChange}
                                    />
                                </Form.Group>
                                <Form.Group controlId="formConversionRatio">
                                    <Form.Label>Conversion Ratio</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="conversion_ratio"
                                        value={selectedStock.conversion_ratio || ''}
                                        readOnly disabled
                                    />
                                </Form.Group>
                            </>
                        ) : (
                            <Form.Group controlId="formStockQuantity">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="stock_quantity"
                                    value={selectedStock.stock_quantity || ''}
                                    onChange={handleStockEditChange}
                                />
                            </Form.Group>
                        )}

            <Form.Group controlId="formStockUnit">
                <Form.Label>Unit</Form.Label>
                <Form.Control
                    as="select" 
                    name="unit"
                    value={selectedStock.unit || ''} 
                    onChange={(e) => handleStockEditChange(e)} disabled
                >
                    <option value="">Select Unit</option>
                    {unitStocks.map((unitStock, i) => (
                        <option key={i} value={unitStock.unit_stock_name}>
                            {unitStock.unit_stock_name}
                        </option>
                    ))}
                    <option value="addNewUnitStock">Add New Unit Stock</option>
                </Form.Control>
            </Form.Group>

            {rawMaterialUnitStock === 'addNewUnitStock' && (
                <Form.Group className="mb-3" controlId="formNewUnitStock">
                    <Form.Label>New Unit Stock</Form.Label>
                    <Form.Control
                        type="text"
                        value={newUnitStock}
                        onChange={(e) => setNewUnitStock(e.target.value)}
                        className="form-new-unit-stock"
                        required
                    />
                    <div className="pt-3 d-flex justify-content-end">
                        <Button variant="dark" onClick={addUnitStock} className="add-unit-stock-btn">
                            Add Unit Stock
                        </Button>
                    </div>
                </Form.Group>
            )}

                    </Form>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                        <Button variant="dark" onClick={() => setEditStockModalShow(false)}>Close</Button>
                        <Button variant="dark" className="food-save" onClick={saveStockChanges}>Save Changes</Button>
                </Modal.Footer>
            </Modal>

            <Modal 
            show={editFoodModalShow} 
            onHide={() => setEditFoodModalShow(false)} 
            dialogClassName="fullscreen-modal"
            backdrop="static" 
            keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Food Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formFoodName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="Item_Name"
                                value={selectedFood.Item_Name || ''}
                                onChange={handleEditFoodChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formFoodPrice">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="Price"
                                value={selectedFood.Price || ''}
                                onChange={handleEditFoodChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formFoodIngredients">
                            <Form.Label>Ingredients</Form.Label>
                            <Form.Select
                                value={selectedIngredient}
                                onChange={handleIngredientSelection}
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
                                <Form.Group controlId="formIngredientQuantity" className="mt-3">
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={ingredientQuantity}
                                        onChange={(e) => setIngredientQuantity(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group controlId="formIngredientUnit" className="mt-3">
                                    <Form.Label>Unit</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={selectedIngredientUnit}
                                        readOnly
                                    />
                                </Form.Group>

                                <Button onClick={addUpdatedIngredient} className="mt-2">Add Ingredient</Button>
                            </>
                        )}

                        {updatedIngredients.length > 0 && (
                            <Table responsive className="table-ingredients mt-3">
                                <thead>
                                    <tr>
                                        <th>Ingredient Name</th>
                                        <th>Quantity & Unit</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {updatedIngredients.map((ingredient, index) => (
                                        <tr key={index}>
                                            <td>{ingredient.name}</td>
                                            <td>{ingredient.quantity} {ingredient.unit}</td>
                                            <td><Button onClick={() => removeUpdatedIngredient(index)}><IoTrashOutline /></Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                        <Button variant="dark" onClick={() => setEditFoodModalShow(false)}>Close</Button>
                        <Button variant="dark" className="food-save" onClick={saveFoodChanges}>Save Changes</Button>  
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Inventory;