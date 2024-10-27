import './App.css';
import React from 'react';
import POS from './components/Cashier/POS';
import Homepage from './components/Customer/Homepage';
import Login from './components/Cashier/LoginForm';
import Menu from './components/Customer/Menu';
import UserLogin from './components/Customer/UserLogin';
import Checkout from './components/Customer/Checkout';
import Register from './components/Customer/Register';
// import CompleteOrder from './components/Customer/CompleteOrder';

import Success from './components/Customer/Success';
import Failed from './components/Customer/Failed';
import Orders from './components/Cashier/Orders';
import MyOrders from './components/Customer/MyOrders';
import Sales from './components/Admin/Sales';
import SuperAdmin from './components/Admin/SuperAdmin';
// import Try from './components/Admin/Try';
// import Graph from './components/Admin/Graph';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from "react-router-dom";
// import Header1 from './components/Admin/Header1';
import Inventory from './components/Admin/Inventory';
// import Header2 from './components/Customer/Header2';
// import Menuu from './components/Customer/Menu1';
import Footer from './components/Customer/Footer';
import Draft from './components/Customer/Draft';

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
        <Route path='/Draft' element={<Draft />} />
        {/* <Route path="/complete-order" element={<CompleteOrder />} /> */}
        <Route path='/success' element={<Success />} />
        <Route path='/failed' element={<Failed />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/myorders' element={<MyOrders />} />
        <Route path='/sales' element={<Sales />} />
        <Route path='/superadmin' element={<SuperAdmin />} />
        {/* <Route path='/Try' element={<Try />} /> */}
        {/* <Route path='/Graph' element={<Graph />} />
        <Route path='/Header1' element={<Header1 />} /> */}
        {/* <Route path='/Header2' element={<Header2 />} /> */}
        <Route path='/Inventory' element={<Inventory />} />
        {/* <Route path='/Menuu' element={<Menuu />} /> */}
        <Route path='/Footer' element={<Footer />} />
      </Routes>    
    </>
  );
}

export default App;