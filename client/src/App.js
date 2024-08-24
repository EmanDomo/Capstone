import './App.css';
import Admin from './components/Admin/Admin';
import Homepage from './components/Customer/Homepage';
import Login from './components/Admin/LoginForm';
import Menu from './components/Customer/Menu';
import UserLogin from './components/Customer/UserLogin';
import Checkout from './components/Customer/Checkout';
import Register from './components/Customer/Register';
import CompleteOrder from './components/Customer/CompleteOrder';
import Inventory from './components/Admin/Inventory';
import Success from './components/Customer/Success';
import Failed from './components/Customer/Failed';
import Orders from './components/Admin/Orders';
import MyOrders from './components/Customer/MyOrders';
import Sales from './components/Admin/Sales';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/loginform' element={<Login />} />
        <Route path='/menu' element={<Menu />} />
        <Route path='/userlogin' element={<UserLogin />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/register' element={<Register />} />
        <Route path='/inventory' element={<Inventory />} />
        <Route path="/complete-order" element={<CompleteOrder />} />
        <Route path='/success' element={<Success />} />
        <Route path='/failed' element={<Failed />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/myorders' element={<MyOrders />} />
        <Route path='/sales' element={<Sales />} />
      </Routes>
    </>
  );
}

export default App;