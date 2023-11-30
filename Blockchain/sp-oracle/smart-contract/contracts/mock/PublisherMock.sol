// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IX509Verifier.sol";

contract PublisherMock {
    ChunkedX509Cert public deviceCert;
    ChunkedX509Cert public intermCert;
    ChunkedSGXQuote public parsedQuoteData;
    address public sessionPublicKeyHash;

    bytes32 public key;
    bytes public value;
    bytes public signature;
    bytes public callback;

    function initSessionKey(
        ChunkedX509Cert calldata _deviceCert,
        ChunkedX509Cert calldata _intermCert,
        ChunkedSGXQuote calldata _parsedQuoteData,
        address _sessionPublicKeyHash
    ) external {
        deviceCert = _deviceCert;
        intermCert = _intermCert;
        parsedQuoteData = _parsedQuoteData;
        sessionPublicKeyHash = _sessionPublicKeyHash;
    }

    function add(
        bytes32 _key,
        bytes calldata _value,
        bytes calldata _signature,
        bytes calldata _callback
    ) external {
        key = _key;
        value = _value;
        signature = _signature;
        callback = _callback;
    }
}
