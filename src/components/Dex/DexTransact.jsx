import React, { useEffect } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import DexBalances from '../Transactions/DexBalances';
import styled from 'styled-components';

export const Wrapper3 = styled.section`
	padding: 19px;
	margin: 17px;
`;

function DexTransact({
	errorAddToken,
	errorDexDeposit,
	errorDexWithdraw,
	depositEthSuccessMsg,
	toggleTabState2,
	toggleTabs2,
	setErrorAddToken,
	setErrorDexDeposit,
	setErrorDexWithdraw,
	setErrorDepositEth,
	errorDepositEthMsg,
	ethDexBalance,
	dexContract,
	setListOfTokens,
	listOfTokens,
	account,
	dexBalanceInfo,
	setDexBalanceInfo,
	setEthDexBalance,
	contractInfo,
	setDexTokenTx,
	setWithDrawAmountInfo,
	dexTokenTX,
	depositEthTx,
	setDepositEthTx,
	setDexBalances,
	setTokenAdded,
	tokenAdded,
	setDexTokenWithdrawTx,
	dexTokenWithdrawTx,
	setErrorDepositEthMsg,
	isLoading,
	setIsLoading,
}) {

	useEffect(() => {
		const dexBalData = window.localStorage.getItem('dex_balances');
		if (dexBalData !== null) setDexBalances(JSON.parse(dexBalData));
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		const ethDexBalData = window.localStorage.getItem('eth_dex_balances');
		if (ethDexBalData !== null) setEthDexBalance(JSON.parse(ethDexBalData)); // rev setListOfTokens
		//console.log(tokenListData);
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		window.localStorage.setItem('dex_balances', JSON.stringify(dexBalanceInfo));
	}, [dexBalanceInfo]);

	useEffect(() => {
		window.localStorage.setItem('eth_dex_balances', JSON.stringify(ethDexBalance));
	}, [ethDexBalance]);

	const getDexBalances = async () => {
		try {
			console.count('getDexBalance: ');
			// get token list
			const allTokenList = await dexContract.getTokenListLength();
			//console.log("token list length:", allTokenList.toNumber());
			for (let i = 0; i < allTokenList; i++) {
				let tokenList = await dexContract.tokenList(i);
				//console.log("token list token:", ethers.utils.parseBytes32String(tokenList));
				const tickerBalance = await dexContract.balances(account, tokenList);
				//console.log("Dex Token Bal:", ethers.utils.formatEther(tickerBalance.toString()));

				setDexBalanceInfo((prevDexBal) => [
					...prevDexBal,
					{
						address: account,
						amount: ethers.utils.formatEther(tickerBalance),
						ticker: ethers.utils.parseBytes32String(tokenList),
					},
				]);
			}
		} catch (error) {
			console.log('error', error);
		}
	};

	useDeepCompareEffect(() => {
		//console.log("dexBalances mount");
		let isCancelled = false;
		if (dexContract !== null) {
			getDexBalances();

			if (!isCancelled);
			console.log(`a Dex tx was made ${dexTokenTX}, ${dexTokenWithdrawTx}, ${dexContract}`);
		}

		return () => {
			//console.log("dexBalances will unmount", dexTokenTX);
			isCancelled = true;
		};
	}, [dexContract, dexTokenTX, dexTokenWithdrawTx]);

	// Get only the ETH bal in DEX
	const getDexETH_Balance = async () => {
		try {
			console.count('getDex Eth Bal: ');
			const dexEthBal = await dexContract.balances(account, ethers.utils.formatBytes32String('ETH'));
			//console.log("Dex ETH Bal:", ethers.utils.formatEther(dexEthBal.toString()));
			setEthDexBalance({
				address: account,
				ethBal: ethers.utils.formatEther(dexEthBal),
			});
		} catch (error) {
			console.log('error', error);
		}
	};

	useEffect(() => {
		let isCancelled = false;
		if (dexContract !== null) {
			getDexETH_Balance();

			if (!isCancelled) {
				console.log(`get Eth Bal change ${account}, ${depositEthTx}, ${depositEthSuccessMsg}, ${dexTokenWithdrawTx} `);
			}
		}

		return () => {
			isCancelled = true;
		};

		// eslint-disable-next-line
	}, [dexContract, depositEthTx, depositEthSuccessMsg, dexTokenWithdrawTx]);

	// get token list

	const handleGetTokenList = async () => {
		if (!dexContract) {
			return;
		}
		try {
			console.count('handle token list: ');
			// get token list
			const allTokenList = await dexContract.getTokenListLength();
			//console.log("token list length:", allTokenList.toNumber());
			for (let i = 0; i < allTokenList; i++) {
				let tokenList = await dexContract.tokenList(i);
				//console.log("token list token:", ethers.utils.parseBytes32String(tokenList));
				setListOfTokens((prevTokens) => [
					...prevTokens,
					{
						id: uuidv4(),
						ticker: ethers.utils.parseBytes32String(tokenList),
					},
				]);
			}
			//console.log("listOfTokens", listOfTokens);
		} catch (error) {
			console.log('error', error);
		}
	};

	useEffect(() => {
		let isCancelled = false;
		if (account !== null) {
			//console.log("list..tokens mount");
			handleGetTokenList();

			if (!isCancelled) {
				console.log(`token list changed ${dexContract}, ${tokenAdded}`);
			}
		}

		return () => {
			//console.log("list of tokens will unmount", listOfTokens)
			isCancelled = true;
		};
		// eslint-disable-next-line
	}, [dexContract, tokenAdded]); //account, tokenAdded, dexTokenTX

	const handleAddToken = async (e) => {
		e.preventDefault();
		try {
			const data = new FormData(e.target);
			const addTokenTx = await dexContract.addToken(
				ethers.utils.formatBytes32String(data.get('ticker')),
				contractInfo.address
			);
			setIsLoading(true);
			await addTokenTx.wait();
			console.log('Add Token: ', addTokenTx);
			setTokenAdded(addTokenTx);
			setIsLoading(false);
			//setAddTokenSuccessMsg(true);

			// window.location.reload();
		} catch (error) {
			console.log("error", error);
			setErrorAddToken(true);
		}
	};

	// Deposit only ETH into DEX
	const handleDepositEth = async (e) => {
		e.preventDefault();
		try {
			const data = new FormData(e.target);
			const depositEthData = await dexContract.depositEth({ value: ethers.utils.parseEther(data.get('amount')) });
			setIsLoading(true);
			await depositEthData.wait();
			//console.log("Deposit ETH: ", depositEthData);
			setDepositEthTx(depositEthData.value);
			setIsLoading(false);
			//console.log("Deposit ETH: ", depositEthData.value.toString());
			//setDepositEthAmount(ethers.utils.formatEther(depositEthData.value));
			//setDepositEthSuccessMsg(true);

			// window.location.reload();
		} catch (error) {
			console.log('error', error);
			setErrorDepositEthMsg(true);
		}
	};

	// DEPOSIT ERC20 TOKENS INTO DEX
	const handleDexTokenDeposit = async (e) => {
		e.preventDefault();
		console.count('handle Dex deposits: ');
		try {
			const data = new FormData(e.target);
			const dexDepositTx = await dexContract.deposit(
				ethers.utils.parseEther(data.get('amount')),
				ethers.utils.formatBytes32String(data.get('ticker'))
			);
			setIsLoading(true);
			await dexDepositTx.wait();
			//console.log("Dex deposit tx: ", dexDepositTx);
			setDexTokenTx(dexDepositTx);
			setIsLoading(false);
			//setDepositSuccessMsg(true);

			// window.location.reload();
		} catch (error) {
			console.log('error', error);
			setErrorDexDeposit(true);
		}
	};

	// WITHDRAW ERC20 TOKENS FROM DEX
	const handleWithDraw = async (e) => {
		e.preventDefault();
		try {
			const data = new FormData(e.target);
			const withdrawTx = await dexContract.withdraw(
				ethers.utils.parseEther(data.get('amount')),
				ethers.utils.formatBytes32String(data.get('ticker'))
			);
			setIsLoading(true);
			await withdrawTx.wait();
			//console.log("withdraw: ", withdrawTx);
			setDexTokenWithdrawTx(withdrawTx);
			setWithDrawAmountInfo(data.get('amount'));
			setIsLoading(false);

			//window.localStorage.reload();

			//setWithDrawSuccessMsg(true);
			//setWithDrawAmountInfo(ethers.utils.formatEther(withdrawTx.value));
		} catch (error) {
			console.log('error', error);
			setErrorDexWithdraw(true);
		}
	};

	// REFRESH PAGE

	const refresh = (e) => {
		e.preventDefault();
		window.location.reload();
	};

	// PRINT TOKEN LIST

	const myTokenList = listOfTokens.map((lists) => (
		<div key={lists.id} className="alert alert-dismissible alert-primary text-secondary">
			<div>
				<strong>Id:</strong> {lists.id}
			</div>
			<div className="text-warning">
				<strong>Token:</strong> {lists.ticker}
			</div>
		</div>
	));

	return (
		<>
			{/* DEX deposts/balances/add-token, etc...  */}
			<div className="container-3">
				{/* add tokens */}
				<div className="box-1">
					<div className="bloc-tabs">
						<button className={toggleTabState2 === 5 ? 'tabs active-tabs' : 'tabs'} onClick={() => toggleTabs2(5)}>
							Add Ticker Symbol
						</button>
						<button className={toggleTabState2 === 6 ? 'tabs active-tabs' : 'tabs'} onClick={() => toggleTabs2(6)}>
							Dex Deposits
						</button>
						<button className={toggleTabState2 === 7 ? 'tabs active-tabs' : 'tabs'} onClick={() => toggleTabs2(7)}>
							Deposit ETH
						</button>
						<button className={toggleTabState2 === 8 ? 'tabs active-tabs' : 'tabs'} onClick={() => toggleTabs2(8)}>
							Withdraw
						</button>
					</div>

					<div className="content-tabs">
						<div className={toggleTabState2 === 5 ? 'content active-content' : 'content'}>
							{/* get Dex add token */}
							<form onSubmit={handleAddToken}>
								<div className="my-3">
									<label className="form-label">Add token to DEX</label>
									<input type="bytes32" name="ticker" className="form-control" placeholder="Token Symbol" />
								</div>
								<button type="submit" className="btn btn-primary mt-3">
									Add Token
								</button>
								<div className="my-4 mb-2">
									{isLoading ? (
										<div className="alert alert-dismissible alert-warning">
											<strong>...Loading</strong> Transaction is being processed
										</div>
									) : null}
									{errorAddToken && (
										<div className="alert alert-dismissible alert-danger">
											<button
												type="button"
												className="btn-close"
												data-bs-dismiss="alert"
												onClick={() => setErrorAddToken(false)}
											></button>
											<strong>Oh no!</strong> Token must be ERC20. Log into Metamask. This error message may have been
											triggered during reload.
										</div>
									)}
								</div>
							</form>

							<div className="my-3">
								<div>
									<div className="card-body">
										<h6 className="card-subtitle mb-2 text-warning">Token List</h6>
										<div className="my-4 mb-2">{myTokenList}</div>
									</div>
								</div>
							</div>
						</div>

						<div className={toggleTabState2 === 6 ? 'content active-content' : 'content'}>
							{/* get Dex token deposits */}
							<form onSubmit={handleDexTokenDeposit}>
								<div className="my-3">
									<label className="form-label">Deposit tokens into DEX</label>
									<input type="text" name="amount" className="form-control" placeholder="Amount to deposit" />
								</div>
								<div className="my-3">
									<label className="form-label">Token symbol</label>
									<input type="text" name="ticker" className="form-control" placeholder="Token Symbol" />
								</div>
								<button type="submit" className="btn btn-primary mt-3">
									Deposit Tokens
								</button>
								<div className="my-4 mb-2">
									{isLoading ? (
										<div className="alert alert-dismissible alert-warning">
											<strong>...Loading</strong> Transaction is being processed
										</div>
									) : null}
									{errorDexDeposit && (
										<div className="alert alert-dismissible alert-danger">
											<button
												type="button"
												className="btn-close"
												data-bs-dismiss="alert"
												onClick={() => setErrorDexDeposit(false)}
											></button>
											<strong>Oh no!</strong> Must be an ERC20 token or approve with the DEX wallet.
										</div>
									)}
								</div>
							</form>
						</div>

						<div className={toggleTabState2 === 7 ? 'content active-content' : 'content'}>
							<form onSubmit={handleDepositEth}>
								<div className="my-3">
									<label className="form-label">Deposit ETH to DEX</label>
									<input type="text" name="amount" className="form-control" placeholder="ETH Amount" />
								</div>
								<button type="submit" className="btn btn-primary mt-3">
									Deposit ETH
								</button>
								<div className="my-4 mb-2">
									{isLoading ? (
										<div className="alert alert-dismissible alert-warning">
											<strong>...Loading</strong> Transaction is being processed
										</div>
									) : null}
									{errorDepositEthMsg && (
										<div className="alert alert-dismissible alert-danger">
											<button
												type="button"
												className="btn-close"
												data-bs-dismiss="alert"
												onClick={() => setErrorDepositEth(false)}
											></button>
											<strong>Oh no!</strong> Try submitting again. Token balance may be insufficient.
										</div>
									)}
								</div>
							</form>
						</div>

						<div className={toggleTabState2 === 8 ? 'content active-content' : 'content'}>
							<small className="text-muted">Tokens will be withdrawn from this exchange to your wallet</small>
							<form onSubmit={handleWithDraw}>
								<div className="my-3">
									<label className="form-label">Widthraw tokens from DEX</label>
									<input type="text" name="amount" className="form-control" placeholder="Token Amount" />
								</div>

								<div className="my-3">
									<label className="form-label">Token symbol</label>
									<input type="bytes32" name="ticker" className="form-control" placeholder="Token Symbol" />
								</div>
								<button type="submit" className="btn btn-primary mt-3">
									Withdraw Tokens
								</button>
								<div className="my-4 mb-2">
									{isLoading ? (
										<div className="alert alert-dismissible alert-warning">
											<strong>...Loading</strong> Transaction is being processed
										</div>
									) : null}
									{errorDexWithdraw && (
										<div className="alert alert-dismissible alert-danger">
											<button
												type="button"
												className="btn-close"
												data-bs-dismiss="alert"
												onClick={() => setErrorDexWithdraw(false)}
											></button>
											<strong>Oh no!</strong> Token balance may be insufficient or token does not exist. Add ETH
											ticker/symbol to the DEX or this message got triggered on reload.
										</div>
									)}
								</div>
							</form>
						</div>
					</div>
				</div>
				{/* get Dex balances */}
				<div className="box-2">
					<div className="card">
						<div className="card-body">
							<h6 className="card-subtitle mb-2 text-muted">DEX ETH Balance</h6>
						</div>
						<Wrapper3 className="text-warning">
							<div>
								<strong>Address:</strong> {ethDexBalance.address}
							</div>
							<div>
								<strong>Amount:</strong> {ethDexBalance.ethBal} ETH
							</div>
						</Wrapper3>
					</div>
					<br />
					<div className="card">
						<div className="card-body">
							<h6 className="card-subtitle mb-2 text-muted">DEX Token Balances</h6>
						</div>
						<Wrapper3 className="text-warning">
							<DexBalances dexBalanceInfo={dexBalanceInfo} />
						</Wrapper3>
					</div>
					<div className="box-refresh">
						<button className="btn btn-primary mt-3" onClick={refresh}>
							Refresh Balances
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

export default DexTransact;
