// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

function recoverStringFromRaw(bytes32 message, bytes calldata sig) pure returns (address) {
    // Sanity check before using assembly
    require(sig.length == 65, "invalid signature");

    // Decompose the raw signature into r, s and v (note the order)
    uint8 v;
    bytes32 r;
    bytes32 s;
    assembly {
    r := calldataload(sig.offset)
    s := calldataload(add(sig.offset, 0x20))
    v := calldataload(add(sig.offset, 0x21))
    }

    return _ecrecover(message, v, r, s);
}

function _ecrecover(bytes32 message, uint8 v, bytes32 r, bytes32 s) pure returns (address) {
    // Compute the EIP-191 prefixed message
    bytes memory prefixedMessage = abi.encodePacked(
        "\x19Ethereum Signed Message:\n",
        itoa(bytes(toHex(message)).length),
        toHex(message)
    );

    // Compute the message digest
    bytes32 digest = keccak256(prefixedMessage);

    // Use the native ecrecover provided by the EVM
    return ecrecover(digest, v, r, s);
}

function itoa(uint value) pure returns (string memory) {

    // Count the length of the decimal string representation
    uint length = 1;
    uint v = value;
    while ((v /= 10) != 0) { length++; }

    // Allocated enough bytes
    bytes memory result = new bytes(length);

    // Place each ASCII string character in the string,
    // right to left
    while (true) {
        length--;

        // The ASCII value of the modulo 10 value
        result[length] = bytes1(uint8(0x30 + (value % 10)));

        value /= 10;

        if (length == 0) { break; }
    }

    return string(result);
}

function toHex16 (bytes16 data) pure returns (bytes32 result) {
    result = bytes32 (data) & 0xFFFFFFFFFFFFFFFF000000000000000000000000000000000000000000000000 |
        (bytes32 (data) & 0x0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000) >> 64;
    result = result & 0xFFFFFFFF000000000000000000000000FFFFFFFF000000000000000000000000 |
        (result & 0x00000000FFFFFFFF000000000000000000000000FFFFFFFF0000000000000000) >> 32;
    result = result & 0xFFFF000000000000FFFF000000000000FFFF000000000000FFFF000000000000 |
        (result & 0x0000FFFF000000000000FFFF000000000000FFFF000000000000FFFF00000000) >> 16;
    result = result & 0xFF000000FF000000FF000000FF000000FF000000FF000000FF000000FF000000 |
        (result & 0x00FF000000FF000000FF000000FF000000FF000000FF000000FF000000FF0000) >> 8;
    result = (result & 0xF000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000) >> 4 |
        (result & 0x0F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F00) >> 8;
    result = bytes32 (0x3030303030303030303030303030303030303030303030303030303030303030 +
        uint256 (result) +
        (uint256 (result) + 0x0606060606060606060606060606060606060606060606060606060606060606 >> 4 &
        0x0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F) * 39);
}

function toHex (bytes32 data) pure returns (string memory) {
    return string (abi.encodePacked ("0x", toHex16 (bytes16 (data)), toHex16 (bytes16 (data << 128))));
}