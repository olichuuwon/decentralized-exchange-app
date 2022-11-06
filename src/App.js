import React from 'react';
import { useState, useEffect } from 'react';
import BirdToken from "./artifacts/contracts/Tokens.sol/BirdToken.json";
import WethToken from "./artifacts/contracts/Tokens.sol/WethToken.json";
import 'bootswatch/dist/slate/bootstrap.min.css';
import TxList from './components/Transactions/TxList.jsx';
import Dex from "./artifacts/contracts/Dex.sol/Dex.json";
import ApproveList from './components/Transactions/ApproveList';
import Header from './components/Header';
import Footer from './components/Footer';
import TokenHeader from './components/TokenHeader';
import Token from './components/Token';
import DexHeader from './components/Dex/DexHeader';
import DexTransact from './components/Dex/DexTransact';
import TradingHeader from './components/Trading/TradingHeader';
import Trading from './components/Trading/Trading';
import { useWeb3React } from "@web3-react/core";
import { getContract } from './utils/utils';
import styled from 'styled-components';

export const ButtonWrapper = styled.div`
  display: flex;
  margin-top: 30px;
  justify-content: right;
`

export const NavButton2 = styled.div`
font-family: 'Open Sans', sans-serif;
display: flex;
align-items: center;
justify-content: center;
line-style: none;
background: rgb(30, 30, 30);
width: 200px;
border-radius: 18px;
height: 50px;
text-align: center;
line-height: 50px;
color:  White;
font-size: 16px;
text-decoration: none;
&:hover {
  cursor: pointer;
  background: rgb(50, 50, 50);
}
`

// localhost test net

const tokenContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
// const wethContractAddress = "";
const dexContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function App() {
  //const [contractAddress, setContractAddress] = useState("-");
  const [tokenContract, setTokenContract] = useState(null);
  const [dexContract, setDexContract] = useState(null);
  const { library, account } = useWeb3React(); // import library

  const [contractInfo, setContractInfo] = useState({
    address: "-",
    tokenName: "-",
    tokenSymbol: "-",
    totalSupply: "-",
    user: "-",
    balance: "-"
  });

  const [dexBalances, setDexBalances] = useState({
    address: "-",
    amount: "-",
    ticker: "-"
  })

  useEffect(() => {
    if (account) {
      // to init a contract
      const token = getContract(tokenContractAddress, BirdToken.abi, library, account);
      setTokenContract(token);
      //console.log("token:", token);

      // const weth = getContract(wethContractAddress, WethToken.abi, library, account);
      // setTokenContract(weth);

      const dex = getContract(dexContractAddress, Dex.abi, library, account);
      setDexContract(dex);
      //console.log("dex:", dex);
    }
  }, [account, library]);

  const [txs, setTxs] = useState([]);
  const [approveTx, setApproveTx] = useState([0]);
  const [limitTx, setLimitTx] = useState([]);
  const [marketTx, setMarketTx] = useState([]);
  const [txListened, setTxListened] = useState([]);

  const [ethDexBalance, setEthDexBalance] = useState({
    address: "-",
    ethBal: "_"
  });

  const [isLoading, setIsLoading] = useState(false);

  const [errorTransfer, setErrorTransfer] = useState(false);
  const [errorTransferFrom, setErrorTransferFrom] = useState(false);

  const [errorAddToken, setErrorAddToken] = useState(false);
  const [errorDexDeposit, setErrorDexDeposit] = useState(false);
  const [errorDepositEth, setErrorDepositEth] = useState(false);
  const [errorDexWithdraw, setErrorDexWithdraw] = useState(false);

  const [errorLimitSell, setErrorLimitSell] = useState(false);
  const [errorLimitBuy, setErrorLimitBuy] = useState(false);

  const [errorMarketSell, setErrorMarketSell] = useState(false);
  const [errorMarketBuy, setErrorMarketBuy] = useState(false);

  // tx is complete and sends a visual message
  const [isApproved, setIsApproved] = useState(false);
  const [allowanceAmount, setAllowanceAmount] = useState();
  const [isAllowanceMsg, setIsAllowanceMsg] = useState(false);
  const [isTransferFrom, setIsTransferFrom] = useState(false);
  const [isTransferMsg, setIsTransferMsg] = useState(false);
  const [transfer, setTransfer] = useState("-");

  //////////////DEX STATES/////////////////

  const [dexBalanceInfo, setDexBalanceInfo] = useState([]);
  const [dexApproved, setDexApproved] = useState([]);
  const [withDrawSuccessMsg, setWithDrawSuccessMsg] = useState(false);
  const [withDrawAmountInfo, setWithDrawAmountInfo] = useState("-");

  const [isLimitSellMsg, setIsLimitSellMsg] = useState(false);
  const [isLimitBuyMsg, setIsLimitBuyMsg] = useState(false);

  const [isMarketSellMsg, setIsMarketSellMsg] = useState(false);
  const [isMarketBuyMsg, setIsMarketBuyMsg] = useState(false);

  const [isSellInfo, setIsSellInfo] = useState([]);
  const [isBuyInfo, setIsBuyInfo] = useState([]);

  const [limitOrders, setLimitOrders] = useState([]);
  const [marketOrders, setMarketOrders] = useState([]);

  const [addTokenSuccessMsg, setAddTokenSuccessMsg] = useState(false);

  const [depositSuccessMsg, setDepositSuccessMsg] = useState(false);
  const [depositEthSuccessMsg, setDepositEthSuccessMsg] = useState(false);
  const [errorDepositEthMsg, setErrorDepositEthMsg] = useState(false)
  const [depositEthAmount, setDepositEthAmount] = useState("-");
  const [dexTokenTX, setDexTokenTx] = useState([]);
  const [depositEthTx, setDepositEthTx] = useState("-");
  const [tokenAdded, setTokenAdded] = useState([]);
  const [dexTokenWithdrawTx, setDexTokenWithdrawTx] = useState([]);

  const [listOfTokens, setListOfTokens] = useState([]);
  const [orderbookSellLength, setOrderbookSellLength] = useState(0);
  const [orderbookBuyLength, setOrderbookBuyLength] = useState(0);

  //tabs
  const [toggleTabState, setToggleTabState] = useState(1);
  const [toggleTabState2, setToggleTabState2] = useState(5);
  const [toggleTabState3, setToggleTabState3] = useState(9);
  const [toggleTabState4, setToggleTabState4] = useState(13);

  const toggleTabs = (index) => {
    setToggleTabState(index);
  };

  const toggleTabs2 = (index) => {
    setToggleTabState2(index);
  };

  const toggleTabs3 = (index) => {
    setToggleTabState3(index);
  };

  const toggleTabs4 = (index) => {
    setToggleTabState4(index);
  };

  const [adminMode, setAdminMode] = useState(false);

  const ToggleButtonOnOff = () => {
    return (
      <NavButton2 onClick={() => setAdminMode(!adminMode)}>{adminMode ? 'ADMIN' : 'USER'}</NavButton2>
    );
  }

  return (
    <>
      <div className='container'>

        <ButtonWrapper><ToggleButtonOnOff /></ButtonWrapper>

        <Header />

        <TradingHeader />

        <Trading
          toggleTabState3={toggleTabState3}
          toggleTabs3={toggleTabs3}
          toggleTabs4={toggleTabs4}
          toggleTabState4={toggleTabState4}
          isSellInfo={isSellInfo}
          setIsSellInfo={setIsSellInfo}
          isLimitSellMsg={isLimitSellMsg}
          setIsLimitSellMsg={setIsLimitSellMsg}
          errorLimitSell={errorLimitSell}
          setErrorLimitSell={setErrorLimitSell}
          isLimitBuyMsg={isLimitBuyMsg}
          setIsLimitBuyMsg={setIsLimitBuyMsg}
          errorLimitBuy={errorLimitBuy}
          setErrorLimitBuy={setErrorLimitBuy}
          isMarketBuyMsg={isMarketBuyMsg}
          setIsMarketBuyMsg={setIsMarketBuyMsg}
          errorMarketBuy={errorMarketBuy}
          setErrorMarketBuy={setErrorMarketBuy}
          isMarketSellMsg={isMarketSellMsg}
          setIsMarketSellMsg={setIsMarketSellMsg}
          errorMarketSell={errorMarketSell}
          setErrorMarketSell={setErrorMarketSell}
          limitTx={limitTx}
          setLimitTx={setLimitTx}
          marketTx={marketTx}
          setMarketTx={setMarketTx}
          dexContract={dexContract}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          account={account}
          isBuyInfo={isBuyInfo}
          setIsBuyInfo={setIsBuyInfo}
          setOrderbookSellLength={setOrderbookSellLength}
          orderbookSellLength={orderbookSellLength}
          setOrderbookBuyLength={setOrderbookBuyLength}
          orderbookBuyLength={orderbookBuyLength}
          limitOrders={limitOrders}
          setLimitOrders={setLimitOrders}
          marketOrders={marketOrders}
          setMarketOrders={setMarketOrders}
        />


        <DexHeader />

        <DexTransact
          errorAddToken={errorAddToken}
          errorDexDeposit={errorDexDeposit}
          errorDepositEth={errorDepositEth}
          errorDexWithdraw={errorDexWithdraw}
          dexBalanceInfo={dexBalanceInfo}
          setDexBalanceInfo={setDexBalanceInfo}
          withDrawSuccessMsg={withDrawSuccessMsg}
          withDrawAmountInfo={withDrawAmountInfo}
          addTokenSuccessMsg={addTokenSuccessMsg}
          depositEthSuccessMsg={depositEthSuccessMsg}
          depositEthAmount={depositEthAmount}
          toggleTabState2={toggleTabState2}
          depositSuccessMsg={depositSuccessMsg}
          setDepositSuccessMsg={setDepositSuccessMsg}
          toggleTabs2={toggleTabs2}
          setDepositEthSuccessMsg={setDepositEthSuccessMsg}
          setAddTokenSuccessMsg={setAddTokenSuccessMsg}
          setErrorAddToken={setErrorAddToken}
          setErrorDexDeposit={setErrorDexDeposit}
          setErrorDepositEth={setErrorDepositEth}
          setErrorDexWithdraw={setErrorDexWithdraw}
          setWithDrawSuccessMsg={setWithDrawSuccessMsg}
          errorDepositEthMsg={errorDepositEthMsg}
          setErrorDepositEthMsg={setErrorDepositEthMsg}
          ethDexBalance={ethDexBalance}
          dexContract={dexContract}
          tokenContract={tokenContract}
          setLimitTx={setLimitTx}
          setMarketTx={setMarketTx}
          setListOfTokens={setListOfTokens}
          listOfTokens={listOfTokens}
          setIsTransferMsg={setIsTransferMsg}
          setTransfer={setTransfer}
          setErrorTransfer={setErrorTransfer}
          account={account}
          setEthDexBalance={setEthDexBalance}
          contractInfo={contractInfo}
          setDepositEthAmount={setDepositEthAmount}
          setDexTokenTx={setDexTokenTx}
          setWithDrawAmountInfo={setWithDrawAmountInfo}
          setIsLimitSellMsg={setIsLimitSellMsg}
          setErrorLimitSell={setErrorLimitSell}
          setIsLimitBuyMsg={setIsLimitBuyMsg}
          setErrorLimitBuy={setErrorLimitBuy}
          setIsMarketSellMsg={setIsMarketSellMsg}
          setErrorMarketSell={setErrorMarketSell}
          setIsMarketBuyMsg={setIsMarketBuyMsg}
          setErrorMarketBuy={setErrorMarketBuy}
          dexTokenTX={dexTokenTX}
          depositEthTx={depositEthTx}
          setDepositEthTx={setDepositEthTx}
          dexBalances={dexBalances}
          setDexBalances={setDexBalances}
          setTokenAdded={setTokenAdded}
          tokenAdded={tokenAdded}
          setDexTokenWithdrawTx={setDexTokenWithdrawTx}
          dexTokenWithdrawTx={dexTokenWithdrawTx}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />


        {
          adminMode &&
          <div>



            <TokenHeader />

            <Token
              isTransferMsg={isTransferMsg}
              setIsTransferMsg={setIsTransferMsg}
              transfer={transfer}
              isApproved={isApproved}
              setIsApproved={setIsApproved}
              isAllowanceMsg={isAllowanceMsg}
              setIsAllowanceMsg={setIsAllowanceMsg}
              allowanceAmount={allowanceAmount}
              isTransferFrom={isTransferFrom}
              setIsTransferFrom={setIsTransferFrom}
              toggleTabs={toggleTabs}
              toggleTabState={toggleTabState}
              errorTransfer={errorTransfer}
              setErrorTransfer={setErrorTransfer}
              ApproveList={ApproveList}
              errorTransferFrom={errorTransferFrom}
              setErrorTransferFrom={setErrorTransferFrom}
              contractInfo={contractInfo}
              tokenContract={tokenContract}
              account={account}
              setContractInfo={setContractInfo}
              setApproveTx={setApproveTx}
              setAllowanceAmount={setAllowanceAmount}
              setTransfer={setTransfer}
              dexContractAddress={dexContractAddress}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setDexApproved={setDexApproved}
              dexApproved={dexApproved}
              dexBalanceInfo={dexBalanceInfo}
              txs={txs}
              setTxs={setTxs}
              approveTx={approveTx}
              txListened={txListened}
              setTxListened={setTxListened}
            />

            {/* Token Events */}
            {/* <div className='container'>
  <div className='box-4'>
    <div className="m-4 credit-card w-full lg:w-3/4 sm:w-auto shadow-lg mx-auto rounded-xl bg-darkgrey">
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-warning text-left">
          Recent ERC20 Token Wallet Transactions
        </h3>
        <div>
          <TxList txs={txs} />
          <ApproveList approveTx={approveTx} />
        </div>
      </div>
    </div>
  </div>
</div> */}

          </div>
        }

        <Footer />

      </div>

    </>
  );
};

export default App;
