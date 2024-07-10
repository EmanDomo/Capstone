import './App.css';
import Admin from './components/Admin';
import Homepage from './components/Homepage';
import Login from './components/LoginForm';
import Menu from './components/Menu';
import UserLogin from './components/UserLogin';
import Checkout from './components/Checkout';
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
      </Routes>
    </>
  );
}

export default App;