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
    const [cashier1Sales, setCashier1Sales] = useState([]);  // Cashier 1 sales
    const [cashier2Sales, setCashier2Sales] = useState([]);  // Cashier 2 sales
    const [filter, setFilter] = useState('today');
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);        // Total sales amount
    const [cashier1Total, setCashier1Total] = useState(0);    // Cashier 1 total sales
    const [cashier2Total, setCashier2Total] = useState(0);    // Cashier 2 total sales
    const [selectedCashier, setSelectedCashier] = useState('all'); // Select cashier (all, cashier1, cashier2)
    const [pieData, setPieData] = useState(null);             // Pie chart data

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
                    itemsSold[sale.itemname] = (itemsSold[sale.itemname] || 0) + sale.quantity;
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
   // Fetch sales data for Cashier 1
useEffect(() => {
    const fetchCashier1Sales = async () => {
        try {
            let response;
            if (filter === 'today') {
                response = await axios.post('/api/cashier1Sales', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else if (filter === 'week') {
                response = await axios.post('/api/cashier1SalesWeek', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else if (filter === 'month') {
                response = await axios.post('/api/cashier1SalesMonth', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            setCashier1Sales(response.data);

            // Calculate total for Cashier 1
            const total = response.data.reduce((sum, sale) => {
                const amount = parseFloat(sale.totalAmount);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);
            setCashier1Total(total);

        } catch (error) {
            console.error('Error fetching cashier1 sales:', error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedCashier === 'cashier1' || selectedCashier === 'all') {
        fetchCashier1Sales(); // Always fetch cashier1 sales when filter or cashier changes
    }
}, [filter, selectedCashier, token]);

// Fetch sales data for Cashier 2
useEffect(() => {
    const fetchCashier2Sales = async () => {
        try {
            let response;
            if (filter === 'today') {
                response = await axios.post('/api/cashier2Sales', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else if (filter === 'week') {
                response = await axios.post('/api/cashier2SalesWeek', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else if (filter === 'month') {
                response = await axios.post('/api/cashier2SalesMonth', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            setCashier2Sales(response.data);

            // Calculate total for Cashier 2
            const total = response.data.reduce((sum, sale) => {
                const amount = parseFloat(sale.totalAmount);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);
            setCashier2Total(total);

        } catch (error) {
            console.error('Error fetching cashier2 sales:', error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedCashier === 'cashier2' || selectedCashier === 'all') {
        fetchCashier2Sales(); // Always fetch cashier2 sales when filter or cashier changes
    }
}, [filter, selectedCashier, token]);



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

    // Render the sales table based on selected cashier filter
    const renderSalesTable = (data) => {
        if (loading) return <p>Loading sales data...</p>;
        if (data.length === 0) return <p>No sales data available.</p>;

        let filteredData = data;

        // Apply filter based on selected cashier
        if (selectedCashier === 'cashier1') {
            filteredData = cashier1Sales;
        } else if (selectedCashier === 'cashier2') {
            filteredData = cashier2Sales;
        }

        return (
            <div className="table-wrapper">
            <table className="styled-table">
                <thead>
                <tr>
                    <th>Sale ID</th>
                    <th>Order ID</th>
                    <th>Username</th>
                    <th>Total Amount</th>
                    <th>Sale Date</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                </tr>
                </thead>
                <tbody>
                {filteredData.map(sale => (
                    <tr key={sale.saleId}>
                    <td>{sale.saleId}</td>
                    <td>{sale.orderId}</td>
                    <td>{sale.userName}</td>
                    <td>₱{sale.totalAmount}</td>
                    <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                    <td>{sale.itemname}</td>
                    <td>{sale.quantity}</td>
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
    <h2>Revenue Summary</h2>
    <div className="total-item">
        <BsCashCoin size={24} color="#4CAF50" />
        <div>
            <h3>All Sales</h3>
            <p className="amount">₱{Number(totalAmount).toFixed(2)}</p>
        </div>
    </div>
    <div className="total-item">
        <BsCashCoin size={24} color="#2196F3" />
        <div>
            <h3>Cashier 1 Sales</h3>
            <p className="amount">₱{Number(cashier1Total).toFixed(2)}</p>
        </div>
    </div>
    <div className="total-item">
        <BsCashCoin size={24} color="#FF9800" />
        <div>
            <h3>Cashier 2 Sales</h3>
            <p className="amount">₱{Number(cashier2Total).toFixed(2)}</p>
        </div>
    </div>
</div>


                </div>
                <div className="sales-dashboard">
    <div className="sales-header">
        <h1>Sales Dashboard</h1>
    </div>

    {/* Sales Filter Dropdown */}
    <div className="sales-filters-container">
  <div className="sales-filters">
    <button 
      onClick={() => setFilter('today')} 
      className={filter === 'today' ? 'active' : ''}>
      Today
    </button>
    <button 
      onClick={() => setFilter('week')} 
      className={filter === 'week' ? 'active' : ''}>
      This Week
    </button>
    <button 
      onClick={() => setFilter('month')} 
      className={filter === 'month' ? 'active' : ''}>
      This Month
    </button>
  </div>
  
  <div className="sales-filter-dropdown">
    <label htmlFor="cashierFilter">Filter by:</label>
    <select 
      id="cashierFilter" 
      value={selectedCashier} 
      onChange={(e) => setSelectedCashier(e.target.value)}>
      <option value="all">All Sales</option>
      <option value="cashier1">Cashier 1</option>
      <option value="cashier2">Cashier 2</option>
    </select>
  </div>
</div>



    {/* Sales Table */}
    {renderSalesTable(salesData)}
</div>

            </div>
        </div>
    );
};

export default Sales;
