// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./libs/EllipticCurve.sol";
import "./types/ChunkedSGXQuote.sol";
import "./types/ChunkedX509Cert.sol";
import "./types/Errors.sol";

contract Verifier is EllipticCurve {
  ChunkedX509Cert public rootCert;

  constructor(ChunkedX509Cert memory root) {
    require(verifyCert(root, root.publicKey), "Invalid root cert");

    rootCert = root;
  }

  function _formatBytesToUint(bytes memory input) private pure returns(uint256[2] memory output) {
    require(input.length == 64, "Signature must be 64 bytes");

    assembly {
      let outputPointer := add(output, 0x00)
      mstore(outputPointer, mload(add(input, 0x20)))
      mstore(add(outputPointer, 0x20), mload(add(input, 0x40)))
    }

    return output;
  }

  function _parseQuoteReport(bytes memory rawReport) private pure returns(SGXQuoteData memory report) {
    require(rawReport.length == 384, "Report must be 384 bytes");

    bytes32 mrSigner;
    bytes32 mrEnclave;
    bytes32 dataHash;

    assembly {
      mrSigner := mload(add(rawReport, QUOTE_MRSIGNER_OFFSET))
      mrEnclave := mload(add(rawReport, QUOTE_MRENCLAVE_OFFSET))
      dataHash := mload(add(rawReport, QUOTE_DATAHASH_OFFSET))
    }

    report = SGXQuoteData(mrSigner, mrEnclave, dataHash);
  }

  function ecdsaOnKeccak256r1(
    bytes memory message,
    bytes memory signature,
    bytes memory publicKey
  ) public pure returns(bool) {
    return EllipticCurve._ecdsaOnKeccak256r1(
      sha256(message),
      _formatBytesToUint(signature),
      _formatBytesToUint(publicKey)
    );
  }

  function verifyCert(ChunkedX509Cert memory cert, bytes memory publicKey) public pure returns (bool) {
    // TODO: isNotExperied

    bytes memory certificateBody = abi.encodePacked(
      cert.bodyPartOne,
      cert.publicKey,
      cert.bodyPartTwo
    );
    return ecdsaOnKeccak256r1(certificateBody, cert.signature, publicKey);
  }

  function checkTEEQuote(
    ChunkedX509Cert calldata leaf,
    ChunkedX509Cert calldata intermediate,
    ChunkedSGXQuote calldata quote,
    bytes32 mrEnclave,
    bytes32 mrSigner,
    bytes32 dataHash
  ) public view returns(bool) {
    if (!verifyCert(intermediate, rootCert.publicKey)) {
      revert InvalidCertSignature();
    }
    if (!verifyCert(leaf, intermediate.publicKey)) {
      revert InvalidCertSignature();
    }

    // (1) Verify QE Report signature with PCK Certificate
    if (!ecdsaOnKeccak256r1(
      quote.qeReport,
      quote.qeReportSignature,
      abi.encodePacked(leaf.publicKey)
    )) {
      revert InvalidQeSignature();
    }

    // (2) Compare QE report data (first 32 bytes) with SHA256 hash
    SGXQuoteData memory parsedQeReport = _parseQuoteReport(quote.qeReport);
    if (parsedQeReport.dataHash != sha256(
      abi.encodePacked(quote.attestationKey, quote.qeAuthenticationData)
    )) {
      revert InvalidQeReportDataHash();
    }

    // (3) Verify ISV Enclaver Report signature with ECDSA Attestation Key
    if (!ecdsaOnKeccak256r1(
      abi.encodePacked(quote.header, quote.isvReport),
      quote.isvReportSignature,
      quote.attestationKey
    )) {
      revert InvalidEnclaveSignature();
    }

    SGXQuoteData memory parsedIsvReport = _parseQuoteReport(quote.isvReport);
    if (parsedIsvReport.mrEnclave != mrEnclave) {
      revert WrongMrEnclave();
    }
    if (parsedIsvReport.mrSigner != mrSigner) {
      revert WrongMrSigner();
    }
    if (parsedIsvReport.dataHash != dataHash) {
      revert WrongDataHash();
    }

    return true;
  }
}
