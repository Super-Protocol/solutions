// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

uint256 constant QUOTE_MRSIGNER_OFFSET = 0x60;
uint256 constant QUOTE_MRENCLAVE_OFFSET = 0xA0;
uint256 constant QUOTE_DATAHASH_OFFSET = 0x160;

struct SGXQuoteData {
    bytes32 mrEnclave;
    bytes32 mrSigner;
    bytes32 dataHash;
}

struct ChunkedSGXQuote {
    bytes header;
    bytes isvReport;
    bytes isvReportSignature;
    bytes attestationKey;
    bytes qeReport;
    bytes qeReportSignature;
    bytes qeAuthenticationData;
}