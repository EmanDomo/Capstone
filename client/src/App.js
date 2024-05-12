import './App.css';
import Header from './components/Header';
import HeaderAdmin from './components/HeaderAdmin';
import Admin from './components/Admin';
import Homepage from './components/Homepage';
import AddItem from './components/AddItem';
import Login from './components/LoginForm';
import Menu from './components/Menu';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Header />
      <HeaderAdmin />
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/additem' element={<AddItem />} />
        <Route path='/loginform' element={<Login />} />
        <Route path='/menu' element={<Menu />} />
      </Routes>
    </>
  );
}

export default App;