import {
    SystemProgram, PublicKey, TransactionInstruction, SYSVAR_RENT_PUBKEY, AccountInfo
  } from '@solana/web3.js';

import {findProgramAddress, toPublicKey} from './solana';

import { serialize } from 'borsh';

import BN from 'bn.js';
  
type StringPublicKey = string;

export const METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    // 'GCUQ7oWCzgtRKnHnuJGxpr5XVeEkxYUXwTKYcqGtxLv4',
  );

  // maetaplex/js/packages/cli/src/commands/upload.ts
  export type Manifest = {
    image: string;
    name: string;
    symbol: string;
    seller_fee_basis_points: number;
    properties: {
      app?: {
        name: string,
        address: string,
        version: string
      },
      files: Array<{ type: string; uri: string; hash?: string }>;
      creators: Array<{
        address: string;
        share: number;
      }>;
    };
  };

export const getMetadataAccount = (mintKey: PublicKey) => {
    return findProgramAddress(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mintKey.toBuffer()
      ],
      METADATA_PROGRAM_ID,
    )
}

export async function createMetadata(
  data: Data,
  updateAuthority: StringPublicKey,
  mintKey: StringPublicKey,
  mintAuthorityKey: StringPublicKey,
  instructions: TransactionInstruction[],
  payer: StringPublicKey,
) {

  const metadataAccount = (await getMetadataAccount(toPublicKey(mintKey)))[0];

  console.log('Data', data);
  const value = new CreateMetadataArgs({ data, isMutable: true });

  const taxSerialized = serialize(METADATA_SCHEMA, value)
  const txnData = Buffer.from(taxSerialized);

  const keys = [
    {
      pubkey: toPublicKey(metadataAccount),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(mintKey),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(mintAuthorityKey),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(payer),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(updateAuthority),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: METADATA_PROGRAM_ID,
      data: txnData,
    }),
  );

  return metadataAccount;
}



// exports from metaplex/js/packages/common/src/utils/ids.ts

export class UpdateMetadataArgs {
    instruction: number = 1;
    data: Data | null;
    // Not used by this app, just required for instruction
    updateAuthority: StringPublicKey | null;
    primarySaleHappened: boolean | null;
    constructor(args: {
      data?: Data;
      updateAuthority?: string;
      primarySaleHappened: boolean | null;
    }) {
      this.data = args.data ? args.data : null;
      this.updateAuthority = args.updateAuthority ? args.updateAuthority : null;
      this.primarySaleHappened = args.primarySaleHappened;
    }
  }

export class CreateMetadataArgs {
    instruction: number = 0;
    data: Data;
    isMutable: boolean;
  
