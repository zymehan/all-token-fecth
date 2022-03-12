import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminScreen = () => {
  const [products, setProduct] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    const response = await axios.get('http://localhost:5000/products');
    setProduct(response.data);
  }
  return (
    <div className='m-4 text-center'>
      <h1 className='w-25 m-auto mt-4'>Approved User List</h1>
      <input className='w-25 mt-4' type="" />
      <table className='mt-4 table table-bordered text-center fs-3 m-auto w-75'>
        <thead>
          <tr>
            <th>No</th>
            <td><input type="checkbox" width={100} /></td>
            <th>User Wallet Address</th>
            <th>Cost</th>
            <th>Symbol</th>
          </tr>
        </thead>
        <tbody>
          {products && products.map((a, idx) => (
            <tr>
              <td>{idx + 1}</td>
              <td><input type="checkbox" width={50} /></td>
              <td>{a.userWalletAddress}</td>
              <td>{a.amount}</td>
              <td>{a.symbol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminScreen;