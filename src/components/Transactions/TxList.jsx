import React from 'react';
// transaction list for ERC20 token contract events

function TxList({ txs }) {

  if (txs.length === 0) return null;

  return (
    <>
      {txs.map((item, index) => (
        <div key={index} className="alert alert-dismissible alert-primary">
          <div>
            <strong>From:</strong>{" "}{item.from}
          </div>
          <div>
            <strong>To:</strong>{" "}{item.to}
          </div>
          <div>
            <strong>Amount:</strong>{" "}{item.amount}
          </div>
              <a href={`https://ropsten.etherscan.io/tx/${item.txHash}`}>
                  Check in block explorer
              </a>
        </div>
      ))}
    </>
  )
}

export default TxList;