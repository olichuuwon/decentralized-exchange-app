import React from 'react';

function TradingHeader() {
  return (
    <>
       {/* TRADING  */}
       <header className='container-4'>
        <div className='box-1'>
          <div>
            <div className='m-4'>
              <main className="mt-4 p-4">
                <h1 className="text-xl font-semibold text-warning text-left">
                  PERFORM TRADES
                </h1>
                <p><small style={{color: "white"}}>Under Order Book History</small> </p>
                <p><small style={{color: "white"}}>Side 0 is Buy and Side 1 is Sell</small> </p>
              </main>
              
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default TradingHeader;