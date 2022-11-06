# jeslyn_dapp_exchange_project
final updated version

## task
build a minimal viable decentralized exchange (dex) on ethereum and a simple (minimally styled) front-end website, which supports listing of available asset tokens on the marketplace, submission of trading order, matching and execution of orders (i.e. swapping/exchanging/trading assets), and most importantly, in our dex, users have the ultimate control of his/her own digital assets.

## set up metamask
1. login
2. add network and set:
- network name to be something like hardhat or anything else you would like
- new rpc url = "http://localhost:8545"
- chain id = "1337"
- currency symbol = "ETH"

## set up with these commands
1. "npm install --no-audit"
this will install the deoendencies based on package.json
2. "npm run build"
this will build the relavant contracts involved in the project
3. "npm run test"
this will ensure that what you have installed and built is correct

## run application with these commands and steps after set up
1. "npm run node"
this will run the hardhat node which is the local blockchain, remember to add the first two addresses into metamask (import account) to simulate alice and bob
2. "npm run contracts"
this command will deploy the contracts in the network if you have not done so already, the contracts will be mapped to various addresses like seen below:
- const tokenContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
- const dexContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
- do note that: these constants need to be updated in src/app.js
3. "npm run start"
this will start the web app, make sure you have changed into the addresses of the hardhat nodes stated in step 1, and thereafter you can connect into the webapp by clicking the webapp's connect button
4. enjoy

## demo 
- i sound so done with life its actually hilarious
- i am not done with life but i am just unwell thank you for your kind understanding 
- https://youtu.be/ZJs-6lsv14E

