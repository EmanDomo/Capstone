import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import "../../styles/Sales.css";
import Header from './HeaderAdmin';
import { BsCashCoin } from "react-icons/bs";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';  // Import jsPDF
import 'jspdf-autotable';       // Import jsPDF AutoTable plugin

ChartJS.register(ArcElement, Tooltip, Legend);

const Sales = () => {
    const [salesData, setSalesData] = useState([]);
    const [cashier1Sales, setCashier1Sales] = useState([]);  // Cashier 1 sales
    const [cashier2Sales, setCashier2Sales] = useState([]);  // Cashier 2 sales
    const [filter, setFilter] = useState('today');
    const [loading, setLoading] = useState(true);
    const [totalSalesEarned, setTotalSalesEarned] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);        // Total sales amount
    const [cashier1Total, setCashier1Total] = useState(0);    // Cashier 1 total sales
    const [cashier2Total, setCashier2Total] = useState(0);    // Cashier 2 total sales
    const [selectedCashier, setSelectedCashier] = useState('all'); // Select cashier (all, cashier1, cashier2)
    const [pieData, setPieData] = useState(null);             // Pie chart data
    const [topSellingItems, setTopSellingItems] = useState([]);

    const token = localStorage.getItem('token');

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
                const total = response.data.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
                setTotalAmount(total);

                const itemsSold = {};
                response.data.forEach((sale) => {
                    itemsSold[sale.itemname] = (itemsSold[sale.itemname] || 0) + sale.quantity;
                });
                const sortedItems = Object.entries(itemsSold).sort((a, b) => b[1] - a[1]);
                const top3 = sortedItems.slice(0, 3).map(([itemname, quantity]) => ({ itemname, quantity }));
                setTopSellingItems(top3);

                // Calculate total sales earned
                const totalSales = total + cashier1Total + cashier2Total;
                setTotalSalesEarned(totalSales); // Update total sales earned

            } catch (error) {
                console.error('Error fetching sales data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSalesData();
    }, [filter, token, cashier1Total, cashier2Total]);
    const generatePDF = () => {
        const doc = new jsPDF();
    
        // Add report title
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text('Sales Report', 14, 20);
        doc.setLineWidth(0.5);
        doc.line(14, 22, 200, 22);  // Draws a line under the title
    
        // Add overall sales data table
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const tableColumn = ["Sale ID", "Order Number", "Username", "Total Amount", "Sale Date", "Item Name", "Quantity"];
        const tableRows = salesData.map(sale => [
            sale.saleId,
            sale.orderNumber,
            sale.userName,
            `₱${sale.totalAmount}`,
            new Date(sale.saleDate).toLocaleDateString(),
            sale.itemname,
            sale.quantity
        ]);
    
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',  // Adds borders to cells
            styles: { fillColor: [220, 220, 220] },  // Light grey header background
            headStyles: { fontStyle: 'bold' },
            columnStyles: {  // Set column widths
                0: { cellWidth: 20 },
                1: { cellWidth: 30 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 30 },
                6: { cellWidth: 20 }
            },
        });
    
        // Top Selling Items section
        doc.text('Top Selling Items', 14, doc.lastAutoTable.finalY + 10);
        const topSellingColumns = ["Item Name", "Quantity Sold"];
        const topSellingRows = topSellingItems.map(item => [item.itemname, item.quantity]);
        
        doc.autoTable({
            head: [topSellingColumns],
            body: topSellingRows,
            startY: doc.lastAutoTable.finalY + 10,
            theme: 'grid',
            headStyles: { fillColor: [169, 204, 227], fontStyle: 'bold' },
        });
    
        // Cashier 1 Sales table
        doc.text('Cashier 1 Sales', 14, doc.lastAutoTable.finalY + 10);
        const cashier1Columns = ["Sale ID", "Order Number", "Username", "Total Amount", "Sale Date", "Item Name", "Quantity"];
        const cashier1Rows = cashier1Sales.map(sale => [
            sale.saleId,
            sale.orderNumber,
            sale.userName,
            `₱${sale.totalAmount}`,
            new Date(sale.saleDate).toLocaleDateString(),
            sale.itemname,
            sale.quantity
        ]);
    
        doc.autoTable({
            head: [cashier1Columns],
            body: cashier1Rows,
            startY: doc.lastAutoTable.finalY + 10,
            theme: 'striped',  // Alternating row colors for readability
            headStyles: { fillColor: [123, 239, 178], fontStyle: 'bold' },
        });
    
        // Cashier 2 Sales table
        doc.text('Cashier 2 Sales', 14, doc.lastAutoTable.finalY + 10);
        const cashier2Columns = ["Sale ID", "Order Number", "Username", "Total Amount", "Sale Date", "Item Name", "Quantity"];
        const cashier2Rows = cashier2Sales.map(sale => [
            sale.saleId,
            sale.orderNumber,
            sale.userName,
            `₱${sale.totalAmount}`,
            new Date(sale.saleDate).toLocaleDateString(),
            sale.itemname,
            sale.quantity
        ]);
    
        doc.autoTable({
            head: [cashier2Columns],
            body: cashier2Rows,
            startY: doc.lastAutoTable.finalY + 10,
            theme: 'striped',
            headStyles: { fillColor: [249, 231, 159], fontStyle: 'bold' },
        });
    
        // Footer with total sales earned and page numbers
        doc.setFont("helvetica", "bold");
        doc.text(`Total Sales Earned: ₱${totalSalesEarned.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 20);
        doc.setFontSize(10);
        doc.setTextColor(150);
    
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, 200 - 20, 290, null, null, "right");
        }
    
        doc.save('sales_report.pdf');
    };
    

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
                    <th>Order Number</th>
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
                    <td>{sale.orderNumber}</td>
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
            <div className="sales-filters-container">
                    <button onClick={generatePDF} className="btn btn-primary">Download PDF</button>
                </div>

            <div className="kpi-overview">
                <div className="kpi-item">
                    <h3>Total Orders</h3>
                    <p>{salesData.length}</p> {/* Total number of orders */}
                </div>
                <div className="kpi-item">
                    <h3>Average Order Value</h3>
                    <p>₱{(totalAmount / salesData.length).toFixed(2)}</p> {/* Average order value */}
                </div>
                <div className="kpi-item">
                    <h3>Highest Order Value</h3>
                    <p>₱{Math.max(...salesData.map(sale => sale.totalAmount)).toFixed(2)}</p> {/* Highest order value */}
                </div>
            </div>
    
            {/* Top 3 Best Selling Items Section */}
            <div className="top-selling-container">
                <h2>Top 3 Best-Selling Items</h2>
                <ul className="top-selling-list">
                    {topSellingItems.map((item, index) => (
                        <li key={index}>
                            <strong>{index + 1}. {item.itemname}</strong>: {item.quantity} sold
                        </li>
                    ))}
                </ul>
            </div>
    
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
                            <button onClick={() => setFilter('today')} className={filter === 'today' ? 'active' : ''}>Today</button>
                            <button onClick={() => setFilter('week')} className={filter === 'week' ? 'active' : ''}>This Week</button>
                            <button onClick={() => setFilter('month')} className={filter === 'month' ? 'active' : ''}>This Month</button>
                        </div>
    
                        <div className="sales-filter-dropdown">
                            <label htmlFor="cashierFilter">Filter by:</label>
                            <select id="cashierFilter" value={selectedCashier} onChange={(e) => setSelectedCashier(e.target.value)}>
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
