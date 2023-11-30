// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct ChunkedX509Cert {
    bytes bodyPartOne;
    bytes publicKey;
    bytes bodyPartTwo;
    bytes signature;
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

interface IX509Verifier {
    function checkTEEQuote(
        ChunkedX509Cert memory deviceCert,
        ChunkedX509Cert memory intermCert,
        ChunkedSGXQuote memory quote,
        bytes32 appHash,
        bytes32 mrSigner,
        bytes32 dataHash
    ) external view returns(bool);
}