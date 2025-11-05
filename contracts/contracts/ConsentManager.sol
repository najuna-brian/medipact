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
    // Consent record structure
    struct ConsentRecord {
        string patientId;           // Original patient ID (before anonymization)
        string anonymousPatientId;  // Anonymous patient ID (PID-001, etc.)
        string hcsTopicId;          // HCS topic ID where consent proof is stored
        string consentHash;         // Hash of the consent form
        uint256 timestamp;          // Block timestamp when consent was recorded
        bool isValid;              // Whether consent is currently valid
    }

    // Owner address (can manage consents)
    address public owner;

    // Mapping: patientId => ConsentRecord
    mapping(string => ConsentRecord) public consents;

    // Mapping: anonymousPatientId => patientId
    mapping(string => string) public anonymousToPatient;

    // Array of all patient IDs (for enumeration)
    string[] public patientIds;

    // Events
    event ConsentRecorded(
        string indexed patientId,
        string indexed anonymousPatientId,
        string hcsTopicId,
        string consentHash
    );
    event ConsentRevoked(string indexed patientId);
    event ConsentReinstated(string indexed patientId);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Errors
    error Unauthorized();
    error InvalidAddress();
    error ConsentAlreadyExists(string patientId);
    error ConsentNotFound(string patientId);
    error InvalidConsentData();

    /**
     * @dev Constructor
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Record a new consent
     * @param _patientId Original patient ID
     * @param _anonymousPatientId Anonymous patient ID (e.g., PID-001)
     * @param _hcsTopicId HCS topic ID where consent proof is stored
     * @param _consentHash Hash of the consent form
     */
    function recordConsent(
        string memory _patientId,
        string memory _anonymousPatientId,
        string memory _hcsTopicId,
        string memory _consentHash
    ) external {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        if (bytes(_patientId).length == 0 || bytes(_anonymousPatientId).length == 0) {
            revert InvalidConsentData();
        }
        if (bytes(consents[_patientId].patientId).length > 0) {
            revert ConsentAlreadyExists(_patientId);
        }

        ConsentRecord memory newConsent = ConsentRecord({
            patientId: _patientId,
            anonymousPatientId: _anonymousPatientId,
            hcsTopicId: _hcsTopicId,
            consentHash: _consentHash,
            timestamp: block.timestamp,
            isValid: true
        });

        consents[_patientId] = newConsent;
        anonymousToPatient[_anonymousPatientId] = _patientId;
        patientIds.push(_patientId);

        emit ConsentRecorded(_patientId, _anonymousPatientId, _hcsTopicId, _consentHash);
    }

    /**
     * @dev Revoke a consent (mark as invalid)
     * @param _patientId Patient ID whose consent to revoke
     */
    function revokeConsent(string memory _patientId) external {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        if (bytes(consents[_patientId].patientId).length == 0) {
            revert ConsentNotFound(_patientId);
        }

        consents[_patientId].isValid = false;
        emit ConsentRevoked(_patientId);
    }

    /**
     * @dev Reinstate a revoked consent
     * @param _patientId Patient ID whose consent to reinstate
     */
    function reinstateConsent(string memory _patientId) external {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        if (bytes(consents[_patientId].patientId).length == 0) {
            revert ConsentNotFound(_patientId);
        }

        consents[_patientId].isValid = true;
        emit ConsentReinstated(_patientId);
    }

    /**
     * @dev Get consent record by patient ID
     * @param _patientId Patient ID to lookup
     * @return ConsentRecord The consent record
     */
    function getConsent(string memory _patientId) external view returns (ConsentRecord memory) {
        if (bytes(consents[_patientId].patientId).length == 0) {
            revert ConsentNotFound(_patientId);
        }
        return consents[_patientId];
    }

    /**
     * @dev Get consent record by anonymous patient ID
     * @param _anonymousPatientId Anonymous patient ID (e.g., PID-001)
     * @return ConsentRecord The consent record
     */
    function getConsentByAnonymousId(string memory _anonymousPatientId) external view returns (ConsentRecord memory) {
        string memory patientId = anonymousToPatient[_anonymousPatientId];
        if (bytes(patientId).length == 0) {
            revert ConsentNotFound(_anonymousPatientId);
        }
        return consents[patientId];
    }

    /**
     * @dev Check if a consent is valid
     * @param _patientId Patient ID to check
     * @return bool True if consent exists and is valid
     */
    function isConsentValid(string memory _patientId) external view returns (bool) {
        if (bytes(consents[_patientId].patientId).length == 0) {
            return false;
        }
        return consents[_patientId].isValid;
    }

    /**
     * @dev Get total number of consent records
     * @return uint256 Number of recorded consents
     */
    function getConsentCount() external view returns (uint256) {
        return patientIds.length;
    }

    /**
     * @dev Get patient ID at index (for enumeration)
     * @param index Index in patientIds array
     * @return string Patient ID
     */
    function getPatientIdAtIndex(uint256 index) external view returns (string memory) {
        require(index < patientIds.length, "Index out of bounds");
        return patientIds[index];
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
