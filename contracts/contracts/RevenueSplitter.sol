// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title RevenueSplitter
 * @dev Smart contract for automated revenue distribution
 * Revenue Split: 60% Patient, 25% Hospital, 15% MediPact
 * 
 * This contract receives HBAR payments and automatically distributes
 * them according to the configured split percentages.
 */
contract RevenueSplitter {
    // Revenue split percentages (in basis points, where 10000 = 100%)
    uint256 public constant PATIENT_SHARE = 6000;      // 60%
    uint256 public constant HOSPITAL_SHARE = 2500;    // 25%
    uint256 public constant MEDIPACT_SHARE = 1500;    // 15%
    uint256 public constant TOTAL_SHARE = 10000;      // 100%

    // Recipient addresses
    address payable public patientWallet;
    address payable public hospitalWallet;
    address payable public medipactWallet;

    // Owner address (can update recipients)
    address public owner;

    // Events
    event RevenueReceived(address indexed sender, uint256 amount);
    event RevenueDistributed(
        address indexed patientWallet,
        uint256 patientAmount,
        address indexed hospitalWallet,
        uint256 hospitalAmount,
        address indexed medipactWallet,
        uint256 medipactAmount
    );
    event RecipientsUpdated(
        address indexed patientWallet,
        address indexed hospitalWallet,
        address indexed medipactWallet
    );
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Errors
    error InvalidRecipients();
    error NoFundsToDistribute();
    error TransferFailed();
    error Unauthorized();
    error InvalidAddress();

    /**
     * @dev Constructor
     * @param _patientWallet Address to receive patient share (60%)
     * @param _hospitalWallet Address to receive hospital share (25%)
     * @param _medipactWallet Address to receive MediPact share (15%)
     */
    constructor(
        address payable _patientWallet,
        address payable _hospitalWallet,
        address payable _medipactWallet
    ) {
        if (_patientWallet == address(0) || _hospitalWallet == address(0) || _medipactWallet == address(0)) {
            revert InvalidAddress();
        }

        patientWallet = _patientWallet;
        hospitalWallet = _hospitalWallet;
        medipactWallet = _medipactWallet;
        owner = msg.sender;

        emit RecipientsUpdated(_patientWallet, _hospitalWallet, _medipactWallet);
    }

    /**
     * @dev Receive HBAR payments
     * Automatically distributes received funds according to split percentages
     */
    receive() external payable {
        if (msg.value > 0) {
            emit RevenueReceived(msg.sender, msg.value);
            _distributeRevenue(msg.value);
        }
    }

    /**
     * @dev Fallback function for receiving HBAR
     */
    fallback() external payable {
        if (msg.value > 0) {
            emit RevenueReceived(msg.sender, msg.value);
            _distributeRevenue(msg.value);
        }
    }

    /**
     * @dev Manually trigger revenue distribution
     * Can be called to distribute any accumulated balance
     */
    function distributeRevenue() external {
        uint256 balance = address(this).balance;
        if (balance == 0) {
            revert NoFundsToDistribute();
        }
        _distributeRevenue(balance);
    }

    /**
     * @dev Distribute revenue with dynamic addresses (per transaction)
     * Allows different patient and hospital addresses for each distribution
     * @param _patientWallet Patient wallet address for this transaction
     * @param _hospitalWallet Hospital wallet address for this transaction
     */
    function distributeRevenueTo(
        address payable _patientWallet,
        address payable _hospitalWallet
    ) external payable {
        if (msg.value == 0) {
            revert NoFundsToDistribute();
        }
        if (_patientWallet == address(0) || _hospitalWallet == address(0)) {
            revert InvalidAddress();
        }
        
        uint256 amount = msg.value;
        
        // Calculate shares (60% patient, 25% hospital, 15% MediPact)
        uint256 patientAmount = (amount * PATIENT_SHARE) / TOTAL_SHARE;
        uint256 hospitalAmount = (amount * HOSPITAL_SHARE) / TOTAL_SHARE;
        uint256 medipactAmount = amount - patientAmount - hospitalAmount; // Handle rounding
        
        // Distribute to patient wallet (dynamic - per transaction)
        (bool success1, ) = _patientWallet.call{value: patientAmount}("");
        if (!success1) {
            revert TransferFailed();
        }
        
        // Distribute to hospital wallet (dynamic - per transaction)
        (bool success2, ) = _hospitalWallet.call{value: hospitalAmount}("");
        if (!success2) {
            revert TransferFailed();
        }
        
        // Distribute to MediPact wallet (fixed - from constructor)
        (bool success3, ) = medipactWallet.call{value: medipactAmount}("");
        if (!success3) {
            revert TransferFailed();
        }
        
        emit RevenueDistributed(
            _patientWallet,
            patientAmount,
            _hospitalWallet,
            hospitalAmount,
            medipactWallet,
            medipactAmount
        );
    }

    /**
     * @dev Internal function to distribute revenue according to split
     * @param amount Total amount to distribute
     */
    function _distributeRevenue(uint256 amount) internal {
        // Calculate shares
        uint256 patientAmount = (amount * PATIENT_SHARE) / TOTAL_SHARE;
        uint256 hospitalAmount = (amount * HOSPITAL_SHARE) / TOTAL_SHARE;
        uint256 medipactAmount = amount - patientAmount - hospitalAmount; // Handle rounding

        // Distribute to patient wallet
        (bool success1, ) = patientWallet.call{value: patientAmount}("");
        if (!success1) {
            revert TransferFailed();
        }

        // Distribute to hospital wallet
        (bool success2, ) = hospitalWallet.call{value: hospitalAmount}("");
        if (!success2) {
            revert TransferFailed();
        }

        // Distribute to MediPact wallet
        (bool success3, ) = medipactWallet.call{value: medipactAmount}("");
        if (!success3) {
            revert TransferFailed();
        }

        emit RevenueDistributed(
            patientWallet,
            patientAmount,
            hospitalWallet,
            hospitalAmount,
            medipactWallet,
            medipactAmount
        );
    }

    /**
     * @dev Update recipient addresses (only owner)
     * @param _patientWallet New patient wallet address
     * @param _hospitalWallet New hospital wallet address
     * @param _medipactWallet New MediPact wallet address
     */
    function updateRecipients(
        address payable _patientWallet,
        address payable _hospitalWallet,
        address payable _medipactWallet
    ) external {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        if (_patientWallet == address(0) || _hospitalWallet == address(0) || _medipactWallet == address(0)) {
            revert InvalidAddress();
        }

        patientWallet = _patientWallet;
        hospitalWallet = _hospitalWallet;
        medipactWallet = _medipactWallet;

        emit RecipientsUpdated(_patientWallet, _hospitalWallet, _medipactWallet);
    }

    /**
     * @dev Transfer ownership (only owner)
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        if (newOwner == address(0)) {
            revert InvalidAddress();
        }

        address previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }

    /**
     * @dev Get contract balance
     * @return Current HBAR balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get split percentages
     * @return patientShare Patient share percentage (basis points)
     * @return hospitalShare Hospital share percentage (basis points)
     * @return medipactShare MediPact share percentage (basis points)
     */
    function getSplitPercentages() external pure returns (
        uint256 patientShare,
        uint256 hospitalShare,
        uint256 medipactShare
    ) {
        return (PATIENT_SHARE, HOSPITAL_SHARE, MEDIPACT_SHARE);
    }
}
