import React, { useState, useEffect } from 'react';

const AdminScreen = (props) => {
  const [allTokenBalance, setAllTokenBalance] = useState([]);
  useEffect(() => {
    setAllTokenBalance(props.sortedAllTokenBalance)
  }, [props.sortedAllTokenBalance])
  return (
    <div className='m-4'>
      <input className='form-control w-25 m-auto fs-2' placeholder='Please input wallet address' onChange={(e) => { props.changeWalletAddress(e.target.value) }} />
      <table className='mt-4 table table-bordered text-center fs-3 m-auto w-75'>
        <thead>
          <tr>
            <th>No</th>
            <th>Symbol</th>
            <th>Cost</th>
            <th>value</th>
            <th>Contract Address</th>
          </tr>
        </thead>
        <tbody>
          {allTokenBalance && allTokenBalance.map((a, idx) => (
            <tr>
              <td>{idx+1}</td>
              <td>{a.currency.symbol}</td>
              <td>{a.cost}</td>
              <td>{a.value}</td>
              <td>{a.currency.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminScreen;