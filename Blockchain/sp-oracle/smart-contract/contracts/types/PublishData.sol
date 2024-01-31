// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct PublishData {
    uint32 apiTimestamp;
    uint256 numerator;
    uint256 denominator;
    uint32 nonce;
    bool sign;
}