    constructor(args: { data: Data; isMutable: boolean }) {
      this.data = args.data;
      this.isMutable = args.isMutable;
    }
  }
  
  // below here from @metaplex/js/packages/cli/src/types.ts
  
  export class Creator {
    address: (PublicKey | string);
    verified: boolean;
    share: number;
  
    constructor(args: { address: (PublicKey | string); verified: boolean; share: number }) {
      this.address = args.address;
      this.verified = args.verified;
      this.share = args.share;
    }
  }
  
  export interface Config {
    authority: PublicKey;
    data: ConfigData;
  }
  
  export class ConfigData {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: Creator[] | null;
    maxNumberOfLines: BN | number;
    isMutable: boolean;
    maxSupply: BN;
    retainAuthority: boolean;
  
    constructor(args: {
      name: string;
      symbol: string;
      uri: string;
      sellerFeeBasisPoints: number;
      creators: Creator[] | null;
      maxNumberOfLines: BN;
      isMutable: boolean;
      maxSupply: BN;
      retainAuthority: boolean;
    }) {
      this.name = args.name;
      this.symbol = args.symbol;
      this.uri = args.uri;
      this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
      this.creators = args.creators;
      this.maxNumberOfLines = args.maxNumberOfLines;
      this.isMutable = args.isMutable;
      this.maxSupply = args.maxSupply;
      this.retainAuthority = args.retainAuthority;
    }
  }
  
  export enum MetadataKey {
    Uninitialized = 0,
    MetadataV1 = 4,
    EditionV1 = 1,
    MasterEditionV1 = 2,
    MasterEditionV2 = 6,
    EditionMarker = 7,
  }
  
  export class MasterEditionV1 {
    key: MetadataKey;
    supply: BN;
    maxSupply?: BN;
    printingMint: PublicKey;
    oneTimePrintingAuthorizationMint: PublicKey;
    constructor(args: {
      key: MetadataKey;
      supply: BN;
      maxSupply?: BN;
      printingMint: PublicKey;
      oneTimePrintingAuthorizationMint: PublicKey;
    }) {
      this.key = MetadataKey.MasterEditionV1;
      this.supply = args.supply;
      this.maxSupply = args.maxSupply;
      this.printingMint = args.printingMint;
      this.oneTimePrintingAuthorizationMint =
        args.oneTimePrintingAuthorizationMint;
    }
  }
  
  export class MasterEditionV2 {
    key: MetadataKey;
    supply: BN;
    maxSupply?: BN;
    constructor(args: { key: MetadataKey; supply: BN; maxSupply?: BN }) {
      this.key = MetadataKey.MasterEditionV2;
      this.supply = args.supply;
      this.maxSupply = args.maxSupply;
    }
  }
  
  export class EditionMarker {
    key: MetadataKey;
    ledger: number[];
    constructor(args: { key: MetadataKey; ledger: number[] }) {
      this.key = MetadataKey.EditionMarker;
      this.ledger = args.ledger;
    }
  }
  
  export class Edition {
    key: MetadataKey;
    parent: PublicKey;
    edition: BN;
    constructor(args: { key: MetadataKey; parent: PublicKey; edition: BN }) {
      this.key = MetadataKey.EditionV1;
      this.parent = args.parent;
      this.edition = args.edition;
    }
  }
  
  export class Data {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: Creator[] | null;
    constructor(args: {
      name: string;
      symbol: string;
      uri: string;
      sellerFeeBasisPoints: number;
      creators: Creator[] | null;
    }) {
      this.name = args.name;
      this.symbol = args.symbol;
      this.uri = args.uri;
      this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
      this.creators = args.creators;
    }
  }

  export class Account {
    readonly pubkey: PublicKey;
    readonly info: AccountInfo<Buffer>;
    data: Data;
  }
  
  export class Metadata {
    key: MetadataKey;
    updateAuthority: PublicKey;
    mint: PublicKey;
    data: Data;
    primarySaleHappened: boolean;
    isMutable: boolean;
    masterEdition?: PublicKey;
    edition?: PublicKey;
    constructor(args: {
      updateAuthority: PublicKey;
      mint: PublicKey;
      data: Data;
      primarySaleHappened: boolean;
      isMutable: boolean;
      masterEdition?: PublicKey;
    }) {
      this.key = MetadataKey.MetadataV1;
      this.updateAuthority = args.updateAuthority;
      this.mint = args.mint;
      this.data = args.data;
      this.primarySaleHappened = args.primarySaleHappened;
      this.isMutable = args.isMutable;
    }
  }
  
  export const METADATA_SCHEMA = new Map<any, any>([
    [
      CreateMetadataArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['data', Data],
          ['isMutable', 'u8'], // bool
        ],
      },
    ],
    
    [
      UpdateMetadataArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['data', { kind: 'option', type: Data }],
          ['updateAuthority', { kind: 'option', type: 'pubkeyAsString' }],
          ['primarySaleHappened', { kind: 'option', type: 'u8' }],
        ],
      },
    ],
    /*
    [
      CreateMasterEditionArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['maxSupply', { kind: 'option', type: 'u64' }],
        ],
      },
    ],
    [
      MintPrintingTokensArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['supply', 'u64'],
        ],
      },
    ],
    */
    [
      MasterEditionV1,
      {
        kind: 'struct',
        fields: [
          ['key', 'u8'],
          ['supply', 'u64'],
          ['maxSupply', { kind: 'option', type: 'u64' }],
          ['printingMint', 'pubkeyAsString'],
          ['oneTimePrintingAuthorizationMint', 'pubkeyAsString'],
        ],
      },
    ],
    [
      MasterEditionV2,
      {
        kind: 'struct',
        fields: [
          ['key', 'u8'],
          ['supply', 'u64'],
          ['maxSupply', { kind: 'option', type: 'u64' }],
        ],
      },
    ],
    [
      Edition,
      {
        kind: 'struct',
        fields: [
          ['key', 'u8'],
          ['parent', 'pubkeyAsString'],
          ['edition', 'u64'],
        ],
      },
    ],
    [
      Data,
      {
        kind: 'struct',
        fields: [
          ['name', 'string'],
          ['symbol', 'string'],
          ['uri', 'string'],
          ['sellerFeeBasisPoints', 'u16'],
          ['creators', { kind: 'option', type: [Creator] }],
        ],
      },
    ],
    [
      Creator,
      {
        kind: 'struct',
        fields: [
          ['address', 'pubkeyAsString'],
          ['verified', 'u8'],
          ['share', 'u8'],
        ],
      },
    ],
    [
      Metadata,
      {
        kind: 'struct',
        fields: [
          ['key', 'u8'],
          ['updateAuthority', 'pubkeyAsString'],
          ['mint', 'pubkeyAsString'],
          ['data', Data],
          ['primarySaleHappened', 'u8'], // bool
          ['isMutable', 'u8'], // bool
          ['editionNonce', { kind: 'option', type: 'u8' }],
        ],
      },
    ],
    [
      EditionMarker,
      {
        kind: 'struct',
        fields: [
          ['key', 'u8'],
          ['ledger', [31]],
        ],
      },
    ],
  ]);
  
  export type AssetKey = { mediaExt: string; index: string };
  
  // from metaplex/js/packages/common/src/actions/metadata.ts
  
  export enum MetadataCategory {
    Audio = 'audio',
    Video = 'video',
    Image = 'image',
    VR = 'vr',
    HTML = 'html',
  }
  
  export type Attribute = {
    trait_type?: string;
    display_type?: string;
    value: string | number;
  }
  
  export type MetadataExtension = {
    name: string;
    symbol: string;
  
    creators: Creator[] | null;
    description: string;
    // preview image absolute URI
    image: string;
    animation_url?: string;
  
    attributes?: Attribute[];
  
    // stores link to item on meta
    external_url: string;
  
    seller_fee_basis_points: number;
  
    properties: {
      files?: FileOrString[];
      category: MetadataCategory;
      maxSupply?: number;
      creators?: {
        address: string;
        shares: number;
      }[];
    };
  }
  
  export type MetadataFile = {
    uri: string;
    type: string;
  };
  
  export type FileOrString = MetadataFile | string;

  export function createUpdateMetadataInstruction(
    metadataAccount: PublicKey,
    payer: PublicKey,
    txnData: Buffer,
  ) {
    const keys = [
      {
        pubkey: metadataAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: payer,
        isSigner: true,
        isWritable: false,
      },
    ];
    return new TransactionInstruction({
      keys,
      programId:       METADATA_PROGRAM_ID,
      data: txnData,
    });
  }