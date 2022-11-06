import React, { useEffect } from 'react';
import { ethers } from "ethers";
import { v4 as uuidv4 } from 'uuid';
import LimitOrders from '../Transactions/LimitOrders';
import MarketOrders from '../Transactions/MarketOrders';


function GetEvents({ 
  dexContract,
  setLimitTx,
  setMarketTx,
  toggleTabState4,
  limitTx,
  marketTx,
  limitOrders,
  marketOrders,
}) {
    useEffect(() => {
      const marketTX_data = window.localStorage.getItem("market_Tx");
      if (marketTX_data !== null)
      setMarketTx(JSON.parse(marketTX_data));

      const limitTX_data = window.localStorage.getItem("limit_Tx");
      if (limitTX_data !== null)
      setLimitTx(JSON.parse(limitTX_data));
      // eslint-disable-next-line
    }, []);

    useEffect(() => {
      window.localStorage.setItem("market_Tx", JSON.stringify(marketTx));
      window.localStorage.setItem("limit_Tx", JSON.stringify(limitTx));
      // eslint-disable-next-line
    }, [limitTx, marketTx]);

   // GET ORDER ORDERS HISTORY WITH EVENTS
   useEffect(() => {
    //-----Limit------------
      dexContract?.on("LimitOrder", (trader, side, ticker, amount, price, timestamp, event) => {
        //console.log(trader, side, ticker, amount, price, event);
  
        setLimitTx(prevLimitTx => [
          ...prevLimitTx,
          {
            txHash: event.transactionHash,
            id: uuidv4(),
            time: new Date(timestamp.toNumber() * 1000).toLocaleString(),
            trader,
            side,
            ticker: ethers.utils.parseBytes32String(ticker),
            amount: String(amount),
            price: ethers.utils.formatEther(price),
          }
        ]);
        return () => {
          dexContract.removeAllListeners("LimitOrder");
        }
      });

  // eslint-disable-next-line
  }, [limitOrders]); //[account, limitOrders]
  

  useEffect(() => {
      dexContract?.on("MarketOrder", (trader, side, ticker, amount, timestamp, event) => {
        //console.log(trader, side, ticker, amount, event);
  
        setMarketTx(prevMarketTx => [
          ...prevMarketTx,
          {
            txHash: event.transactionHash,
            id: uuidv4(),
            time: new Date(timestamp.toNumber() * 1000).toLocaleString(),
            trader,
            side,
            ticker: ethers.utils.parseBytes32String(ticker),
            amount: String(amount),
          }
        ]);
        return () => {
          dexContract.removeAllListeners("MarketOrder");
        }
      });
  // eslint-disable-next-line
  }, [marketOrders]);
  

  return (
     <div  className={toggleTabState4 === 14 ? 'content active-content' : "content"}>
            <div className='box-limit'>
                  <div className='card'>
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-secondary">LIMIT ORDERS</h6>
                      <div className="px-4">
                        <LimitOrders limitTx={limitTx} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className='box-market'>
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-secondary">MARKET ORDERS</h6>
                      <div className="px-4" >
                        <MarketOrders marketTx={marketTx}/>
                      </div>
                    </div>
                  </div>
                </div>

            </div>
  )
}

export default GetEvents;