import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, InputGroup, FormControl } from 'react-bootstrap';
import { MdEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import Header from './HeaderAdmin';
import { Tab, Tabs } from 'react-bootstrap';
import "../../styles/Accounts.css";
import { host } from '../../apiRoutes';

const ManageAccounts = () => {
  const [selectedAccounts, setSelectedAccounts] = useState('customer');
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [accountType, setAccountType] = useState('');
  const [errors, setErrors] = useState({});
  const [newCashier, setNewCashier] = useState({
    name: '',
    username: '',
    password: '',
    role: 'cashier',
  });
  
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleTabSelect = (key) => {
    setSelectedAccounts(key);
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');

      const adminResponse = await axios.get(`${host}/api/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userResponse = await axios.get(`${host}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const superAdminResponse = await axios.get(`${host}/api/superadmins`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAdmins(adminResponse.data.admins || []);
      setUsers(userResponse.data.admins || []);
      setSuperAdmins(superAdminResponse.data.admins || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleEdit = (account, type) => {
    setEditAccount(account);
    setAccountType(type);
    setShowModal(true);
  };

  const handleDelete = (id, type) => {
    setAccountToDelete({ id, type });
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirmed = async ({ id, type }) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${host}/archive-account/${type}/${id}`, {}, { headers });
      fetchAccounts();
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Error archiving account:', error);
    }
  };

  const handleSave = async () => {
    const newErrors = {};

    if (!editAccount.name) newErrors.name = "Name is required.";
    if (!editAccount.username) newErrors.username = "Username is required.";
    if (!editAccount.password) newErrors.password = "Password is required.";
    if (accountType === 'user' && !editAccount.gender) newErrors.gender = "Gender is required.";
    if (accountType !== 'user' && !editAccount.role) newErrors.role = "Role is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const url = `${host}/edit-account/${accountType}/${editAccount.id || editAccount.superadminid || editAccount.userId}`;

      const res = await axios.get(`${host}/check-username/${accountType}`, {
        headers,
        params: { username: editAccount.username, id: editAccount.id || editAccount.superadminid || editAccount.userId }
      });

      if (res.data.exists) {
        newErrors.username = 'Username already taken.';
        setErrors(newErrors);
        return;
      }

      await axios.put(url, editAccount, { headers });
      setShowModal(false);
      fetchAccounts();
      setErrors({});
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (showModal) {
      setEditAccount({ ...editAccount, [name]: value });
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filterAccounts = (accounts) => {
    return accounts.filter(account => {
      const accountId = account.userId || account.superadminid || account.id;
      const accountName = account.name.toLowerCase();
      const accountUsername = account.username.toLowerCase();
      const accountGender = account.gender ? account.gender.toLowerCase() : ''; // Optional gender field for users

      // Check if any field matches the search query
      return (
        accountId.toString().includes(searchQuery.toLowerCase()) || // Search by ID
        accountName.includes(searchQuery.toLowerCase()) || // Search by Name
        accountUsername.includes(searchQuery.toLowerCase()) || // Search by Username
        accountGender.includes(searchQuery.toLowerCase()) // Search by Gender (for users)
      );
    });
  };

  return (
    <div>
      <Header />
      <div className="salesd">
        <div className="sales-header">
          <h1 className="display-6 sales-label">Accounts</h1>
          <div className="tab-sales-header">
            <Tabs activeKey={selectedAccounts} onSelect={handleTabSelect} id="sales-tab-example" className="tabs-sales mb-3" fill>
              <Tab eventKey="customer" title="Customer" />
              <Tab eventKey="cashier" title="Cashier" />
              <Tab eventKey="admin" title="Admin" />
            </Tabs>
          </div>
        </div>

        {selectedAccounts === 'customer' && (
          
          <div className="accountstbl">
            <div className="d-flex justify-content-end me-3">
              <InputGroup className="mb-3" style={{ maxWidth: '250px', width: '100%' }}>
                <FormControl
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search accounts"
                  className='search-account'
                />
            </InputGroup>
            </div>

            <Table hover responsive>
              <thead>
                <tr>
                  <th className="text-center">ID</th>
                  <th className="text-center">Name</th>
                  <th className="text-center">Gender</th>
                  <th className="text-center">Username</th>
                  <th className="text-center">Mobile No.</th>
                  <th className="text-center" style={{ width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterAccounts(users).map(user => (
                  <tr key={user.userId}>
                    <td className="text-center">{user.userId}</td>
                    <td className="text-center">{user.name}</td>
                    <td className="text-center">{user.gender}</td>
                    <td className="text-center">{user.username}</td>
                    <td className="text-center">{user.mobile_number}</td>
                    <td className="d-flex justify-content-between">
                      <Button variant="dark" id="edit-inventory" onClick={() => handleEdit(user, 'user')}>
                        <MdEdit />
                      </Button>
                      <Button variant="dark" id="delete-inventory" onClick={() => handleDelete(user.userId, 'user')}>
                        <FaRegTrashAlt />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {selectedAccounts === 'admin' && (
          <div className='accountstbl'>
            <Table hover responsive>
              <thead>
                <tr>
                  <th className='text-center'>ID</th>
                  <th className='text-center'>Name</th>
                  <th className='text-center'>Username</th>
                  <th className="text-center" style={{ width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterAccounts(superAdmins).map(superAdmin => (
                  <tr key={superAdmin.superadminid}>
                    <td className='text-center'>{superAdmin.superadminid}</td>
                    <td className='text-center'>{superAdmin.name}</td>
                    <td className='text-center'>{superAdmin.username}</td>
                    <td className='text-center'>
                      <Button variant="dark" id="edit-inventory" onClick={() => handleEdit(superAdmin, 'superadmin')}>
                        <MdEdit />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {selectedAccounts === 'cashier' && (
              <div className='accounts-table'>
                <Table hover responsive className="table-fixed">
                  <thead>
                    <tr>
                      <th className='text-center'>ID</th>
                      <th className='text-center'>Name</th>
                      <th className='text-center'>Username</th>
                      <th className="text-center" style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins?.map(admin => (
                      <tr key={admin.id}>
                        <td className='text-center'>{admin.id}</td>
                        <td className='text-center'>{admin.name}</td>
                        <td className='text-center'>{admin.username}</td>
                        <td className='text-center'>
                          <Button variant="dark" id="edit-inventory" onClick={() => handleEdit(admin, 'admin')}>
                            <MdEdit />
                          </Button>
                         </td>
                       </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          )}
      </div>

      <Modal 
        show={showDeleteConfirmation} 
        onHide={() => setShowDeleteConfirmation(false)} 
        dialogClassName="fullscreen-modal"  
        backdrop="static" 
        keyboard={false}>
      
        <Modal.Header closeButton>
          <Modal.Title className='text-danger'>Confirm Deletion</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this account? This action cannot be undone.
          </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant="dark" onClick={() => setShowDeleteConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="dark" className="food-save" onClick={() => handleDeleteConfirmed(accountToDelete)}>
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        dialogClassName="fullscreen-modal" 
        backdrop="static" 
        keyboard={false}>

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
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Username Field */}
              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                {accountType === 'superadmin' || accountType === 'user' ? (
                  <Form.Control
                    type="text"
                    name="username"
                    value={editAccount.username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                  />
                ) : (
                  <Form.Control
                    type="text"
                    name="username"
                    value={editAccount.username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                    disabled  // Disabled for other account types (e.g., admin)
                  />
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password Field - Editable only for cashiers */}
              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={editAccount.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Gender Field - Only for 'user' account type */}
              {accountType === 'user' && (
                <Form.Group controlId="formGender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Control
                    as="select"
                    name="gender"
                    value={editAccount.gender || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.gender}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.gender}
                  </Form.Control.Feedback>
                </Form.Group>
              )}
            </Form>
          )}
        </Modal.Body>
      <Modal.Footer className='d-flex justify-content-between'>
        <Button variant="dark" onClick={() => setShowModal(false)}>
          Close
        </Button>
        <Button variant="dark" className="food-save" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
    </div>
  );
};

export default ManageAccounts;
