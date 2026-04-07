export const groupGatedPostRuleAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "string",
        name: "metadataURI",
        type: "string"
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
    name: "NotAMember",
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
    name: "Lens_Rule_MetadataURISet",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
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
        name: "ruleParams",
        type: "tuple[]"
      }
    ],
    name: "configure",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "getGroupGate",
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
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "rootPostId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "address",
            name: "author",
            type: "address"
          },
          {
            internalType: "string",
            name: "contentURI",
            type: "string"
          },
          {
            internalType: "uint256",
            name: "repostedPostId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "quotedPostId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "repliedPostId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "ruleAddress",
                type: "address"
              },
              {
                internalType: "bytes32",
                name: "configSalt",
                type: "bytes32"
              },
              {
                components: [
                  {
                    internalType: "bool",
                    name: "configure",
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
                    name: "ruleParams",
                    type: "tuple[]"
                  }
                ],
                internalType: "struct RuleConfigurationChange",
                name: "configurationChanges",
                type: "tuple"
              },
              {
                components: [
                  {
                    internalType: "bytes4",
                    name: "ruleSelector",
                    type: "bytes4"
                  },
                  {
                    internalType: "bool",
                    name: "isRequired",
                    type: "bool"
                  },
                  {
                    internalType: "bool",
                    name: "enabled",
                    type: "bool"
                  }
                ],
                internalType: "struct RuleSelectorChange[]",
                name: "selectorChanges",
                type: "tuple[]"
              }
            ],
            internalType: "struct RuleChange[]",
            name: "ruleChanges",
            type: "tuple[]"
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
            name: "extraData",
            type: "tuple[]"
          }
        ],
        internalType: "struct CreatePostParams",
        name: "",
        type: "tuple"
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
        name: "",
        type: "tuple[]"
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
        name: "",
        type: "tuple[]"
      }
    ],
    name: "processCreatePost",
    outputs: [],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "string",
            name: "contentURI",
            type: "string"
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
            name: "extraData",
            type: "tuple[]"
          }
        ],
        internalType: "struct EditPostParams",
        name: "",
        type: "tuple"
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
        name: "",
        type: "tuple[]"
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
        name: "",
        type: "tuple[]"
      }
    ],
    name: "processEditPost",
    outputs: [],
    stateMutability: "pure",
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
        name: "account",
        type: "address"
      }
    ],
    name: "validateCanQuote",
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
        name: "account",
        type: "address"
      }
    ],
    name: "validateCanReply",
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
        name: "account",
        type: "address"
      }
    ],
    name: "validateCanRepost",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;
