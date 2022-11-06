import React from 'react'

function LimitOrders({ limitTx }) {

  if (limitTx === 0) return null;

  return (
    <>
     {limitTx.map((limit) => (
      <div key={limit.id} className="alert alert-dismissible alert-primary">
           <div className='text-secondary'>
         <strong>Side:</strong>{" "}{limit.side}
        </div>
        <div className='text-secondary'>
         <strong>Trader:</strong>{" "}{limit.trader}
        </div>
        <div className='text-secondary'>
         <strong>Symbol:</strong>{" "}{limit.ticker}
        </div>
        <div>
         <strong>Amount:</strong>{limit.side === 0 ?
         (<p className='text-success'>{limit.amount}</p>)
         :
         (<p className='text-warning'>{limit.amount}</p>)
         }
        </div>
        <div>
         <strong>Price:</strong>{" "}{limit.price} ETH
        </div>
        <div className='text-secondary'>
         <strong>Time:</strong>{" "}{limit.time}
        </div>
      </div>
    ))}
    </>
  )
}

export default LimitOrders
