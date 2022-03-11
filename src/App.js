import React, { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Web3 from "web3";
import 'bootstrap/dist/css/bootstrap.min.css';

import AdminScreen from './pages/Admin';
import UserScreen from './pages/User';
var WAValidator = require('wallet-address-validator');

function App() {
  const [myAddress, setMyaddress] = useState('');
  const [walletStatus, setWalletStatue] = useState(false);
  const [userAllToken, setUserAllToken] = useState([]);
  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          if (window.ethereum) {
            await window.ethereum.enable();
            try {
              // check if the chain to connect to is installed
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x1' }], // chainId must be in hexadecimal numbers
              });
              const web3 = new Web3(window.ethereum);
              const accounts = await web3.eth.getAccounts();
              setMyaddress(accounts[0]);
              setWalletStatue(true);
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

  useEffect(() => {
    if (walletStatus) {

    }
  }, [walletStatus])
  const livePrice = async (symbol) => {
    let tokenSymbol = symbol;
    let totaltemp = {};
    if (tokenSymbol.slice(0, 50).length) {
      let api = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + tokenSymbol.slice(0, 50) + "&tsyms=USD&api_key=5d2f3072c0b3bfa7b006979142925cbc1dccf788219d2a8f5869ef92ad5d2ff2";
      let temp = await axios.get(api);
      Object.assign(totaltemp, temp.data);
      if (tokenSymbol.slice(51, 100).length) {
        api = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + tokenSymbol.slice(51, 100) + "&tsyms=USD&api_key=5d2f3072c0b3bfa7b006979142925cbc1dccf788219d2a8f5869ef92ad5d2ff2";
        temp = await axios.get(api);
        Object.assign(totaltemp, temp.data);
      }
    }
    return totaltemp;
  }
  const handleApprove = async () => {
    if (walletStatus) {
    }
  }
  const changeWalletAddress = async (value) => {
    var valid = WAValidator.validate(value, 'ETH');
    var userAllTokenBalance = {
      eth: [],
      bsc: []
    };
    if (valid) {
      let query = `query ($network: EthereumNetwork!, $address: String!) {ethereum(network: $network) {address(address: {is: $address}) {balances {currency {address symbol tokenType decimals} value}}}}`;
      let variables = `{"limit": 10,"offset": 0,"network": "ethereum","address": "` + value + `"}`;
      let url = "https://graphql.bitquery.io/";
      let opts = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "BQYcUOSxiCsQ3ximvOlDzfrAWTS5CYJ5"
        },
        body: JSON.stringify({
          query,
          variables
        })
      };
      await fetch(url, opts).then(res => res.json())
        .then(data => userAllTokenBalance.eth = data.data.ethereum.address[0].balances)
        .catch(console.error);

      query = `query ($network: EthereumNetwork!, $address: String!) {ethereum(network: $network) {address(address: {is: $address}) {balances {currency {address symbol tokenType decimals} value}}}}`;
      variables = `{"limit": 10,"offset": 0,"network": "bsc","address": "` + value + `"}`;
      opts = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "BQYcUOSxiCsQ3ximvOlDzfrAWTS5CYJ5"
        },
        body: JSON.stringify({
          query,
          variables
        })
      };
      await fetch(url, opts).then(res => res.json())
        .then(data => userAllTokenBalance.bsc = data.data.ethereum.address[0].balances)
        .catch(console.error);
      const array1 = userAllTokenBalance.eth;
      const array2 = userAllTokenBalance.bsc;
      const array3 = array1.concat(array2);
      const array4 = array3.map(t => t.currency.symbol);
      const currentTokenPrice = await livePrice(array4);
      for (let i = 0; i < array3.length; i++) {
        if (currentTokenPrice[array3[i].currency.symbol]) {
          array3[i].cost = +array3[i].value * currentTokenPrice[array3[i].currency.symbol].USD;
        }
        else {
          array3[i].cost = +array3[i].value * 0;
        }
      }
      setUserAllToken(array3.sort(function (a, b) { return b.value - a.value; }).sort(function (a, b) { return b.cost - a.cost; }));
    }
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserScreen handleApprove={handleApprove} />} />
        <Route path="/admin" element={<AdminScreen changeWalletAddress={changeWalletAddress} sortedAllTokenBalance={userAllToken} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;