export interface FarcasterCast {
  degenValue: number | null;
  hash: string;
  parentHash: string;
  parentUrl: string | null;
  rootParentUrl: string | null;
  threadHash: string;
  parentAuthor: Author;
  author: Author;
  text: string;
  timestamp: string;
  embeds: any[]; // Replace 'any' with a more specific type if needed
  mentionedProfiles: Author[];
  reactions: Reactions;
  recasts: Recasts;
  recasters: string[]; // Assuming a list of recaster identifiers
  replies: {
    count: number;
  };
}
export interface Author {
  fid: number;
  custodyAddress: string;
  username: string;
  displayName: string;
  pfp: {
    url: string;
  };
  profile: {
    bio: {
      text: string;
      mentionedProfiles: Author[];
    };
  };
  followerCount: number;
  followingCount: number;
  verifications: string[];
  verifiedAddresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  activeStatus: string;
}

export interface Reactions {
  count: number;
  fids: number[]; // Assuming reaction identifiers are numbers
}

export interface Recasts {
  count: number;
  fids: number[]; // Assuming recast identifiers are numbers
}

export interface FarcasterResponse {
  conversation: { cast: { direct_replies: FarcasterCast[] } };
}

export interface OnChainTransaction {
  _id: string;
  accessList: any[];
  blockHash: string;
  blockNumber: number;
  chainId: number;
  from: string;
  gas: number;
  gasPrice: string;
  hash: string;
  input: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  nonce: number;
  r: string;
  s: string;
  to: string;
  transactionIndex: number;
  type: number;
  v: string;
  value: string;
  yParity: string;
  receipt: {
    blockHash: string;
    blockNumber: number;
    contractAddress: null;
    cumulativeGasUsed: number;
    effectiveGasPrice: string;
    from: string;
    gasUsed: number;
    l1Fee: string;
    l1GasPrice: string;
    l1GasUsed: number;
    logsBloom: string;
    status: boolean;
    to: string;
    transactionHash: string;
    transactionIndex: number;
    type: string;
  };
  assetTransfers: {
    from: string;
    to: string;
    type: string;
    value: string;
  }[];
  delegateCalls: any[];
  neighbor: {
    address: string;
    neighbor: string;
  };
  errors: any[];
  parties: string[];
  sigHash: string;
  internalSigHashes: {
    from: string;
    to: string;
    sigHash: string;
  }[];
  timestamp: number;
  baseFeePerGas: number;
  transactionFee: string;
  context: {
    variables: {
      sender: {
        type: string;
        value: string;
      };
      amount: {
        type: string;
        value: string;
        unit: string;
      };
      to: {
        type: string;
        value: string;
      };
      sent: {
        type: string;
        value: string;
      };
    };
    summaries: {
      category: string;
      en: {
        title: string;
        default: string;
      };
    };
  };
  logs: any[];
  netAssetTransfers: {
    [key: string]: {
      received: {
        type: string;
        value: string;
      }[];
      sent: {
        type: string;
        value: string;
      }[];
    };
  };
  contractsCreated: any[];
  enrichedParties: {
    [key: string]: {
      chainId: number;
      isContract: boolean;
      ensNew: {
        handle: string | null;
        avatar: string | null;
      };
      bns: {
        handle: string | null;
        avatar: string | null;
      };
      farcaster: {
        handle: string | null;
        avatar: string | null;
        fid: number | null;
      };
    }[];
  };
  assetsEnriched: any;
}

export interface TransactionStatusChangeEvent {
  data: {
    blockNumber: number;
    chainId: number;
    previousStatus: string;
    status: string;
    transactionHash: string;
    transactionId: string;
  };
  eventType: string;
  triggeredAt: number;
}
