// SPDX-License-Identifier: MIT
pragma solidity >=0.6.6 <0.9.0;

import "hardhat/console.sol";

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IJoeRouter02} from "@traderjoe-xyz/core/contracts/traderjoe/interfaces/IJoeRouter02.sol";

import {IPangolinRouter} from "@pangolindex/exchange-contracts/contracts/pangolin-periphery/interfaces/IPangolinRouter.sol";

import {GenericLibrary} from "./libraries/GenericLibrary.sol";

contract FlashSwap is FlashLoanSimpleReceiverBase, Ownable {
    uint256 private constant deadline = 30000 days;
    address public immutable WAVAX;

    struct DEX {
        string name;
        address router;
        address factory;
        bytes secret;
    }

    // router => DEX
    mapping(address => DEX) private dexes;

    constructor(IPoolAddressesProvider _provider, address _WAVAX)
        FlashLoanSimpleReceiverBase(_provider)
    {
        WAVAX = _WAVAX;
    }

    function addReserve() external payable {
        console.log("added reserve", msg.value);
    }

    function addDex(
        string memory _name,
        address _router,
        address _factory,
        bytes memory _secret
    ) external {
        dexes[_router] = DEX(_name, _router, _factory, _secret);
    }

    // find the maximum path to perform arbitrage
    function quotePrice(
        address _tokenAddress,
        address _dex1,
        address _dex2
    ) internal view returns (address fromDex, address toDex) {
        // the quotation path
        address[] memory path = new address[](2);
        path[0] = _tokenAddress;
        path[1] = WAVAX;

        uint256 quote1 = GenericLibrary.getAmountsOut(
            dexes[_dex1].factory,
            1 ether,
            path,
            dexes[_dex1].secret
        )[1];

        uint256 quote2 = GenericLibrary.getAmountsOut(
            dexes[_dex2].factory,
            1 ether,
            path,
            dexes[_dex2].secret
        )[1];

        console.log("quote of", dexes[_dex1].name, "is", quote1);
        console.log("quote of", dexes[_dex2].name, "is", quote2);
        require(quote1 != quote2, "two quotes cannot equal");
        if (quote1 < quote2) {
            fromDex = _dex1;
            toDex = _dex2;
        }
        if (quote1 > quote2) {
            fromDex = _dex2;
            toDex = _dex1;
        }
    }

    function swapBetweenDex(
        address _token,
        uint256 _amount,
        address _fromDex,
        address _toDex
    ) internal returns (uint256) {
        // the path 1
        address[] memory path1 = new address[](2);
        path1[0] = WAVAX;
        path1[1] = _token;

        DEX memory fromDex = dexes[_fromDex];
        DEX memory toDex = dexes[_toDex];

        // amount out
        uint256 amountExpected1 = GenericLibrary.getAmountsOut(
            fromDex.factory,
            _amount,
            path1,
            fromDex.secret
        )[1];

        IERC20(WAVAX).approve(address(fromDex.router), _amount);

        (bool fromSuccess, bytes memory fromResult) = fromDex.router.call(
            abi.encodeWithSignature(
                "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
                _amount,
                amountExpected1,
                path1,
                address(this),
                deadline
            )
        );

        require(fromSuccess, "fromDex router call failed");

        uint256 amountReceivedFrom = abi.decode(fromResult, (uint256[]))[1];

        console.log(
            "amountExpected",
            "amountReceived1",
            amountExpected1,
            amountReceivedFrom
        );

        address[] memory path2 = new address[](2);
        path2[0] = _token;
        path2[1] = WAVAX;

        // amount out
        uint256 amountExpected2 = GenericLibrary.getAmountsOut(
            toDex.factory,
            amountReceivedFrom,
            path2,
            toDex.secret
        )[1];

        IERC20(_token).approve(address(toDex.router), amountReceivedFrom);
        (bool toSuccess, bytes memory toResult) = toDex.router.call(
            abi.encodeWithSignature(
                "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
                amountReceivedFrom,
                amountExpected2,
                path2,
                address(this),
                deadline
            )
        );

        require(toSuccess, "toDex router call failed");

        uint256 terminalAmount = abi.decode(toResult, (uint256[]))[1];

        console.log(
            "amountExpected",
            "amountReceived2",
            amountExpected2,
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
        console.log("flashed amount", _amount, "premium", _premium);
        console.log("total should return", totalDebt);

        //
        // Your logic goes here.
        // !! Ensure that *this contract* has enough of `_reserve` funds to payback the `_fee` !!
        // From Joe swap to token, From Png swap to wavax
        // Repay
        //
        (address tokenOnArb, address dexA, address dexB) = abi.decode(
            _params,
            (address, address, address)
        );
        (address fromDex, address toDex) = quotePrice(tokenOnArb, dexA, dexB);

        console.log(
            "Swapping from",
            dexes[fromDex].name,
            "to",
            dexes[toDex].name
        );

        uint256 terminalAmount = swapBetweenDex(
            tokenOnArb,
            _amount,
            fromDex,
            toDex
        );

        if (totalDebt > terminalAmount) {
            console.log("difference", totalDebt - terminalAmount);
        } else {
            console.log("Profit", terminalAmount - totalDebt);
        }

        require(totalDebt <= terminalAmount, "Insufficiant Balance");

        IERC20(_asset).approve(address(POOL), totalDebt);
        return true;
    }

    function arbitrage(
        uint256 _amount,
        address _tokenOnArb,
        address _dexA,
        address _dexB
    ) external onlyOwner {
        bytes memory param = abi.encode(_tokenOnArb, _dexA, _dexB);

        // get the correct pool from pool addresses provider
        // and perform flashloan
        console.log("about to perform flashloan");
        POOL.flashLoanSimple(address(this), WAVAX, _amount, param, 0);
        console.log("performed flashloan");
    }
}
