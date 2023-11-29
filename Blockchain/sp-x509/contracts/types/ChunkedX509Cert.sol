// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct ChunkedX509Cert {
    bytes bodyPartOne;
    bytes publicKey;
    bytes bodyPartTwo;
    bytes signature;
    // expiration date
}
