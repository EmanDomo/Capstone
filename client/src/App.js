import './App.css';
import Admin from './components/Admin/Admin';
import Homepage from './components/Customer/Homepage';
import Login from './components/Admin/LoginForm';
import Menu from './components/Customer/Menu';
import UserLogin from './components/Customer/UserLogin';
import Checkout from './components/Customer/Checkout';
import Register from './components/Customer/Register';
import CompleteOrder from './components/Customer/CompleteOrder';
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

        <Route path="/complete-order" element={<CompleteOrder />} />
      </Routes>
    </>
  );
}

export default App;