import React from 'react';

function SellOrders({ sells }) {

  if (sells.length === 0) return null;

  return (
    <div className="alert alert-dismissible alert-primary text-secondary">
       <div>
        <strong>Id:</strong>{" "}{sells.id}
      </div>
      <div>
        <strong>Trader:</strong>{" "}{sells.trader}
      </div>
      <div>
        <strong>Ticker:</strong>{" "}{sells.ticker}{" "}
        <strong>Amount:</strong>{" "}{sells.amount}{" "}
        <strong>Filled:</strong>{" "}{sells.filled}
      </div>
      {sells.price == null ? (
         <div className='text-danger'>
         <strong>Price:</strong> Market
       </div>
      ) : (
        <div className='text-danger'>
        <strong>Price:</strong>{" "}{sells.price}
        <p className='text-secondary'>ETH</p>
      </div>
      )}
    </div>
  )
}

export default SellOrders;