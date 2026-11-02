// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TipJar
 * @author On-Chain Hacker Terminal
 * @notice An on-chain tip jar contract that accepts native ETH tips with text memos
 *         and emits verifiable blockchain event logs.
 */
contract TipJar {
    // Structure of a tip recorded on-chain
    struct Tip {
        address tipper;
        uint256 amount;
        string memo;
        uint256 timestamp;
        uint256 blockNumber;
    }

    // Owner of the tip jar (can withdraw accumulated funds)
    address payable public immutable owner;

    // Array of all tips received
    Tip[] private tips;

    // Total metrics
    uint256 public totalTipsCount;
    uint256 public totalVolumeWei;

    // Per-tipper tracking
    mapping(address => uint256) public tipperTotalAmount;
    mapping(address => uint256) public tipperCount;

    // Maximum memo length to prevent excessive gas usage
    uint256 public constant MAX_MEMO_LENGTH = 280;

    // Events
    event TipReceived(
        address indexed tipper,
        uint256 amount,
        string memo,
        uint256 timestamp,
        uint256 indexed tipId
    );

    event FundsWithdrawn(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );

    event OwnershipTransferAttempt(
        address indexed caller,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "ERR: CALLER_NOT_OWNER");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @notice Send a native ETH tip with an on-chain text memo
     * @param _memo Short message from the sender to be emitted into the event log
     */
    function sendTip(string calldata _memo) external payable {
        require(msg.value > 0, "ERR: ZERO_VALUE_TIP_NOT_ALLOWED");
        require(bytes(_memo).length <= MAX_MEMO_LENGTH, "ERR: MEMO_EXCEEDS_MAX_LENGTH_280");

        uint256 currentTipId = tips.length;

        tips.push(Tip({
            tipper: msg.sender,
            amount: msg.value,
            memo: _memo,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        totalTipsCount += 1;
        totalVolumeWei += msg.value;
        tipperTotalAmount[msg.sender] += msg.value;
        tipperCount[msg.sender] += 1;

        emit TipReceived(
            msg.sender,
            msg.value,
            _memo,
            block.timestamp,
            currentTipId
        );
    }

    /**
     * @notice Fallback to accept direct ETH transfers without memo
     */
    receive() external payable {
        require(msg.value > 0, "ERR: ZERO_VALUE_TRANSFER");

        uint256 currentTipId = tips.length;
        string memory defaultMemo = "[DIRECT_TRANSFER_NO_MEMO]";

        tips.push(Tip({
            tipper: msg.sender,
            amount: msg.value,
            memo: defaultMemo,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        totalTipsCount += 1;
        totalVolumeWei += msg.value;
        tipperTotalAmount[msg.sender] += msg.value;
        tipperCount[msg.sender] += 1;

        emit TipReceived(
            msg.sender,
            msg.value,
            defaultMemo,
            block.timestamp,
            currentTipId
        );
    }

    /**
     * @notice Retrieve all stored tips
     */
    function getAllTips() external view returns (Tip[] memory) {
        return tips;
    }

    /**
     * @notice Retrieve recent tips with pagination (start index and limit)
     */
    function getRecentTips(uint256 offset, uint256 limit) external view returns (Tip[] memory) {
        uint256 total = tips.length;
        if (offset >= total) {
            return new Tip[](0);
        }

        uint256 count = limit;
        if (offset + count > total) {
            count = total - offset;
        }

        Tip[] memory page = new Tip[](count);
        for (uint256 i = 0; i < count; i++) {
            page[i] = tips[total - 1 - (offset + i)]; // Reverse chronological
        }
        return page;
    }

    /**
     * @notice Retrieve contract aggregate statistics
     */
    function getStats() external view returns (
        uint256 _totalTips,
        uint256 _totalVolumeWei,
        uint256 _balanceWei,
        address _owner
    ) {
        return (
            totalTipsCount,
            totalVolumeWei,
            address(this).balance,
            owner
        );
    }

    /**
     * @notice Retrieve stats for a specific tipper address
     */
    function getTipperStats(address _tipper) external view returns (
        uint256 totalDonatedWei,
        uint256 tipsSentCount
    ) {
        return (
            tipperTotalAmount[_tipper],
            tipperCount[_tipper]
        );
    }

    /**
     * @notice Owner withdraws all accumulated tips to their wallet
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "ERR: ZERO_CONTRACT_BALANCE");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "ERR: WITHDRAWAL_TRANSFER_FAILED");

        emit FundsWithdrawn(owner, balance, block.timestamp);
    }
}
