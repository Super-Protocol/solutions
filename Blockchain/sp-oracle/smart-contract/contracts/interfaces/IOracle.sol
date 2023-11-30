// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../types/OracleData.sol";

interface IOracle {
    function getMrEnclave() external view returns(bytes32);

    function getMrSigner() external view returns(bytes32);

    function getDataCounts(bytes32 key) external view returns(uint256);

    function getCurrentData(bytes32 key) external view returns(OracleData memory);

    function getDataHistory(bytes32 key, uint256 from, uint256 to) external view returns(OracleData[] memory);
}