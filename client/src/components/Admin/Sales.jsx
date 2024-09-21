import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import "../../styles/Sales.css";
import Header from './HeaderAdmin';
import { BsCashCoin } from "react-icons/bs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Sales = () => {
    const [salesData, setSalesData] = useState([]);
    const [cashier1Sales, setCashier1Sales] = useState([]);
    const [cashier2Sales, setCashier2Sales] = useState([]);
    const [filter, setFilter] = useState('month');
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    const [cashier1Total, setCashier1Total] = useState(0); // Total for Cashier 1
    const [cashier2Total, setCashier2Total] = useState(0); // Total for Cashier 2
    const [pieData, setPieData] = useState(null); // Pie chart data

    const token = localStorage.getItem('token');

    // Fetch sales data for today (for Pie chart)
    useEffect(() => {
        const fetchTodaySalesData = async () => {
            try {
                const response = await axios.get('/api/sales/today', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const itemsSold = {};
                response.data.forEach((sale) => {
                    itemsSold[sale.itemname] = (itemsSold[sale.itemname] || 0) + 1;
                });

                const labels = Object.keys(itemsSold);
                const data = Object.values(itemsSold);

                setPieData({
                    labels,
                    datasets: [{
                        label: 'Items Sold Today',
                        data,
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                        ],
                        hoverBackgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                        ]
                    }]
                });
            } catch (error) {
                console.error('Error fetching today\'s sales data:', error);
            }
        };

        fetchTodaySalesData();
    }, [token]);

    // Fetch sales data for Cashier 1
    useEffect(() => {
        const fetchCashier1Sales = async () => {
            try {
                const response = await axios.post('/api/cashier1Sales', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCashier1Sales(response.data);

                // Calculate total for Cashier 1
                const total = response.data.reduce((sum, sale) => {
                    const amount = parseFloat(sale.totalAmount);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);
                setCashier1Total(total);

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

                // Calculate total for Cashier 2
                const total = response.data.reduce((sum, sale) => {
                    const amount = parseFloat(sale.totalAmount);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);
                setCashier2Total(total);

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
        <div>
            <Header />
            <div className="sales-page-wrapper">
                {/* Pie Chart and Total Revenue */}
                <div className="pie-chart-container">
                    {pieData && <Pie data={pieData} height={200} width={200} />} {/* Smaller size */}
                    <div className="total-amount">
                        <h2>Total Sales Revenue: ₱{Number(totalAmount).toFixed(2)}</h2>
                        <h3>Cashier 1 Sales: ₱{Number(cashier1Total).toFixed(2)}</h3>
                        <h3>Cashier 2 Sales: ₱{Number(cashier2Total).toFixed(2)}</h3>
                    </div>
                </div>

                {/* Rest of the sales dashboard */}
                <div className="sales-dashboard">
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
        </div>
    );
};

export default Sales;
