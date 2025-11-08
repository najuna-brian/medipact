// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title ConsentManager
 * @dev Smart contract for managing patient consent records
 * Links consent hashes to HCS topic IDs for verifiable proof
 * 
 * This contract stores consent records that reference HCS topics
 * where the actual consent proofs are stored immutably.
 */
contract ConsentManager {
    // Consent record structure (NO PII - only anonymous IDs)
    struct ConsentRecord {
        string anonymousPatientId;  // Anonymous patient ID (PID-001, etc.) - NO original ID
        string hcsTopicId;          // HCS topic ID where consent proof is stored
        string dataHash;            // Hash of the anonymized data
        uint256 timestamp;          // Block timestamp when consent was recorded
        bool isValid;              // Whether consent is currently valid
    }

    // Owner address (can manage consents)
    address public owner;

    // Mapping: anonymousPatientId => ConsentRecord
    mapping(string => ConsentRecord) public consents;

    // Array of all anonymous patient IDs (for enumeration)
    string[] public anonymousPatientIds;

    // Events
    event ConsentRecorded(
        string indexed anonymousPatientId,
        string hcsTopicId,
        string dataHash
    );
    event ConsentRevoked(string indexed anonymousPatientId);
    event ConsentReinstated(string indexed anonymousPatientId);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Errors
    error Unauthorized();
    error InvalidAddress();
    error ConsentAlreadyExists(string anonymousPatientId);
    error ConsentNotFound(string anonymousPatientId);
    error InvalidConsentData();

    /**
     * @dev Constructor
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Record a new consent (NO PII - only anonymous ID)
     * @param _anonymousPatientId Anonymous patient ID (e.g., PID-001)
     * @param _hcsTopicId HCS topic ID where consent proof is stored
     * @param _dataHash Hash of the anonymized data
     */
    function recordConsent(
        string memory _anonymousPatientId,
        string memory _hcsTopicId,
        string memory _dataHash
    ) external {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        if (bytes(_anonymousPatientId).length == 0) {
            revert InvalidConsentData();
        }
        if (bytes(consents[_anonymousPatientId].anonymousPatientId).length > 0) {
            revert ConsentAlreadyExists(_anonymousPatientId);
        }

        ConsentRecord memory newConsent = ConsentRecord({
            anonymousPatientId: _anonymousPatientId,
            hcsTopicId: _hcsTopicId,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            isValid: true
        });

        consents[_anonymousPatientId] = newConsent;
        anonymousPatientIds.push(_anonymousPatientId);

        emit ConsentRecorded(_anonymousPatientId, _hcsTopicId, _dataHash);
    }

    /**
     * @dev Revoke a consent (mark as invalid)
     * @param _anonymousPatientId Anonymous patient ID whose consent to revoke
     */
    function revokeConsent(string memory _anonymousPatientId) external {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        if (bytes(consents[_anonymousPatientId].anonymousPatientId).length == 0) {
            revert ConsentNotFound(_anonymousPatientId);
        }

        consents[_anonymousPatientId].isValid = false;
        emit ConsentRevoked(_anonymousPatientId);
    }

    /**
     * @dev Reinstate a revoked consent
     * @param _anonymousPatientId Anonymous patient ID whose consent to reinstate
     */
    function reinstateConsent(string memory _anonymousPatientId) external {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        if (bytes(consents[_anonymousPatientId].anonymousPatientId).length == 0) {
            revert ConsentNotFound(_anonymousPatientId);
        }

        consents[_anonymousPatientId].isValid = true;
        emit ConsentReinstated(_anonymousPatientId);
    }

    /**
     * @dev Get consent record by anonymous patient ID
     * @param _anonymousPatientId Anonymous patient ID (e.g., PID-001)
     * @return ConsentRecord The consent record
     */
    function getConsentByAnonymousId(string memory _anonymousPatientId) external view returns (ConsentRecord memory) {
        if (bytes(consents[_anonymousPatientId].anonymousPatientId).length == 0) {
            revert ConsentNotFound(_anonymousPatientId);
        }
        return consents[_anonymousPatientId];
    }

    /**
     * @dev Check if a consent is valid
     * @param _anonymousPatientId Anonymous patient ID to check
     * @return bool True if consent exists and is valid
     */
    function isConsentValid(string memory _anonymousPatientId) external view returns (bool) {
        if (bytes(consents[_anonymousPatientId].anonymousPatientId).length == 0) {
            return false;
        }
        return consents[_anonymousPatientId].isValid;
    }

    /**
     * @dev Get total number of consent records
     * @return uint256 Number of recorded consents
     */
    function getConsentCount() external view returns (uint256) {
        return anonymousPatientIds.length;
    }

    /**
     * @dev Get anonymous patient ID at index (for enumeration)
     * @param index Index in anonymousPatientIds array
     * @return string Anonymous patient ID
     */
    function getAnonymousPatientIdAtIndex(uint256 index) external view returns (string memory) {
        require(index < anonymousPatientIds.length, "Index out of bounds");
        return anonymousPatientIds[index];
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
}
