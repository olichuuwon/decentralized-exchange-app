import React from 'react'

function DexBalances({ dexBalanceInfo }) {

  if (dexBalanceInfo === 0) return null;

  return (
    <>
      {dexBalanceInfo.map((dex, index) => (
        <div key={index}>
        <div>
        <strong>Address:</strong> {dex.address}
        </div>
        <div>
        <strong>Amount:</strong> {dex.amount} {dex.ticker}
        </div>
      </div>
      ))}
    </>
  )
}

export default DexBalances;