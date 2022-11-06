// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract BirdToken is ERC20 {
    mapping(address => uint256) public balances;
    constructor() ERC20("Bird Token", "BIRD") {
        _mint(msg.sender, 100000 * (10**18));
    }
}

contract CatToken is ERC20 {
    mapping(address => uint256) public balances;
    constructor() ERC20("Cat Token", "CAT") {
        _mint(msg.sender, 100000 * (10**18));
    }
}

contract DogToken is ERC20 {
    mapping(address => uint256) public balances;
    constructor() ERC20("Dog Token", "DOG") {
        _mint(msg.sender, 100000 * (10**18));
    }
}

contract WETH is ERC20 {
    mapping(address => uint256) public balances;
    constructor() ERC20("Wrapped Ether", "WETH") {
        _mint(msg.sender, 100000 * (10**18));
    }
}

// approve function max ammount - infinity uint256 amount
//115792089237316195423570985008687907853269984665640564039457584007913129639935
