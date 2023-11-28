// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./types/OracleDataType.sol";
import "./interfaces/IOracle.sol";

contract Oracle is IOracle {
    error AccessForbidden();
    error NoDataAvailable();
    error OutOfIndex();

    mapping(bytes32 => OracleData[]) public data;
    address[] private publishers;
    string constant appHash;
    string constant mrSigner;

    constructor(address[] memory _publishers, bytes _appHash, string _mrSigner) {
        publishers = _publishers;
        appHash = _appHash;
        mrSigner = _mrSigner;
    }

    function add(bytes32 key, bytes memory value, bytes memory quote) public onlyPublisher {
        OracleData memory newData;
        newData.quote = quote;
        newData.value = value;
        newData.timestamp = uint32(block.timestamp);

        data[key].push(newData);
    }

    function getCurrentData(bytes32 key) public view returns(OracleData memory) {
        uint256 currentIndex = data[key].length - 1;
        if (currentIndex == 0) revert NoDataAvailable();

        return data[key][currentIndex];
    }

    function getCurrentRawData(bytes32 key) public view returns(bytes memory) {
        uint256 currentIndex = data[key].length - 1;
        if (currentIndex == 0) revert NoDataAvailable();

        return data[key][currentIndex].value;
    }

    function getDataCounts(bytes key) public view returns(uint256) {
        return data[key].length;
    }

    function getDataHistory(bytes32 key, uint256 from, uint256 to) public view returns(OracleData[] memory) {
        uint256 currentIndex = data[key].length - 1;
        if (currentIndex == 0) revert NoDataAvailable();
        if (from > currentIndex) revert OutOfIndex();

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

    modifier onlyPublisher {
        bool isPublisher;
        uint256 idx;

        for (idx = 0; idx < publishers.length; idx++) {
            if (publishers[idx] == msg.sender) {
                isPublisher = true;
                break;
            }
        }

        if (!isPublisher) revert AccessForbidden();

        _;
    }
}
