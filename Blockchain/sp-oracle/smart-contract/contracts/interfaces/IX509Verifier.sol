// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IX509Verifier {
    function checkTEEQuote(
        bytes memory quote,
        bytes memory data,
        bytes memory appHash,
        bytes memory mrSigner,
    ) external view returns(bool);
}