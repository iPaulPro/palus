export const pollVoteAction = [
  {
    inputs: [
      {
        internalType: "address",
        name: "actionHub",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [],
    name: "InvalidMsgSender",
    type: "error"
  },
  {
    inputs: [],
    name: "NotImplemented",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "Lens_Ownable_OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "metadataURI",
        type: "string"
      }
    ],
    name: "Lens_PostAction_MetadataURISet",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address"
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint8[]",
        name: "optionIndices",
        type: "uint8[]"
      }
    ],
    name: "PollVoted",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "originalMsgSender",
        type: "address"
      },
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "key",
            type: "bytes32"
          },
          {
            internalType: "bytes",
            name: "value",
            type: "bytes"
          }
        ],
        internalType: "struct KeyValue[]",
        name: "params",
        type: "tuple[]"
      }
    ],
    name: "configure",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "originalMsgSender",
        type: "address"
      },
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "key",
            type: "bytes32"
          },
          {
            internalType: "bytes",
            name: "value",
            type: "bytes"
          }
        ],
        internalType: "struct KeyValue[]",
        name: "params",
        type: "tuple[]"
      }
    ],
    name: "execute",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      }
    ],
    name: "getAllowMultipleAnswers",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "source",
        type: "address"
      }
    ],
    name: "getMetadataURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getMetadataURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      }
    ],
    name: "getOptions",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      }
    ],
    name: "getPollEndTimestamp",
    outputs: [
      {
        internalType: "uint72",
        name: "",
        type: "uint72"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      }
    ],
    name: "getVoteCounts",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "voter",
        type: "address"
      }
    ],
    name: "getVotedOption",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "voter",
        type: "address"
      }
    ],
    name: "getVotedOptions",
    outputs: [
      {
        internalType: "bool[]",
        name: "",
        type: "bool[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "voter",
        type: "address"
      }
    ],
    name: "hasVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "voter",
        type: "address"
      },
      {
        internalType: "uint8",
        name: "optionIndex",
        type: "uint8"
      }
    ],
    name: "hasVotedForOption",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "originalMsgSender",
        type: "address"
      },
      {
        internalType: "address",
        name: "feed",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isDisabled",
        type: "bool"
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "key",
            type: "bytes32"
          },
          {
            internalType: "bytes",
            name: "value",
            type: "bytes"
          }
        ],
        internalType: "struct KeyValue[]",
        name: "params",
        type: "tuple[]"
      }
    ],
    name: "setDisabled",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "metadataURI",
        type: "string"
      }
    ],
    name: "setMetadataURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;
