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
