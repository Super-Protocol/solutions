// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract VerificatorMock {
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

  function checkTEEQuote(
    ChunkedX509Cert calldata,
    ChunkedX509Cert calldata,
    ChunkedSGXQuote calldata,
    bytes32,
    bytes32,
    bytes32
  ) public pure returns(bool) {
    return true;
  }
}
