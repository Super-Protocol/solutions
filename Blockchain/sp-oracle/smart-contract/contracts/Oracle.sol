// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IOracle.sol";
import "./types/OracleData.sol";
import "./Publisher.sol";

/// @notice the "view" part of oracle smart-contract
contract Oracle is Publisher, IOracle {

    error Empty();
    error OutOfIndex();

    constructor(
        address[] memory publishers,
        address X509Verifier,
        bytes32 mrEnclave,
        bytes32 mrSigner
    ) Publisher(publishers, X509Verifier, mrEnclave, mrSigner) {}

    /// @notice getter
    function getMrSigner() external view returns(bytes32) {
        return Publisher.mrSigner;
    }

    /// @notice getter
    function getMrEnclave() external view returns(bytes32) {
        return Publisher.mrEnclave;
    }

    /// @notice getter
    function isPublisher(address publisher) public view returns(bool) {
        return Publisher.publishers[publisher];
    }

    /// @notice
    /// @param key - Identificator of data. e.g. keccak256('NewYork_temperatureT') 
    function getCurrentData(bytes32 key) public view returns (OracleData memory) {
        uint256 dataLength = data[key].length;
        if (dataLength == 0) {
            revert Empty();
        }
        uint256 currentIndex = dataLength - 1;

        return data[key][currentIndex];
    }

    /// @notice
    /// @param key - Identificator of data. e.g. keccak256('NewYork_temperatureT') 
    function getDataCounts(bytes32 key) public view returns (uint256) {
        return data[key].length;
    }

    /// @notice
    /// @param key - Identificator of data. e.g. keccak256('NewYork_temperatureT') 
    /// @param from - 
    /// @param to - 
    function getDataHistory(
        bytes32 key,
        uint256 from,
        uint256 to
    ) public view returns (OracleData[] memory) {
        uint256 dataLength = data[key].length;
        if (dataLength == 0) {
            revert Empty();
        }

        uint256 currentIndex = dataLength - 1;
        if (from > currentIndex) {
            revert OutOfIndex();
        }
        if (to > currentIndex) {
            to = currentIndex;
        }

        uint256 responseSize = to - from + 1;
        OracleData[] memory response = new OracleData[](responseSize);

        uint256 idx;
        for (idx = from; idx < to; idx++) {
            response[idx - from] = data[key][idx];
        }

        return response;
    }
}
