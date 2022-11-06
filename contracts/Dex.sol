// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "./Wallet.sol";
import "hardhat/console.sol";

contract Dex is Wallet {
    using SafeMath for uint256;

    enum Side {
        BUY,
        SELL
    } // 0, 1

    struct Order {
        uint256 id;
        address trader;
        Side side;
        bytes32 ticker;
        uint256 amount;
        uint256 price;
        uint256 filled;
        uint256 timestamp;
    }

    uint256 public nextOrderId = 0;

    mapping(bytes32 => mapping(uint256 => Order[])) public OrderBook;

    event LimitOrder(
        address indexed trader,
        Side side,
        bytes32 indexed ticker,
        uint256 amount,
        uint256 price,
        uint256 timestanp
    );
    event MarketOrder(
        address indexed trader,
        Side side,
        bytes32 indexed ticker,
        uint256 amount,
        uint256 timestamp
    );

    function getOrderBook(bytes32 ticker, Side side)
        public
        view
        returns (Order[] memory)
    {
        return OrderBook[ticker][uint256(side)];
    }

    function depositEth() external payable {
        balances[msg.sender][bytes32("ETH")] = balances[msg.sender][
            bytes32("ETH")
        ].add(msg.value);
    }

    function createLimitOrder(
        Side side,
        bytes32 ticker,
        uint256 amount,
        uint256 price
    ) public {
        if (side == Side.BUY) {
            require(
                balances[msg.sender]["ETH"] >= amount.mul(price),
                "Not enough Eth balance"
            );
        } else if (side == Side.SELL) {
            require(
                balances[msg.sender][ticker] >= amount,
                "Low token balance"
            );
        }

        Order[] storage orders = OrderBook[ticker][uint256(side)];
        orders.push(
            Order(
                nextOrderId,
                msg.sender,
                side,
                ticker,
                amount,
                price,
                0,
                block.timestamp
            )
        );

        //Bubble sort
        uint256 i = orders.length > 0 ? orders.length - 1 : 0;

        if (side == Side.BUY) {
            while (i > 0) {
                if (orders[i - 1].price > orders[i].price) {
                    break; // if index minus 1; price is greater than the next indexed order price, stop - it's already ordered
                }
                Order memory swap = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = swap;
                i--; // this swaps the orders so that they are in the correct order
            }
        } else if (side == Side.SELL) {
            while (i > 0) {
                if (orders[i - 1].price < orders[i].price) {
                    break;
                }
                Order memory swap = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = swap;
                i--;
            }
        }
        nextOrderId++;

        emit LimitOrder(
            msg.sender,
            side,
            ticker,
            amount,
            price,
            block.timestamp
        );
    }

    function createMarketOrder(
        Side side,
        bytes32 ticker,
        uint256 amount
    ) public {
        if (side == Side.SELL) {
            // wrap this into an if statement for sell orders
            require(
                balances[msg.sender]["ETH"] >= amount,
                "Insufficient balance"
            );
        }

        uint256 orderBookSide;

        if (side == Side.BUY) {
            orderBookSide = 1;
        } else {
            orderBookSide = 0;
        }

        Order[] storage orders = OrderBook[ticker][orderBookSide];

        uint256 totalFilled = 0;

        for (uint256 i = 0; i < orders.length && totalFilled < amount; i++) {
            uint256 leftToFill = amount.sub(totalFilled); //amount minus totalFill // 200
            uint256 availableToFill = orders[i].amount.sub(orders[i].filled); //order.amount - order.filled // 100
            // trying filled as an event
            uint256 filled = 0;

            // how much we can fill from order[i]
            // update totalFilled; (once exiting loop)
            if (availableToFill > leftToFill) {
                filled = leftToFill; //fill the entire market order
            } else {
                //availableToFill <= leftToFill
                filled = availableToFill; //fill as much as is available in order[i]
            }

            totalFilled = totalFilled.add(filled);
            orders[i].filled = orders[i].filled.add(filled);
            uint256 cost = filled.mul(orders[i].price);

            // execute the trade & shift balances between buyer/seller (of each order -- subtract the balance)
            if (side == Side.BUY) {
                //verify buyer has enough ETH to cover the purchase (require)
                require(balances[msg.sender]["ETH"] >= cost);
                //execute the trade:

                //msg.sender is the buyer
                //transfer (add) ETH from Buyer to Seller and (sub) cost
                balances[msg.sender][ticker] = balances[msg.sender][ticker].add(
                    filled
                );
                balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].sub(
                    cost
                );

                //transfer (sub) Tokens from Seller to Buyer and (add) cost
                balances[orders[i].trader][ticker] = balances[orders[i].trader][
                    ticker
                ].sub(filled);
                balances[orders[i].trader]["ETH"] = balances[orders[i].trader][
                    "ETH"
                ].add(cost);
            } else if (side == Side.SELL) {
                //execute the trade:

                //msg.sender is the seller
                //transfer (sub) ETH from Buyer to Seller and (add) cost
                balances[msg.sender][ticker] = balances[msg.sender][ticker].sub(
                    filled
                );
                balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].add(
                    cost
                );

                //transfer (add) Tokens from Seller to Buyer and (sub) cost
                balances[orders[i].trader][ticker] = balances[orders[i].trader][
                    ticker
                ].add(filled);
                balances[orders[i].trader]["ETH"] = balances[orders[i].trader][
                    "ETH"
                ].sub(cost);
            }
        }

        // remove 100% filed orders, leaving partial orders in
        // continue to loop if our orders are filled and amounts are met and when the length of the array is greater than zero, otherwise, stop
        while (orders.length > 0 && orders[0].filled == orders[0].amount) {
            // Remove the top element in the orders array by overwriting every element
            // with the next element in the order list
            for (uint256 i = 0; i < orders.length - 1; i++) {
                orders[i] = orders[i + 1];
            }
            orders.pop();
        }

        emit MarketOrder(msg.sender, side, ticker, amount, block.timestamp);
    }

    function getTokenListLength() public view returns (uint256) {
        return tokenList.length;
    }
}
