/**
 * Contract ABIs
 * Imported from compiled contract artifacts
 */

export const CONSENT_MANAGER_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'patientId',
        type: 'string',
      },
    ],
    name: 'ConsentAlreadyExists',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'patientId',
        type: 'string',
      },
    ],
    name: 'ConsentNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidConsentData',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Unauthorized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'patientId',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'anonymousPatientId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'hcsTopicId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'consentHash',
        type: 'string',
      },
    ],
    name: 'ConsentRecorded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'patientId',
        type: 'string',
      },
    ],
    name: 'ConsentReinstated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'patientId',
        type: 'string',
      },
    ],
    name: 'ConsentRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    name: 'anonymousToPatient',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    name: 'consents',
    outputs: [
      {
        internalType: 'string',
        name: 'patientId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'anonymousPatientId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'hcsTopicId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'consentHash',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isValid',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_patientId',
        type: 'string',
      },
    ],
    name: 'getConsent',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'patientId',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'anonymousPatientId',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'hcsTopicId',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'consentHash',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isValid',
            type: 'bool',
          },
        ],
        internalType: 'struct ConsentManager.ConsentRecord',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_anonymousPatientId',
        type: 'string',
      },
    ],
    name: 'getConsentByAnonymousId',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'patientId',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'anonymousPatientId',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'hcsTopicId',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'consentHash',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isValid',
            type: 'bool',
          },
        ],
        internalType: 'struct ConsentManager.ConsentRecord',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getConsentCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'getPatientIdAtIndex',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_patientId',
        type: 'string',
      },
    ],
    name: 'isConsentValid',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'patientIds',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_patientId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_anonymousPatientId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_hcsTopicId',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_consentHash',
        type: 'string',
      },
    ],
    name: 'recordConsent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_patientId',
        type: 'string',
      },
    ],
    name: 'reinstateConsent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_patientId',
        type: 'string',
      },
    ],
    name: 'revokeConsent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const REVENUE_SPLITTER_ABI = [
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_patientWallet',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: '_hospitalWallet',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: '_medipactWallet',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'InvalidAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidRecipients',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoFundsToDistribute',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Unauthorized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'patientWallet',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'hospitalWallet',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'medipactWallet',
        type: 'address',
      },
    ],
    name: 'RecipientsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'patientWallet',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'patientAmount',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'hospitalWallet',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hospitalAmount',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'medipactWallet',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'medipactAmount',
        type: 'uint256',
      },
    ],
    name: 'RevenueDistributed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'RevenueReceived',
    type: 'event',
  },
  {
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    inputs: [],
    name: 'HOSPITAL_SHARE',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MEDIPACT_SHARE',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PATIENT_SHARE',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'TOTAL_SHARE',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'distributeRevenue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSplitPercentages',
    outputs: [
      {
        internalType: 'uint256',
        name: 'patientShare',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'hospitalShare',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'medipactShare',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hospitalWallet',
    outputs: [
      {
        internalType: 'address payable',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'medipactWallet',
    outputs: [
      {
        internalType: 'address payable',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'patientWallet',
    outputs: [
      {
        internalType: 'address payable',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_patientWallet',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: '_hospitalWallet',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: '_medipactWallet',
        type: 'address',
      },
    ],
    name: 'updateRecipients',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

