import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../../styles/Sales.css";
import Header from './HeaderAdmin';

const Sales = () => {
    const [salesData, setSalesData] = useState([]);
    const [cashier1Sales, setCashier1Sales] = useState([]);
    const [cashier2Sales, setCashier2Sales] = useState([]);
    const [filter, setFilter] = useState('month');
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);

    const token = localStorage.getItem('token');

    // Fetch sales data for Cashier 1
    useEffect(() => {
        const fetchCashier1Sales = async () => {
            try {
                const response = await axios.post('/api/cashier1Sales', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCashier1Sales(response.data);
            } catch (error) {
                console.error('Error fetching cashier1 sales:', error);
            }
        };

        fetchCashier1Sales();
    }, [token]);

    // Fetch sales data for Cashier 2
    useEffect(() => {
        const fetchCashier2Sales = async () => {
            try {
                const response = await axios.post('/api/cashier2Sales', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCashier2Sales(response.data);
            } catch (error) {
                console.error('Error fetching cashier2 sales:', error);
            }
        };

        fetchCashier2Sales();
    }, [token]);

    // Fetch main sales data based on filter
    useEffect(() => {
        const fetchSalesData = async () => {
            setLoading(true);
            try {
                let response;
                if (filter === 'today') {
                    response = await axios.get('/api/sales/today', { headers: { 'Authorization': `Bearer ${token}` } });
                } else if (filter === 'week') {
                    response = await axios.get('/api/sales/week', { headers: { 'Authorization': `Bearer ${token}` } });
                } else {
                    response = await axios.get('/api/sales/month', { headers: { 'Authorization': `Bearer ${token}` } });
                }
                setSalesData(response.data);
                const total = response.data.reduce((sum, sale) => {
                    const amount = parseFloat(sale.totalAmount);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);
                setTotalAmount(total);
            } catch (error) {
                console.error('Error fetching sales data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSalesData();
    }, [filter, token]);

    const renderSalesTable = (data) => {
        if (loading) return <p>Loading sales data...</p>;
        if (data.length === 0) return <p>No sales data available.</p>;
        return (
            <div className="table-wrapper">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Order ID</th>
                            <th>Username</th>
                            <th>Total Amount</th>
                            <th>Sale Date</th>
                            <th>Item Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(sale => (
                            <tr key={sale.saleId}>
                                <td>{sale.saleId}</td>
                                <td>{sale.orderId}</td>
                                <td>{sale.userName}</td>
                                <td>{sale.totalAmount}</td>
                                <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                                <td>{sale.itemname}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="sales-page-wrapper">
            <div className="sales-dashboard">
                <Header />
                <div className="sales-header">
                    <h1>Sales Dashboard</h1>
                    <div className="sales-filters">
                        <button onClick={() => setFilter('today')} className={filter === 'today' ? 'active' : ''}>Today</button>
                        <button onClick={() => setFilter('week')} className={filter === 'week' ? 'active' : ''}>This Week</button>
                        <button onClick={() => setFilter('month')} className={filter === 'month' ? 'active' : ''}>This Month</button>
                    </div>
                </div>

                <div className="sales-content">
                    <h2>All Sales</h2>
                    {renderSalesTable(salesData)}

                    <div className="total-amount">
                        <h2>Total Sales Revenue: {Number(totalAmount).toFixed(2)}</h2>
                    </div>

                    <div className="cashier-tables">
                        <div className="cashier-table">
                            <h3>Cashier 1 Sales</h3>
                            {renderSalesTable(cashier1Sales)}
                        </div>
                        <div className="cashier-table">
                            <h3>Cashier 2 Sales</h3>
                            {renderSalesTable(cashier2Sales)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;
