// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../types/OracleDataType.sol";

interface IOracle {
    function appHash() external view returns(string);

    function mrSigner() external view returns(string);

    function getCurrentData(bytes32 key) external view returns(OracleData memory);

    function getCurrentRawData(bytes32 key) external view returns(bytes memory);

    function getDataHistory(bytes32 key, uint256 from, uint256 to) external view returns(OracleData[] memory);
}