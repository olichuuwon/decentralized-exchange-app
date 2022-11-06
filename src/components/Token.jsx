import React, { useEffect } from "react";
import styled from "styled-components";
import { ethers } from "ethers";

export const Wrapper2 = styled.section`
  margin: 1rem;
`;

function Token({
  transfer,
  isAllowanceMsg,
  setIsAllowanceMsg,
  setAllowanceAmount,
  allowanceAmount,
  isTransferFrom,
  setIsTransferFrom,
  contractInfo,
  toggleTabs,
  toggleTabState,
  errorTransfer,
  setErrorTransfer,
  errorTransferFrom,
  setErrorTransferFrom,
  account,
  tokenContract,
  setContractInfo,
  dexContractAddress,
  setApproveTx,
  setTransfer,
  isLoading,
  setIsLoading,
  setDexApproved,
  dexApproved,
  dexTokenWithdrawTx,
  txs,
  setTxs,
  approveTx,
  txListened,
  setTxListened,
}) {
  useEffect(() => {
    const tokenTx = window.localStorage.getItem("token_tx");
    if (tokenTx !== null) setTxs(JSON.parse(tokenTx));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    window.localStorage.setItem("token_tx", JSON.stringify(txs));
  }, [txs]);

  useEffect(() => {
    const getApproveTx = window.localStorage.getItem("approve_tx");
    if (getApproveTx !== null);
    setApproveTx(JSON.parse(getApproveTx));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    window.localStorage.setItem("approve_tx", JSON.stringify(approveTx));
  }, [approveTx]);

  useEffect(() => {
    const tokenInfoData = window.localStorage.getItem("token_info");
    if (tokenInfoData !== null) setContractInfo(JSON.parse(tokenInfoData));
    //console.log(tokenListData);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    window.localStorage.setItem("token_info", JSON.stringify(contractInfo));
  }, [contractInfo, dexContractAddress]);

  // TOKEN EVENTS
  useEffect(() => {
    //event Transfer(address indexed from, address indexed to, uint256 value);
    if (account) {
      console.count("event Transfer: ");
      tokenContract?.on("Transfer", (from, to, amount, event) => {
        //console.log({ from, to, amount, event });
        // the transaction result gets copied over to a state
        setTxs((prevTx) => [
          ...prevTx,
          {
            txHash: event.transactionHash,
            from,
            to,
            amount: ethers.utils.formatEther(amount), //amount: String(amount)
          },
        ]);
      });

      setTxListened(tokenContract);

      return () => {
        txListened.removeAllListeners("Transfer");
      };
    }
    // eslint-disable-next-line
  }, [transfer, dexTokenWithdrawTx]);

  // APPROVE EVENTS
  useEffect(() => {
    if (account) {
      console.count("event Approval: ");
      tokenContract?.on("Approval", (spender, event) => {
        //console.log({ spender, amount, event });
        setApproveTx((prevApprove) => [
          ...(prevApprove || []),
          {
            txHash: event.transactionHash,
            spender,
          },
        ]);
      });
      setTxListened(tokenContract);
      return () => {
        txListened.removeAllListeners("Approval");
      };
    }
    // eslint-disable-next-line
  }, [dexApproved]);

  const handleGetTokenInfo = async () => {
    //e.preventDefault();
    if (!tokenContract) {
      return;
    }
    try {
      console.count("handle token info: ");

      const tokenName = await tokenContract.name();
      const tokenSymbol = await tokenContract.symbol();
      const totalSupply = await tokenContract.totalSupply();

      const balance = await tokenContract.balanceOf(account);
      const ethFormatBalance = ethers.utils.formatEther(balance);

      setContractInfo({
        //address: data.get(contractAddress),
        address: tokenContract.address,
        tokenName,
        tokenSymbol,
        totalSupply: ethers.utils.formatEther(totalSupply),
        user: account,
        balance: String(ethFormatBalance),
      });

      // window.location.reload();
    } catch (error) {
      console.log("error", error);
    }
  };

  // Get ERC20 Token Contract Info
  useEffect(() => {
    handleGetTokenInfo();
    // eslint-disable-next-line
  }, [account, transfer, tokenContract]); //dexTokenWithdrawTx

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData(e.target);
      const transaction = await tokenContract.transfer(
        data.get("recipient"),
        ethers.utils.parseEther(data.get("amount"))
      );
      setIsLoading(true);
      //console.log('...loading');
      await transaction.wait();
      //console.log("...success!");
      setTransfer(data.get("amount"));
      setIsLoading(false);

      // window.location.reload();
    } catch (error) {
      console.log(error);
      //if (error) return alert('transfer amount exceeds balance');
      setErrorTransfer(true);
    }
  };

  // function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
  // address a, b & c -> a is the sender, b is the spender, c is the recipient
  // address b can send to address c on a's behalf

  const handleTransferFrom = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData(e.target);
      const transactionFrom = await tokenContract.transferFrom(
        data.get("sender"),
        data.get("recipient"),
        ethers.utils.parseEther(data.get("amount"))
      );
      await transactionFrom.wait();
      // console.log("transferFrom -- success");
      setIsTransferFrom(true);

      // window.location.reload();
    } catch (error) {
      console.log(error);
      //setError(true);
      if (error) return alert("transfer from amount exceeds balance");
    }
  };

  //function approve(address spender, uint256 amount) external returns (bool);
  // address a, b & c -> address a approves address b, the spender

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData(e.target);
      // infinite
      // 115792089237316195423570985008687907853269984665640564039457584007913129639935
      const transaction = await tokenContract.approve(
        data.get("spender"),
        ethers.utils.parseEther(data.get("amount"))
      );
      setIsLoading(true);
      //console.log('...loading');
      await transaction.wait();
      setIsLoading(false);
      //console.log("...success!");
    } catch (error) {
      console.log(error);
      if (error) return alert("error, check address or re-set Metamask");
    }
  };

  const handleApproveDex = async (e) => {
    e.preventDefault();
    try {
      console.count("handle approve DEX: ");
      const data = new FormData(e.target);
      const approveTx = await tokenContract.approve(
        dexContractAddress,
        ethers.utils.parseEther(data.get("amount"))
      );
      setIsLoading(true);
      //console.log("...loading");
      await approveTx.wait();
      setIsLoading(false);
      setDexApproved(approveTx);
      //console.log("...success!");
    } catch (error) {
      console.log(error);
      if (error) return alert("error, check address or re-set Metamask");
    }
  };

  // function allowance(address owner, address spender) external view returns (uint256);
  // address a is owner and address b is the spender -> checks the balance owner allows spender to spend

  const handleAllowance = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData(e.target);
      const allowance = await tokenContract.allowance(
        data.get("owner"),
        data.get("spender")
      );
      console.log("allowance:", allowance.toString());
      setIsAllowanceMsg(true);
      setAllowanceAmount(ethers.utils.formatEther(allowance));

      return allowance;
    } catch (error) {
      console.log(error);
      if (error) return alert("Input correct address");
    }
  };

  return (
      <div className="container-1">
        <div className="box-1">
          <Wrapper2 className="text-warning">
            <p>Address: {contractInfo.address}</p>
            <p>Name: {contractInfo.tokenName}</p>
            <p>Symbol: {contractInfo.tokenSymbol}</p>
            <p>Total Supply: {contractInfo.totalSupply}</p>
          </Wrapper2>

          <Wrapper2 className="text-warning">
            <h2 style={{ color: "#e1e1e1" }}>Account Info</h2>
            <p>Address: {contractInfo.user}</p>
            <p>
              Balance: {contractInfo.balance} {contractInfo.tokenSymbol}{" "}
            </p>
          </Wrapper2>
        </div>
        {/* Token Tabs */}
        <div className="box-2">
          {/* Transactions */}
          <div className="bloc-tabs">
            <button
              className={toggleTabState === 1 ? "tabs active-tabs" : "tabs"}
              onClick={() => toggleTabs(1)}
            >
              Send
            </button>
            <button
              className={toggleTabState === 5 ? "tabs active-tabs" : "tabs"}
              onClick={() => toggleTabs(5)}
            >
              Approve DEX
            </button>
            <button
              className={toggleTabState === 2 ? "tabs active-tabs" : "tabs"}
              onClick={() => toggleTabs(2)}
            >
              Approve
            </button>
            <button
              className={toggleTabState === 3 ? "tabs active-tabs" : "tabs"}
              onClick={() => toggleTabs(3)}
            >
              Allowance
            </button>
            <button
              className={toggleTabState === 4 ? "tabs active-tabs" : "tabs"}
              onClick={() => toggleTabs(4)}
            >
              Transfer From
            </button>
          </div>

          <div className="content-tabs">
            <div
              className={
                toggleTabState === 1 ? "content active-content" : "content"
              }
            >
              <form onSubmit={handleTransfer}>
                <div className="my-3">
                  <label className="form-label">Recipient</label>
                  <input
                    type="text"
                    name="recipient"
                    className="form-control"
                    placeholder="Recipient address"
                  />
                </div>
                <div className="my-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="text"
                    name="amount"
                    className="form-control"
                    placeholder="Amount to transfer"
                  />
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                  Transfer
                </button>
                <div className="my-4 mb-2">
                  {isLoading ? (
                    <div className="alert alert-dismissible alert-warning">
                      <strong>Loading!</strong> Sending Transaction
                    </div>
                  ) : null}
                  {errorTransfer && (
                    <div className="alert alert-dismissible alert-danger">
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        onClick={() => setErrorTransfer(false)}
                      ></button>
                      <strong>Oh no!</strong> Try submitting again. Your
                      balance may be insufficient or reset Metamask - advanced,
                      "Reset Account".
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div
              className={
                toggleTabState === 5 ? "content active-content" : "content"
              }
            >
              <form onSubmit={handleApproveDex}>
                <div className="my-3"></div>
                <div className="my-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="text"
                    name="amount"
                    className="form-control"
                    placeholder="Amount to approve"
                  />
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                  Approve DEX
                </button>
                <div className="my-4 mb-2">
                  {isLoading ? (
                    <div className="alert alert-dismissible alert-warning">
                      <strong>Loading!</strong> Sending Transaction
                    </div>
                  ) : null}
                </div>
              </form>
            </div>

            <div
              className={
                toggleTabState === 2 ? "content active-content" : "content"
              }
            >
              <small className="text-muted">
                Approve another address to spend your tokens
              </small>
              <form onSubmit={handleApprove}>
                <div className="my-3">
                  <label className="form-label">Approve the spender</label>
                  <input
                    type="text"
                    name="spender"
                    className="form-control"
                    placeholder="Spender address"
                  />
                </div>
                <div className="my-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="text"
                    name="amount"
                    className="form-control"
                    placeholder="Amount to approve"
                  />
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                  Approve Spender
                </button>
                <div className="my-4 mb-2">
                  {isLoading ? (
                    <div className="alert alert-dismissible alert-warning">
                      <strong>Loading!</strong> Sending Transaction
                    </div>
                  ) : null}
                </div>
              </form>
            </div>

            <div
              className={
                toggleTabState === 3 ? "content active-content" : "content"
              }
            >
              <small className="text-muted">
                Check allowance amount between addresses
              </small>
              <form onSubmit={handleAllowance}>
                <div className="my-3">
                  <label className="form-label">Owner</label>
                  <input
                    type="text"
                    name="owner"
                    className="form-control"
                    placeholder="Owner address"
                  />
                </div>
                <div className="my-3">
                  <label className="form-label">Spender</label>
                  <input
                    type="text"
                    name="spender"
                    className="form-control"
                    placeholder="Spender address"
                  />
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                  Check Allowance
                </button>
                <div className="my-3">
                  {isAllowanceMsg && (
                    <div className="alert alert-dismissible alert-warning">
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        onClick={() => setIsAllowanceMsg(false)}
                      ></button>
                      Spender can spend this ETH amount: {allowanceAmount}{" "}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div
              className={
                toggleTabState === 4 ? "content active-content" : "content"
              }
            >
              <form onSubmit={handleTransferFrom}>
                <div className="my-3">
                  <label className="form-label">Sender</label>
                  <input
                    type="text"
                    name="sender"
                    className="form-control"
                    placeholder="Sender address"
                  />
                </div>
                <div className="my-3">
                  <label className="form-label">Recipient</label>
                  <input
                    type="text"
                    name="recipient"
                    className="form-control"
                    placeholder="Recipient address"
                  />
                </div>
                <div className="my-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="text"
                    name="amount"
                    className="form-control"
                    placeholder="Amount to transfer"
                  />
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                  Transfer From
                </button>
                <div className="my-4 mb-2">
                  {isTransferFrom && (
                    <div className="alert alert-dismissible alert-success">
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        onClick={() => setIsTransferFrom(false)}
                      ></button>
                      <strong>Well Done!</strong> Your transfer has been
                      completed.
                    </div>
                  )}
                  {errorTransferFrom && (
                    <div className="alert alert-dismissible alert-danger">
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        onClick={() => setErrorTransferFrom(false)}
                      ></button>
                      <strong>Error!</strong> Transfer amount exceeds balance.
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Token;
