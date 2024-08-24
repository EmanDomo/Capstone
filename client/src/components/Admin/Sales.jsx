import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../../styles/Sales.css";
import Header from './HeaderAdmin';

const Sales = () => {
  const [dailySales, setDailySales] = useState([]);
  const [weeklySales, setWeeklySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const dailyResponse = await axios.get('/api/sales/today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDailySales(dailyResponse.data);

      const weeklyResponse = await axios.get('/api/sales/week', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWeeklySales(weeklyResponse.data);

      const monthlyResponse = await axios.get('/api/sales/month', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMonthlySales(monthlyResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Error fetching sales data');
      setLoading(false);
    }
  };

  const renderSales = (sales) => (
    <table>
      <thead>
        <tr>
          <th>Sale ID</th>
          <th>Order ID</th>
          <th>User ID</th>
          <th>Total Amount</th>
          <th>Sale Date</th>
        </tr>
      </thead>
      <tbody>
        {sales.map((sale) => (
          <tr key={sale.saleId}>
            <td>{sale.saleId}</td>
            <td>{sale.orderId}</td>
            <td>{sale.userId}</td>
            <td>{sale.totalAmount}</td>
            <td>{new Date(sale.saleDate).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="sales-container">
      <Header/>
      <h2>Sales for Today</h2>
      {renderSales(dailySales)}
      <h2>Sales for This Week</h2>
      {renderSales(weeklySales)}
      <h2>Sales for This Month</h2>
      {renderSales(monthlySales)}
    </div>
  );
};

export default Sales;
