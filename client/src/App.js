import './App.css';
import React from 'react';
import { Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import Homepage from './components/Customer/Homepage';
import UserLogin from './components/Customer/UserLogin';
import Checkout from './components/Customer/Checkout';
import Register from './components/Customer/Register';
import Success from './components/Customer/Success';
import Failed from './components/Customer/Failed';
import Footer from './components/Customer/Footer';

import Login from './components/Cashier/LoginForm';
import POS from './components/Cashier/POS';
import Menu from './components/Customer/Menu';
import Orders from './components/Cashier/Orders';
import MyOrders from './components/Customer/MyOrders';

import Sales from './components/Admin/Sales';
import SuperAdmin from './components/Admin/SuperAdmin';
import Inventory from './components/Admin/Inventory';
import ManageAccounts from './components/Admin/ManageAccounts';
import CompleteOrder from './components/Customer/CompleteOrder';
import NotFound from './components/Admin/NotFound';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/pos' element={<POS />} />
        <Route path='/loginform' element={<Login />} />
        <Route path='/menu' element={<Menu />} />
        <Route path='/userlogin' element={<UserLogin />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/register' element={<Register />} />
        <Route path='/success' element={<Success />} />
        <Route path='/failed' element={<Failed />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/myorders' element={<MyOrders />} />
        <Route path='/sales' element={<Sales />} />
        <Route path='/superadmin' element={<SuperAdmin />} />
        <Route path='/Inventory' element={<Inventory />} />
        <Route path='/Footer' element={<Footer />} />
        <Route path="/ManageAccounts" element={<ManageAccounts/>}/>
        <Route path="/complete-order" element={<CompleteOrder/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>    
    </>
  );
}

export default App;