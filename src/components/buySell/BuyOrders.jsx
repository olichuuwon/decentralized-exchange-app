import React from 'react'

function BuyOrders({ buys }) {

  if (buys.length === 0) return null;

  return (
    <div className="alert alert-dismissible alert-primary text-secondary">
      <div>
        <strong>Id:</strong>{" "}{buys.id}
      </div>
      <div> 
        <strong>Trader:</strong>{" "}{buys.trader}
      </div>
      <div>
        <strong>Ticker:</strong>{" "}{buys.ticker}{" "}
        <strong>Amount:</strong>{" "}{buys.amount}{" "}
        <strong>Filled:</strong>{" "}{buys.filled}
      </div>
      {buys.price == null ? (
         <div className='text-success'>
         <strong>Price:</strong> Market
       </div>
      ) : (
        <div className='text-success'>
        <strong>Price:</strong>{" "}{buys.price}
        <p className='text-secondary'>ETH</p>
      </div>
      )}
     
    </div>
  )
}

export default BuyOrders;