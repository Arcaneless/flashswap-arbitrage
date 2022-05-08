// SPDX-License-Identifier: MIT
pragma solidity >=0.6.6 <0.9.0;

import "hardhat/console.sol";

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IJoeRouter02} from "@traderjoe-xyz/core/contracts/traderjoe/interfaces/IJoeRouter02.sol";
import {JoeLibrary} from "./libraries/JoeLibrary.sol";

import {IPangolinRouter} from "@pangolindex/exchange-contracts/contracts/pangolin-periphery/interfaces/IPangolinRouter.sol";
import {PangolinLibrary} from "./libraries/PangolinLibrary.sol";

import {GenericLibrary} from "./libraries/GenericLibrary.sol";

contract FlashSwap is FlashLoanSimpleReceiverBase, Ownable {
    IJoeRouter02 private joeRouter;
    IPangolinRouter private pangolinRouter;

    address private immutable joeFactory;
    address private immutable pangolinFactory;

    uint256 private constant deadline = 30000 days;
    address public immutable WAVAX;

    constructor(
        IPoolAddressesProvider _provider,
        IJoeRouter02 _joeRouter,
        address _joeFactory,
        IPangolinRouter _pangolinRouter,
        address _pangolinFactory,
        address _WAVAX
    ) FlashLoanSimpleReceiverBase(_provider) {
        joeRouter = _joeRouter;
        joeFactory = _joeFactory;
        pangolinRouter = _pangolinRouter;
        pangolinFactory = _pangolinFactory;
        WAVAX = _WAVAX;
    }

    function addReserve() external payable {
        console.log("added reserve", msg.value);
    }

    function quotePrice(address tokenAddress)
        internal
        view
        returns (uint256 joeQuote, uint256 pngQuote)
    {
        // the path 1
        address[] memory path = new address[](2);
        path[0] = tokenAddress;
        path[1] = WAVAX;

        // amount out joe
        joeQuote = JoeLibrary.getAmountsOut(joeFactory, 1 ether, path)[1];

        // amount out ong
        pngQuote = PangolinLibrary.getAmountsOut(
            pangolinFactory,
            1 ether,
            path
        )[1];

        console.log("Joe Quote", joeQuote, "Png Quote", pngQuote);
    }

    function joeToPng(address _token, uint256 _amount)
        internal
        returns (uint256)
    {
        // the path 1
        address[] memory path1 = new address[](2);
        path1[0] = WAVAX;
        path1[1] = _token;

        // amount out
        uint256 amountRequired1 = JoeLibrary.getAmountsOut(
            joeFactory,
            _amount,
            path1
        )[1];

        IERC20(WAVAX).approve(address(joeRouter), _amount);
        uint256 amountReceived1 = joeRouter.swapExactTokensForTokens(
            _amount,
            amountRequired1,
            path1,
            address(this),
            deadline
        )[1];

        console.log(
            "amountExpect",
            "amountReceived1",
            amountRequired1,
            amountReceived1
        );

        address[] memory path2 = new address[](2);
        path2[0] = _token;
        path2[1] = WAVAX;

        // amount out
        uint256 amountRequired2 = PangolinLibrary.getAmountsOut(
            pangolinFactory,
            amountReceived1,
            path2
        )[1];

        IERC20(_token).approve(address(pangolinRouter), amountReceived1);
        uint256 terminalAmount = pangolinRouter.swapExactTokensForTokens(
            amountReceived1,
            amountRequired2,
            path2,
            address(this),
            deadline
        )[1];

        console.log(
            "amountExpected",
            "amountReceived2",
            amountRequired2,
            terminalAmount
        );

        return terminalAmount;
    }

    function pngToJoe(address _token, uint256 _amount)
        internal
        returns (uint256)
    {
        // the path 1
        address[] memory path1 = new address[](2);
        path1[0] = WAVAX;
        path1[1] = _token;

        // amount out
        uint256 amountRequired1 = PangolinLibrary.getAmountsOut(
            pangolinFactory,
            _amount,
            path1
        )[1];

        IERC20(WAVAX).approve(address(pangolinRouter), _amount);
        uint256 amountReceived1 = pangolinRouter.swapExactTokensForTokens(
            _amount,
            amountRequired1,
            path1,
            address(this),
            deadline
        )[1];

        console.log(
            "amountExpect",
            "amountReceived1",
            amountRequired1,
            amountReceived1
        );

        address[] memory path2 = new address[](2);
        path2[0] = _token;
        path2[1] = WAVAX;

        // amount out
        uint256 amountRequired2 = JoeLibrary.getAmountsOut(
            joeFactory,
            amountReceived1,
            path2
        )[1];

        IERC20(_token).approve(address(joeRouter), amountReceived1);
        uint256 terminalAmount = joeRouter.swapExactTokensForTokens(
            amountReceived1,
            amountRequired2,
            path2,
            address(this),
            deadline
        )[1];

        console.log(
            "amountExpected",
            "amountReceived2",
            amountRequired2,
            terminalAmount
        );

        return terminalAmount;
    }

    /**
        This function is called after your contract has received the flash loaned amount
     */
    function executeOperation(
        address _asset,
        uint256 _amount,
        uint256 _premium,
        address, // initiator
        bytes memory _params
    ) external override returns (bool) {
        require(
            _amount <= IERC20(_asset).balanceOf(address(this)),
            "Invalid balance for this contract"
        );

        console.log("balance", IERC20(_asset).balanceOf(address(this)));

        uint256 totalDebt = _amount + _premium;
        console.log("total flashed amount", _amount, _premium);
        console.log("total debt amount", totalDebt);

        //
        // Your logic goes here.
        // !! Ensure that *this contract* has enough of `_reserve` funds to payback the `_fee` !!
        // From Joe swap to token, From Png swap to wavax
        // Repay
        //
        address tokenOnArb = abi.decode(_params, (address));
        (uint256 joeQuote, uint256 pngQuote) = quotePrice(tokenOnArb);

        if (joeQuote > pngQuote) {
            console.log("Swapping from PNG to JOE");
        } else {
            console.log("Swapping from JOE to PNG");
        }

        uint256 terminalAmount = joeQuote > pngQuote
            ? pngToJoe(tokenOnArb, _amount)
            : joeToPng(tokenOnArb, _amount);

        if (totalDebt > terminalAmount) {
            console.log("difference", totalDebt - terminalAmount);
        } else {
            console.log("Profit", terminalAmount - totalDebt);
        }

        IERC20(_asset).approve(address(POOL), totalDebt);
        console.log("approved");

        return true;
    }

    function arbitrage(uint256 _amount, address _tokenOnArb)
        external
        onlyOwner
    {
        bytes memory param = abi.encode(_tokenOnArb);

        // get the correct pool from pool addresses provider
        // and perform flashloan
        console.log("about to perform flashloan");
        POOL.flashLoanSimple(address(this), WAVAX, _amount, param, 0);
        console.log("performed flashloan");
    }
}
