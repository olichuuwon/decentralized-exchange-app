import React, { useEffect } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
//import LimitOrders from '../Transactions/LimitOrders';
//import MarketOrders from '../Transactions/MarketOrders';
import SellOrders from '../buySell/SellOrders';
import BuyOrders from '../buySell/BuyOrders';
import GetEvents from './GetEvents';

function Trading({
  toggleTabState3,
  toggleTabs3,
  errorLimitSell,
  setErrorLimitSell,
  errorLimitBuy,
  setErrorLimitBuy,
  errorMarketBuy,
  setErrorMarketBuy,
  errorMarketSell,
  setErrorMarketSell,
  limitTx,
  marketTx,
  dexContract,
  setLimitTx,
  setMarketTx,
  isLoading,
  setIsLoading,
  account,
  toggleTabs4,
  toggleTabState4,
  setIsSellInfo,
  isSellInfo,
  isBuyInfo,
  setIsBuyInfo,
  setOrderbookSellLength,
  orderbookSellLength,
  setOrderbookBuyLength,
  orderbookBuyLength,
  limitOrders,
  setLimitOrders,
  marketOrders,
  setMarketOrders,
}) {
  //--------- SAVE TRADES TO LOCAL STORAGE ----------------
  useEffect(() => {
    const ordersSellLengthData = window.localStorage.getItem('orders_Sell_length');
    if (ordersSellLengthData !== null) setOrderbookSellLength(JSON.parse(ordersSellLengthData));

    const sellData = window.localStorage.getItem('sell_trades');
    if (sellData !== null) setIsSellInfo(JSON.parse(sellData));

    const buyData = window.localStorage.getItem('buy_trades');
    if (buyData !== null) setIsBuyInfo(JSON.parse(buyData));
    //console.log("data", buyData);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    window.localStorage.setItem('orders_Sell_length', JSON.stringify(orderbookSellLength));
    window.localStorage.setItem('sell_trades', JSON.stringify(isSellInfo));
    window.localStorage.setItem('buy_trades', JSON.stringify(isBuyInfo));
  }, [isSellInfo, isBuyInfo, orderbookSellLength]); //isLimitSellMsg, isMarketSellMsg

  // MAKE TRADES
  const handleLimitOrderSell = async (e) => {
    e.preventDefault();
    try {
      console.count('handle limit order sell: ');
      const data = new FormData(e.target);
      const limitOrderSellTx = await dexContract.createLimitOrder(
        1,
        ethers.utils.formatBytes32String(data.get('ticker')),
        data.get('amount'),
        ethers.utils.parseEther(data.get('price'))
      );
      setIsLoading(true);
      await limitOrderSellTx.wait();
      setLimitOrders(limitOrderSellTx);
      console.log('limit SELL order success', limitOrderSellTx);
      //setIsLimitSellMsg(true);
      setIsLoading(false);

      //get SELL side trades
      const allTokenList = await dexContract.getTokenListLength();
      for (let i = 0; i < allTokenList; i++) {
        let tokenList = await dexContract.tokenList(i);
        // add tokenList result to ticker argument - tokenList is parsed but it's also formatted
        const sellTx = await dexContract.getOrderBook(
          ethers.utils.formatBytes32String(ethers.utils.parseBytes32String(tokenList)),
          1
        );

        // loop through the sellTx instance of getOrderBook
        for (let i = 0; i < sellTx.length; i++) {
          const traderSell = sellTx[i]['trader'];
          const tickerSell = sellTx[i]['ticker'];
          const amountSell = sellTx[i]['amount'];
          const priceSell = ethers.utils.formatEther(sellTx[i]['price']);
          const filledSell = sellTx[i]['filled'];
          //console.log("order book sell side:", sellTx.length);
          console.log(
            'LimitSell:',
            'Trader:',
            traderSell,
            'Symbol:',
            ethers.utils.parseBytes32String(tickerSell),
            'Amount:',
            amountSell.toString(),
            'Price:',
            priceSell,
            'Filled:',
            filledSell.toNumber()
          );
          //setOrderbookLength(sellTx.length);

          // spread operator to create a new object
          setIsSellInfo((prevSell) => [
            ...prevSell,
            {
              id: uuidv4(),
              trader: traderSell,
              ticker: ethers.utils.parseBytes32String(tickerSell),
              amount: amountSell.toString(),
              price: priceSell,
              filled: filledSell.toNumber(),
            },
          ]);
        }
      }
    } catch (error) {
      console.log('error', error);
      //if (error) return alert("error...check token balance");
      setErrorLimitSell(true);
    }
  };

  const handleLimitOrderBuy = async (e) => {
    e.preventDefault();
    try {
      console.count('handle limit order buy: ');
      const data = new FormData(e.target);
      const limitOrderBuyTx = await dexContract.createLimitOrder(
        0,
        ethers.utils.formatBytes32String(data.get('ticker')),
        data.get('amount'),
        ethers.utils.parseEther(data.get('price'))
      );
      setIsLoading(true);
      await limitOrderBuyTx.wait();
      //setLimitOrders(limitOrderBuyTx);
      setLimitOrders(limitOrderBuyTx);
      console.log('limit BUY order success', limitOrderBuyTx);
      //setIsLimitBuyMsg(true);
      setIsLoading(false);

      //get BUY side trades
      const allTokenList = await dexContract.getTokenListLength();
      for (let i = 0; i < allTokenList; i++) {
        let tokenList = await dexContract.tokenList(i);

        const buyTx = await dexContract.getOrderBook(
          ethers.utils.formatBytes32String(ethers.utils.parseBytes32String(tokenList)),
          0
        );

        for (let i = 0; i < buyTx.length; i++) {
          const traderBuy = buyTx[i]['trader'];
          const tickerBuy = buyTx[i]['ticker'];
          const amountBuy = buyTx[i]['amount'];
          const priceBuy = ethers.utils.formatEther(buyTx[i]['price']);
          const filledBuy = buyTx[i]['filled'];
          //console.log("order book buy side:", buyTx.length);
          console.log(
            'LimitBuy:',
            'Trader:',
            traderBuy,
            'Symbol:',
            ethers.utils.parseBytes32String(tickerBuy),
            'Amount:',
            amountBuy.toString(),
            'Price:',
            priceBuy,
            'Filled:',
            filledBuy.toNumber()
          );
          //setOrderbookLength(buyTx.length);

          setIsBuyInfo((prevBuy) => [
            ...prevBuy,
            {
              id: uuidv4(),
              trader: traderBuy,
              ticker: ethers.utils.parseBytes32String(tickerBuy),
              amount: amountBuy.toString(),
              price: priceBuy,
              filled: filledBuy.toNumber(),
            },
          ]);
        }
      }
    } catch (error) {
      console.log('error', error);
      //if (error) return alert("error...Not enough ETH balancance");
      setErrorLimitBuy(true);
    }
  };

  const handleMarketOrderSell = async (e) => {
    e.preventDefault();
    try {
      console.count('handle market order sell: ');
      const data = new FormData(e.target);
      const marketOrderSellTx = await dexContract.createMarketOrder(
        1,
        ethers.utils.formatBytes32String(data.get('ticker')),
        data.get('amount')
      );
      setIsLoading(true);

      await marketOrderSellTx.wait();
      //setMarketOrders(marketOrderSellTx);
      setMarketOrders(marketOrderSellTx);
      console.log('market SELL order success', marketOrderSellTx);
      //setIsMarketSellMsg(true);
      setIsLoading(false);

      //get SELL side trades
      const allTokenList = await dexContract.getTokenListLength();
      for (let i = 0; i < allTokenList; i++) {
        let tokenList = await dexContract.tokenList(i);
        // add tokenList result to ticker argument - tokenList is parsed but it's also formatted
        const sellTx = await dexContract.getOrderBook(
          ethers.utils.formatBytes32String(ethers.utils.parseBytes32String(tokenList)),
          1
        );

        // loop through the sellTx instance of getOrderBook
        for (let i = 0; i < sellTx.length; i++) {
          const traderSell = sellTx[i]['trader'];
          const tickerSell = sellTx[i]['ticker'];
          const amountSell = sellTx[i]['amount'];
          const filledSell = sellTx[i]['filled'];
          //console.log("order book sell side:", sellTx.length);
          console.log(
            'MarketSell:',
            'Trader:',
            traderSell,
            'Symbol:',
            ethers.utils.parseBytes32String(tickerSell),
            'Amount:',
            amountSell.toString(),
            'Filled:',
            filledSell.toNumber()
          );
          //setOrderbookLength(sellTx.length);
          // spread operator to create a new object
          setIsSellInfo((prevSell) => [
            ...prevSell,
            {
              id: uuidv4(),
              trader: traderSell,
              ticker: ethers.utils.parseBytes32String(tickerSell),
              amount: amountSell.toString(),
              filled: filledSell.toNumber(),
            },
          ]);
        }
      }
    } catch (error) {
      console.log('error', error);
      //if (error) return alert("something went wrong");
      setErrorMarketSell(true);
    }
  };

  const handleMarketOrderBuy = async (e) => {
    e.preventDefault();
    try {
      console.count('handle market order buy: ');
      const data = new FormData(e.target);
      const marketOrderTx = await dexContract.createMarketOrder(
        0,
        ethers.utils.formatBytes32String(data.get('ticker')),
        data.get('amount')
      );
      setIsLoading(true);
      await marketOrderTx.wait();
      setMarketOrders(marketOrderTx);
      console.log('market BUY order success', marketOrderTx);
      setIsLoading(false);
      //setIsMarketBuyMsg(true);

      //get BUY side trades
      const allTokenList = await dexContract.getTokenListLength();
      for (let i = 0; i < allTokenList; i++) {
        let tokenList = await dexContract.tokenList(i);

        const buyTx = await dexContract.getOrderBook(
          ethers.utils.formatBytes32String(ethers.utils.parseBytes32String(tokenList)),
          0
        );

        for (let i = 0; i < buyTx.length; i++) {
          const traderBuy = buyTx[i]['trader'];
          const tickerBuy = buyTx[i]['ticker'];
          const amountBuy = buyTx[i]['amount'];
          const filledBuy = buyTx[i]['filled'];
          //console.log("order book buy side:", buyTx.length);
          //console.log("MarketBuy:", "Trader:", traderBuy, "Symbol:", ethers.utils.parseBytes32String(tickerBuy), "Amount:", amountBuy.toString(), "Filled:", filledBuy.toNumber());
          //setOrderbookLength(buyTx.length);

          setIsBuyInfo((prevBuy) => [
            ...prevBuy,
            {
              id: uuidv4(),
              trader: traderBuy,
              ticker: ethers.utils.parseBytes32String(tickerBuy),
              amount: amountBuy.toString(),
              filled: filledBuy.toNumber(),
            },
          ]);
        }
      }
    } catch (error) {
      console.log('error', error);
      //if (error) return alert("error...check Eth amount");
      setErrorMarketBuy(true);
    }
  };

  // MAP THROUGH OBJECT -> SEND TO PRINT
  const sellList = isSellInfo.map((sells) => <SellOrders key={sells.id} sells={sells} />);

  // MAP THROUGH OBJECT -> SEND TO PRINT
  const buyList = isBuyInfo.map((buys) => <BuyOrders key={buys.id} buys={buys} />);

  const getOrderBookSellSide = async () => {
    console.count('get OB Sell side: ');
    try {
      const allTokenList = await dexContract.getTokenListLength();
      for (let i = 0; i < allTokenList; i++) {
        let tokenList = await dexContract.tokenList(i);
        // add tokenList result to ticker argument - tokenList is parsed but it's also formatted
        const sellTx = await dexContract.getOrderBook(
          ethers.utils.formatBytes32String(ethers.utils.parseBytes32String(tokenList)),
          1
        );
        console.log('order book sell side:', sellTx.length);
        setOrderbookSellLength(sellTx.length);
      }
    } catch (error) {
      console.log('eror', error);
    }
  };

  const getOrderBookBuySide = async () => {
    console.count('get OB buy side: ');
    try {
      const allTokenList = await dexContract.getTokenListLength();
      for (let i = 0; i < allTokenList; i++) {
        let tokenList = await dexContract.tokenList(i);
        // add tokenList result to ticker argument - tokenList is parsed but it's also formatted
        const buyTx = await dexContract.getOrderBook(
          ethers.utils.formatBytes32String(ethers.utils.parseBytes32String(tokenList)),
          0
        );
        console.log('order book sell side:', buyTx.length);
        setOrderbookBuyLength(buyTx.length);
      }
    } catch (error) {
      console.log('eror', error);
    }
  };

  // trigger handle order functions and render to Trades window
  useDeepCompareEffect(() => {
    let isCancelled = false;

    if (account === 0) {
      handleLimitOrderSell();
      handleLimitOrderBuy();
      handleMarketOrderSell();
      handleMarketOrderBuy();
      getOrderBookSellSide();
      getOrderBookBuySide();

      if (!isCancelled) {
        console.log(`an order was changed: ${isSellInfo}, ${isBuyInfo}`);
      }
    }

    return () => {
      //console.log("dex trading cleanup");
      isCancelled = true;
    };
  }, [isSellInfo, isBuyInfo]);

  return (
    <>
      {/* handle sell and buy  */}
      <div className="container-5">
        <div className="box-1">
          <div className="bloc-tabs">
            <button className={toggleTabState3 === 9 ? 'tabs active-tabs' : 'tabs'} onClick={() => toggleTabs3(9)}>
              Limit Sell
            </button>
              <button className={toggleTabState3 === 10 ? 'tabs active-tabs' : 'tabs'} onClick={() => toggleTabs3(10)}>
              Limit Buy
              </button>
              <button className={toggleTabState3 === 11 ? 'tabs active-tabs' : 'tabs'} onClick={() => toggleTabs3(11)}>
              Market Sell
              </button>
              <button className={toggleTabState3 === 12 ? 'tabs active-tabs' : 'tabs'} onClick={() => toggleTabs3(12)}>
              Market Buy
              </button>
          </div>

            <div className="content-tabs">
            <div className={toggleTabState3 === 9 ? 'content active-content' : 'content'}>
              {/* handle submit limt order */}
              <form onSubmit={handleLimitOrderSell}>
              <div className="my-3">
                <label className="form-label">Ticker example: BIRD, CAT, DOG, ETH, etc </label>
                  <input type="text" name="ticker" className="form-control" placeholder="Token Symbol" />
              </div>
                  <div className="my-3">
                <label className="form-label">Amount of tokens to sell</label>
                  <input type="text" name="amount" className="form-control" placeholder="Amount to sell" />
                  </div>
                  <div className="my-3">
                <label className="form-label">Price per token</label>
                  <input type="text" name="price" className="form-control" placeholder="Token Price in ETH" />
                  </div>
                  <button type="submit" className="btn btn-primary mt-3">
                Create a limit SELL order
                  </button>
                  <div className="my-4 mb-2">
                {isLoading ? (
                  <div className="alert alert-dismissible alert-warning">
                    <strong>Loading!</strong> Sending Transaction
                  </div>
                ) : null}

                  {errorLimitSell && (
                    <div className="alert alert-dismissible alert-warning">
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        onClick={() => setErrorLimitSell(false)}
                      ></button>
                      <strong>Oh no!</strong> Try submitting again. Your balance may be insufficient.
                    </div>
                      )}
                  </div>
    </form>
    </div>

              <div className={toggleTabState3 === 10 ? 'content active-content' : 'content'}>
                {/* handle submit limt order */}
                <form onSubmit={handleLimitOrderBuy}>
                  <div className="my-3">
                    <label className="form-label">Ticker example: BIRD, CAT, DOG, ETH, etc </label>
                    <input type="text" name="ticker" className="form-control" placeholder="Token Symbol" />
                  </div>
                  <div className="my-3">
                    <label className="form-label">Amount of tokens to buy</label>
                    <input type="text" name="amount" className="form-control" placeholder="Amount to buy" />
                  </div>
                  <div className="my-3">
                    <label className="form-label">Price per token</label>
                    <input type="text" name="price" className="form-control" placeholder="Token Price in ETH" />
                  </div>
                    <button type="submit" className="btn btn-primary mt-3">
                      Create a limit BUY order
                    </button>
                    <div className="my-4 mb-2">
                      {isLoading ? (
                    <div className="alert alert-dismissible alert-warning">
                      <strong>...Loading</strong> Transaction is being processed
                    </div>
                    ) : null}

                    {errorLimitBuy && (
                      <div className="alert alert-dismissible alert-warning">
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="alert"
                          onClick={() => setErrorLimitBuy(false)}
                        ></button>
                        <strong>Oh no!</strong> Try submitting again. Your ETH balance may be insufficient.
                      </div>
                        )}
                    </div>
    </form>
    </div>

              <div className={toggleTabState3 === 11 ? 'content active-content' : 'content'}>
                <form onSubmit={handleMarketOrderSell}>
                  <div className="my-3">
                    <label className="form-label">Ticker example: BIRD, CAT, DOG, ETH, etc</label>
                    <input type="text" name="ticker" className="form-control" placeholder="Token Symbol" />
                  </div>
                  <div className="my-3">
                    <label className="form-label">Amount of tokens to sell</label>
                    <input type="text" name="amount" className="form-control" placeholder="Amount to sell" />
                  </div>
                    <button type="submit" className="btn btn-primary mt-3">
                      Create a market SELL order
                    </button>
                    <div className="my-4 mb-2">
                      {isLoading ? (
                    <div className="alert alert-dismissible alert-warning">
                      <strong>...Loading</strong> Transaction is being processed
                    </div>
                    ) : null}
                    {errorMarketSell && (
                    <div className="alert alert-dismissible alert-warning">
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        onClick={() => setErrorMarketSell(false)}
                      ></button>
                      <strong>Oh no!</strong> Try submitting again. Your balance may be insufficient.
                    </div>
                    )}
    </div>
    </form>
    </div>

    <div className={toggleTabState3 === 12 ? 'content active-content' : 'content'}>
              {/* handle submit limt order */}
              <form onSubmit={handleMarketOrderBuy}>
                <div className="my-3">
                  <label className="form-label">Ticker example: BIRD, CAT, DOG, ETH, etc</label>
                  <input type="text" name="ticker" className="form-control" placeholder="Token Symbol" />
                </div>
                  <div className="my-3">
                    <label className="form-label">Amount of tokens to buy</label>
                    <input type="text" name="amount" className="form-control" placeholder="Amount to buy" />
                  </div>
                    <button type="submit" className="btn btn-primary mt-3">
                      Create a market BUY order
                    </button>
                    <div className="my-4 mb-2">
                      {isLoading ? (
                    <div className="alert alert-dismissible alert-warning">
                      <strong>...Loading</strong> Transaction is being processed
                    </div>
                    ) : null}
                    {errorMarketBuy && (
                    <div className="alert alert-dismissible alert-danger">
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        onClick={() => setErrorMarketBuy(false)}
                      ></button>
                      <strong>Oh no!</strong> Try submitting again. Your ETH balance may be insufficient.
                    </div>
                    )}
    </div>
    </form>
    </div>
    </div>
        </div>
        {/* Orderbook */}
        <div className="box-2">
          <div className="bloc-tabs">
            <button
              className={toggleTabState4 === 13 ? 'tabs active-tabs' : 'tabs'}
              onClick={() => toggleTabs4(13)}
            >
              Trades
            </button>
              <button
              className={toggleTabState4 === 14 ? 'tabs active-tabs' : 'tabs'}
              onClick={() => toggleTabs4(14)}
              >
              Order Book History
              </button>
          </div>
              <div className={toggleTabState4 === 13 ? 'content active-content' : 'content'}>
            <div className="box-limit">
              <div className="card">
                <div className="card-body">
                  {orderbookSellLength ? (
                  <h6 className="card-subtitle mb-2 text-secondary">Order Book Sells: {orderbookSellLength}</h6>
                  ) : (
                    <h6 className="card-subtitle mb-2 text-secondary">Order Book Sells: 0</h6>
                  )}
    {orderbookBuyLength ? (
                  <h6 className="card-subtitle mb-2 text-secondary">Order Book Buys: {orderbookBuyLength}</h6>
    ) : (
      <h6 className="card-subtitle mb-2 text-secondary">Order Book Buys: 0</h6>
    )}
    <br />
                  <h6 className="card-subtitle mb-2 text-secondary">Sell</h6>
                  <div className="px-4">{sellList}</div>
                </div>
              </div>
            </div>
                <div className="box-market">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-secondary">Buy</h6>
                  <div className="px-4">{buyList}</div>
                </div>
              </div>
                </div>
              </div>
          {/* order history*/}
          <GetEvents
            account={account}
            dexContract={dexContract}
            setLimitTx={setLimitTx}
            setMarketTx={setMarketTx}
            toggleTabState4={toggleTabState4}
            limitTx={limitTx}
            marketTx={marketTx}
            isSellInfo={isSellInfo}
            isBuyInfo={isBuyInfo}
            limitOrders={limitOrders}
            marketOrders={marketOrders}
            setLimitOrders={setLimitOrders}
            setMarketOrders={setMarketOrders}
          />
        </div>
      </div>
    </>
  );
}

export default Trading;

