// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IOracle.sol";
import "./interfaces/IX509Verifier.sol";
import "./types/OracleDataType.sol";
import "./types/RateDataType.sol";

/**
 * Example of user application which realises oracle capabilities
 * 
 */

contract App {
    IOracle immutable oracle;
    IX509Verifier immutable x509Verifier;
    bytes immutable oracleAppHash;
    bytes immutable oracleMrSigner;

    error RequestFailed(address endpoint, bytes request);
    error InvalidQuote(bytes quote);
    error OutdatedData(uint32 diff);

    constructor(address _oracle, address _x509Verifier) {
        oracle = IOracle(_oracle);
        x509Verifier = IX509Verifier(_x509Verifier);
        oracleAppHash = oracle.appHash();
        oracleMrSigner = oracle.oracleMrSigner();
    }

    function _fetchRate(bytes32 key, bool verifyQuote, int32 maxTimeDiff) private view returns(uint256 numerator, uint256 denominator) { 
        try oracle.getCurrent(key) returns (OracleData memory response) {
            if (verifyQuote) {
                // check if recived data from valid script and it was processed on TEE
                try x509Verifier.checkTEEQuote(
                    response.quote,
                    response.value,
                    oracleAppHash,
                    oracleMrSigner
                ) returns (bool verified) {
                    if (!verified) revert InvalidQuote(response.quote);    
                } catch {
                    revert RequestFailed(address(x509Verifier), response.quote);
                }
            }

            RateDataType memory data = abi.decode(response.value, (RateDataType));

            // check timestamp shifit (between block and api server)
            if (maxTimeDiff >= 0) {
                uint32 diff = data.apiTimestamp > response.timestamp ?
                    data.apiTimestamp - response.timestamp :
                    response.timestamp - data.apiTimestamp;
                if (diff > uint32(maxTimeDiff)) revert OutdatedData(diff);
            }

            // target
            numerator = data.numerator;
            denominator = data.denominator;
        } catch {
            revert RequestFailed(address(oracle), abi.encodePacked(key));
        }
    }

    // case with on-chain TEE quote checking
    function processA() public view returns(uint256) {
        bytes32 requestKey = keccak256("BTC/USD");

        // this is rate of BTC/USD transformed into two integers,
        // bcs Solidity isn't support a fractionals numbers.
        (uint256 numerator, uint256 denominator) = _fetchRate(requestKey, true, 1 hours); 

        // ... here will be business logic with fetched 'exchangeRate'
        return numerator / denominator + 1;
    }

    // case without on-chain TEE quote checking and without timestamp shift checking
    // this case cheaper, but not 100% secure
    function processB() public view returns(uint256) {
        bytes32 requestKey = keccak256("BTC/USD");

        // this is rate of BTC/USD transformed into two integers,
        // bcs Solidity isn't support a fractionals numbers.
        (uint256 numerator, uint256 denominator) = _fetchRate(requestKey, false, -1);

        // ... here will be business logic with fetched 'exchangeRate'
        return numerator / denominator  + 2;
    }
}
