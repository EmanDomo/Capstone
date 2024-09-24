import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import "../../styles/Accounts.css";
import Header from './HeaderAdmin';

const Accounts = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [accountType, setAccountType] = useState('');
  
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token'); // Or wherever you store the token
  
      const adminResponse = await axios.get('/api/admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userResponse = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const superAdminResponse = await axios.get('/api/superadmins', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setAdmins(adminResponse.data.admins);
      setUsers(userResponse.data.admins);
      setSuperAdmins(superAdminResponse.data.admins);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };
  

  const handleEdit = (account, type) => {
    setEditAccount(account);
    setAccountType(type);
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    try {
      if (type === 'admin') {
        await axios.delete(`/api/admins/${id}`);
      } else if (type === 'user') {
        await axios.delete(`/api/users/${id}`);
      } else if (type === 'superadmin') {
        await axios.delete(`/api/superadmins/${id}`);
      }
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleSave = async () => {
    try {
      let url = `/edit-accounts/${accountType}/${editAccount.id || editAccount.superadminid || editAccount.userId}`;
      
      await axios.put(url, editAccount);
      
      setShowModal(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };
  

  const handleChange = (e) => {
    setEditAccount({ ...editAccount, [e.target.name]: e.target.value });
  };

  return (
    <div>
        <Header />

    <div className="accounts-container">
      <h2>Manage Accounts</h2>

      <div className="account-section">
        <h3>Admins</h3>
        <Table striped bordered hover responsive="md" className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {superAdmins.map(superAdmin => (
              <tr key={superAdmin.superadminid}>
                <td>{superAdmin.superadminid}</td>
                <td>{superAdmin.name}</td>
                <td>{superAdmin.username}</td>
                <td>{superAdmin.role}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEdit(superAdmin, 'superadmin')}>Edit</Button>{' '}
                  <Button variant="danger" onClick={() => handleDelete(superAdmin.superadminid, 'superadmin')}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Admin Accounts */}
      <div className="account-section">
        <h3>Cashier</h3>
        <Table striped bordered hover responsive="md" className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id}>
                <td>{admin.id}</td>
                <td>{admin.name}</td>
                <td>{admin.username}</td>
                <td>{admin.role}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEdit(admin, 'admin')}>Edit</Button>{' '}
                  <Button variant="danger" onClick={() => handleDelete(admin.id, 'admin')}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* User Accounts */}
      <div className="account-section">
        <h3>Users</h3>
        <Table striped bordered hover responsive="md" className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.name}</td>
                <td>{user.gender}</td>
                <td>{user.username}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEdit(user, 'user')}>Edit</Button>{' '}
                  <Button variant="danger" onClick={() => handleDelete(user.userId, 'user')}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {/* Edit Account Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editAccount && (
            <Form>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editAccount.name}
                  onChange={handleChange}
                />
              </Form.Group>

              {accountType !== 'user' && (
                <Form.Group controlId="formRole">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    type="text"
                    name="role"
                    value={editAccount.role}
                    onChange={handleChange}
                  />
                </Form.Group>
              )}

              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={editAccount.username}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={editAccount.password}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </div>
  );
};

export default Accounts;
