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
import { Tab, Tabs } from 'react-bootstrap'; // Make sure you have this import
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { Table, Button } from 'react-bootstrap';
import { MdEdit } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import { FaRegFilePdf } from "react-icons/fa6";
import ListGroup from 'react-bootstrap/ListGroup';
import { Row, Col, Card } from 'react-bootstrap';
import { host } from '../../apiRoutes';

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

    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                align: 'start',
                labels: {
                    boxWidth: 20,
                    padding: 20,
                    font: {
                        size: 14, // Font size
                        family: 'Arial', // Font family
                        // weight: 'bold', 
                        // style: 'italic', 
                    },
                    color: '#333' // Change the text color
                },
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw}`;
                    }
                }
            },
            datalabels: {
                color: '#fff',
                formatter: (value, context) => {
                    const label = context.chart.data.labels[context.dataIndex];
                    return `${label}: ${value}`;
                },
                anchor: 'end',
                align: 'end',
            }
        }
    };
    
    useEffect(() => {
        const fetchSalesData = async () => {
            setLoading(true);
            try {
                let response;
                if (filter === 'today') {
                    response = await axios.get(`${host}/api/sales/today`, { headers: { 'Authorization': `Bearer ${token}` } });
                } else if (filter === 'week') {
                    response = await axios.get(`${host}/api/sales/week`, { headers: { 'Authorization': `Bearer ${token}` } });
                } else {
                    response = await axios.get(`${host}/api/sales/month`, { headers: { 'Authorization': `Bearer ${token}` } });
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
        
        // Filter sales data based on selected cashier and date filter
        let filteredSalesData = salesData;
        let totalSales = 0; // Initialize total sales
        if (selectedCashier !== 'all') {
            filteredSalesData = selectedCashier === 'cashier1' ? cashier1Sales : cashier2Sales;
            totalSales = selectedCashier === 'cashier1' ? cashier1Total : cashier2Total; // Get total from the appropriate state
        } else {
            totalSales = totalAmount; // Total from all sales
        }

        const tableRows = filteredSalesData.map(sale => [
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
    
        // Footer with total sales earned and page numbers
        doc.setFont("helvetica", "bold");
        doc.text(`Total Sales Earned: ₱${totalSales.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 20);
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
                const response = await axios.get(`${host}/api/sales/today`, {
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
                response = await axios.post(`${host}/api/cashier1Sales`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else if (filter === 'week') {
                response = await axios.post(`${host}/api/cashier1SalesWeek`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else if (filter === 'month') {
                response = await axios.post(`${host}/api/cashier1SalesMonth`, {}, {
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
                response = await axios.post(`${host}/api/cashier2Sales`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else if (filter === 'week') {
                response = await axios.post(`${host}/api/cashier2SalesWeek`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else if (filter === 'month') {
                response = await axios.post(`${host}/api/cashier2SalesMonth`, {}, {
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
                    response = await axios.get(`${host}/api/sales/today`, { headers: { 'Authorization': `Bearer ${token}` } });
                } else if (filter === 'week') {
                    response = await axios.get(`${host}/api/sales/week`, { headers: { 'Authorization': `Bearer ${token}` } });
                } else {
                    response = await axios.get(`${host}/api/sales/month`, { headers: { 'Authorization': `Bearer ${token}` } });
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
            <div className='sales-tables mt-2'>
            <Table responsive className="table-fixed-sales">
                <thead className='position-sticky z-3'>
                    <tr>
                        <th className='text-center'>Sale ID</th>
                        <th className='text-center'>Order Number</th>
                        <th className='text-center'>Username</th>
                        <th className='text-center'>Total Amount</th>
                        <th className='text-center'>Sale Date</th>
                        <th className='text-center'>Item Name</th>
                        <th className='text-center'>Quantity</th>
                        <th className='text-center' style={{ width: '120px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(sale => (
                        <tr key={sale.saleId}>
                            <td className='text-center'>{sale.saleId}</td>
                            <td className='text-center'>{sale.orderNumber}</td>
                            <td className='text-center'>{sale.userName}</td>
                            <td className='text-center'>₱ {sale.totalAmount}</td>
                            <td className='text-center'>{new Date(sale.saleDate).toLocaleDateString()}</td>
                            <td className='text-center'>{sale.itemname}</td>
                            <td className='text-center'>{sale.quantity}</td>
                            <td className='text-center'>
                                <div className='d-flex justify-content-between sales-action-buttons'>
                                    <Button id='edit-sale'><MdEdit /></Button>
                                    <Button id='delete-sale'><FaRegTrashAlt /></Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>

        );
    };
    const [selectedSales, setSelectedSales] = useState('dashboard');

    const handleTabSelect = (key) => {
        setSelectedSales(key);
    };

    const [error, setError] = useState(null);
    const [top, setTop] = useState([]);
    useEffect(() => {

        getTop();
    
      }, []);
      const getTop = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${host}/top-selling-sales`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (res.status === 200) {
                setTop(res.data.data);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            setError(error.response ? error.response.data : error.message);
        } finally {
            setLoading(false);
        }
    };

      
      // In your component:
      <div style={{ width: '100%', height: '300px' }}>
        <Pie data={pieData} options={options} />
      </div>
    return ( 
        <div>
            <Header />
            <div className="salesd">
                <div className='d-flex justify-content-between'>
                    <div className="sales-header">
                        <h1 className="display-6 sales-label">Sales</h1>
                        <div className="tab-sales-header">
                            <Tabs
                                activeKey={selectedSales}
                                onSelect={handleTabSelect}
                                id="sales-tab-example"
                                className="tabs-sales mb-3"
                                fill
                            >
                                <Tab eventKey="dashboard" title="Dashboard" />
                                <Tab eventKey="overview" title="Overview" />
                            </Tabs>
                        </div>
                    </div>
                    <div className="sales-pdf-container">
                        {/* <label htmlFor="sales-report" className='label-sales-report pe-2'>Generate Report:</label> */}
                        <button onClick={generatePDF} className="btn btn-primary" id='sales-report'>Print <FaRegFilePdf /></button>
                    </div>
                </div>
                {/* Render content based on selectedSales */}
                {selectedSales === 'dashboard' && 
                    <div>
                        <div className="sales-filters-container d-flex flex-row-reverse">
                            <div className="sales-filter-dropdown d-flex">
                                <label htmlFor="cashier-filter-dropdown" className='cashier-sales-label me-3'>Filter by: </label>
                                <DropdownButton 
                                    id="cashier-filter-dropdown" 
                                    title={selectedCashier === 'all' ? 'All Sales' : selectedCashier === 'cashier1' ? 'Cashier 1' : 'Cashier 2'} 
                                    className="me-2"
                                >
                                    <Dropdown.Item as="button" onClick={() => setSelectedCashier('all')} active={selectedCashier === 'all'}>
                                        All Sales
                                    </Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={() => setSelectedCashier('cashier1')} active={selectedCashier === 'cashier1'}>
                                        Cashier 1
                                    </Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={() => setSelectedCashier('cashier2')} active={selectedCashier === 'cashier2'}>
                                        Cashier 2
                                    </Dropdown.Item>
                                </DropdownButton>
                            </div>
                            <div className="sales-filters d-flex">
                                <label htmlFor="filter-dropdown" className='date-sales-label me-3'>Date: </label>
                                <DropdownButton 
                                    id="filter-dropdown" 
                                    title={filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'This Month'} 
                                    className="me-5"
                                >
                                    <Dropdown.Item as="button" onClick={() => setFilter('today')} active={filter === 'today'}>
                                        Today
                                    </Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={() => setFilter('week')} active={filter === 'week'}>
                                        This Week
                                    </Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={() => setFilter('month')} active={filter === 'month'}>
                                        This Month
                                    </Dropdown.Item>
                                </DropdownButton>
                            </div>
                        </div>
                        {/* Sales Table */}
                        {renderSalesTable(salesData)}
                    </div>
                }
                {selectedSales === 'overview' && 
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-12 col-lg-6">
                                    <div className='pie-container1 mb-4'>                       
                                        <Pie data={pieData} options={options} />
                                    </div>
                                <div>
                                <Card className="m-auto">
                                <Card.Body>
                                    <Card.Title>Revenue Summary</Card.Title>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>         
                                            <div className='d-flex justify-content-between'>
                                                <label htmlFor=""> <BsCashCoin size={24} color="#ff69b4" /> All Sales: </label>
                                                <span className="amount-allsales fw-bold"> ₱{Number(totalAmount).toFixed(2)}</span>
                                            </div>
                                            
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <div className='d-flex justify-content-between'>
                                                <label htmlFor=""><BsCashCoin size={24} color="#000000" /> Cashier 1 Sales: </label>
                                                <span className="amount"> ₱{Number(cashier1Total).toFixed(2)}</span>
                                            </div>                                         
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <div className='d-flex justify-content-between'>
                                                <label htmlFor=""><BsCashCoin size={24} color="#000000" /> Cashier 2 Sales</label>
                                                <span className="amount"> ₱{Number(cashier2Total).toFixed(2)}</span>
                                            </div>
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                                </div>
                            </div>
                            <div className="col-12 col-lg-6">
                                <div className='container-fluid m-auto best-selling-sales mb-4'>
                                    <h4 className='text-center'>Top 3 Best Selling</h4>
                                    <Row xs={1} md={3} lg={3} className="g-4">
                                        {top.length > 0 ? (
                                        top.map((item, index) => (
                                        <Col key={index}>
                                            <Card id="sales-card">
                                                    <Card.Img variant="top" src={`/uploads/${item.img}`} className="sales-itm"/>
                                                <Card.Body>
                                                <Card.Title>{item.itemname}</Card.Title>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        ))
                                        ) : (
                                        <Col>
                                            <Card>
                                                <Card.Body>
                                                    <Card.Text>No top-selling items available.</Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        )}
                                    </Row>
                                </div>
                                <div className='order-summary-sales'>
                                    <Card className="m-auto">
                                        <Card.Body>
                                            <Card.Title>Order Summary</Card.Title>
                                            <ListGroup variant="flush">
                                                <ListGroup.Item>
                                                    <div className='d-flex justify-content-between'>
                                                        <label htmlFor="">Total Orders: </label>
                                                        <span className="amount-allsales fw-bold">{salesData.length}</span>
                                                    </div>
                                                </ListGroup.Item>
                                                <ListGroup.Item>
                                                    <div className='d-flex justify-content-between'>
                                                        <label htmlFor="">Average Order Value: </label>
                                                        <span className="amount">₱{(totalAmount / salesData.length).toFixed(2)}</span>
                                                    </div>
                                                </ListGroup.Item>
                                                <ListGroup.Item>
                                                    <div className='d-flex justify-content-between'>
                                                        <label htmlFor="">Highest Order Value: </label>
                                                        <span className="amount">₱{Math.max(...salesData.map(sale => sale.totalAmount)).toFixed(2)}</span>
                                                    </div>
                                                </ListGroup.Item>
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
         
                }
            </div>
        </div>
     );
}
 
export default Sales;