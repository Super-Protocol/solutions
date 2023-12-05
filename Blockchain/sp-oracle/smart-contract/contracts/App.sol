// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IOracle.sol";
import "./interfaces/IX509Verifier.sol";
import "./types/OracleData.sol";
import "./types/RateData.sol";

/// @notice Example of user application which realises oracle capabilities
contract App {
    error RequestFailed(address endpoint, bytes request);
    error InvalidQuote(bytes quote);
    error OutdatedData(uint32 diff);
    error InvalidMrEnclave();
    error InvalidMrSigner();

    bytes32 private mrSigner;
    bytes32 private mrEnclave;
    address immutable appOwner;
    IOracle immutable oracle;

    constructor(address _oracle) {
        oracle = IOracle(_oracle);
        appOwner = msg.sender;
    }

    /// @notice
    function _checkOracleScriptRestrictions() private view {
        if (mrSigner != bytes32(0)) {
            require(mrSigner == oracle.getMrSigner());
        }
        if (mrEnclave != bytes32(0)) {
            require(mrEnclave == oracle.getMrEnclave());
        }
    }

    /// @notice helper for fetching exchange rates
    /// @return numerator - ... 
    /// @return denominator - ... 
    function _fetchRate(bytes32 key, int32 maxTimeDiff) private view returns(uint256 numerator, uint256 denominator) {
        // optional
        _checkOracleScriptRestrictions();

        try oracle.getCurrentData(key) returns (OracleData memory response) {
            // decode DTO
            RateData memory data = abi.decode(response.value, (RateData));

            // check timestamp shift (between block and api server)
            if (maxTimeDiff >= 0) {
                uint32 diff = data.apiTimestamp > response.timestamp ?
                    data.apiTimestamp - response.timestamp :
                    response.timestamp - data.apiTimestamp;
                if (diff > uint32(maxTimeDiff)) revert OutdatedData(diff);
            }

            // target data from api
            numerator = data.numerator;
            denominator = data.denominator;
        } catch {
            revert RequestFailed(address(oracle), abi.encodePacked(key));
        }
    }

    /// @notice request example with limited data shift
    function processA() public view returns(uint256) {
        bytes32 requestKey = keccak256("BTC/USD");

        // this is rate of BTC/USD transformed into two integers,
        // bcs Solidity isn't support a fractionals numbers.
        (uint256 numerator, uint256 denominator) = _fetchRate(requestKey, 1 hours); 

        // ... here will be business logic with fetched 'exchangeRate', e.g.:
        return numerator / denominator + 1;
    }

    /// @notice request example with ignoring data shift
    function processB() public view returns(uint256) {
        bytes32 requestKey = keccak256("BTC/USD");

        // this is rate of BTC/USD transformed into two integers,
        // bcs Solidity isn't support a fractionals numbers.
        (uint256 numerator, uint256 denominator) = _fetchRate(requestKey, -1);

        // ... here will be business logic with fetched 'exchangeRate', e.g.:
        return numerator / denominator  + 2;
    }

    uint256 public savedData; // data saved by oracle callback

    /// @notice you can delegate to oracle callbacks
    function callback() public onlyOracle {
        savedData = processA();
    }

    modifier onlyOracle {
        require(msg.sender == address(oracle), "Available only for oracle");
        _;
    }

    modifier onlyAppOwner {
        require(msg.sender == appOwner);
        _;
    }
}
