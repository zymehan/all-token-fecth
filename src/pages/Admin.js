import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from "react-notifications";

import 'react-notifications/lib/notifications.css';

const AdminScreen = () => {
  const [products, setProduct] = useState([]);
  const [transferAmount, setTransferAmount] = useState(0);
  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    const response = await axios.get('http://localhost:5000/products');
    setProduct(response.data);
  }

  const handleChangeAmount = (value) => {
    setTransferAmount(value);
  }
  const handleTransfer = (token) => {
    console.log(token, transferAmount);
    if (transferAmount === 0) {
      NotificationManager.warning('Transfer Amount is not 0.', 'Transfer Amount Warning', 3000);
    }
    else {
    }
  }
  return (
    <div className='m-4 text-center'>
      <h1 className='w-25 m-auto mt-4'>Approved User List</h1>
      <table className='mt-4 table table-bordered text-center fs-3 m-auto w-75'>
        <thead>
          <tr>
            <th>No</th>
            <td><input type="checkbox" /></td>
            <th>User Address</th>
            <th>Amount</th>
            <th>Symbol</th>
            <th>Manage Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products && products.map((a, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td><input type="checkbox" width={50} /></td>
              <td>{a.userWalletAddress.slice(0, 5) + '...' + a.userWalletAddress.slice(-4, a.userWalletAddress.length)}</td>
              <td>{a.amount}</td>
              <td>{a.symbol}</td>
              <td><input className='form-control' type="number" onChange={(e) => handleChangeAmount(e.target.value)} /></td>
              <td><button className='form-control' type="number" onClick={() => { handleTransfer(a) }} >Transfer</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <NotificationContainer />
    </div>
  );
};

export default AdminScreen;