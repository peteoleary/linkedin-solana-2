import {
    Keypair, SystemProgram, PublicKey
  } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token, MintLayout } from '@solana/spl-token'
import {createAssociatedTokenAccountInstruction, toPublicKey, sendTransactionWithSigner} from './solana'

// TODO: we probably want to get all types and instructions from metaplex
import {Manifest, Data, Metadata, createUpdateMetadataInstruction, getMetadataAccount, UpdateMetadataArgs, METADATA_SCHEMA} from './metaplex'
import { Creator } from '@metaplex-foundation/mpl-token-metadata';

import Arweave from 'arweave/node/common';
import { serialize } from 'borsh';

import {mintNFT} from 'metaplex-web/src/actions'
import {mintEditionsToWallet} from 'metaplex-web/src/actions/mintEditionsIntoWallet'

import { WalletSigner } from '@oyster/common';

export interface LinkedinProfile {
    id: string,
    firstName: string,
    lastName: string,
    profileURL: string,
    pictureURL: string
  }

const makeDefaultSymbol = (profile: LinkedinProfile) => {
    return (profile.firstName.slice(0,1) + profile.lastName.slice(0,1)).toLocaleUpperCase('en-US')
} 

export async function sendNftySocial(existingNFT: Metadata, recipientAddress: string, connection: any, wallet: WalletContextState) {

  mintEditionsToWallet(
    art,
    wallet,
    connection,
    existingNFT.mint,
    1,
    recipientAddress,
  )

  console.log(`sendNftySocial(existingNFT: ${existingNFT.data.mint}, recipientAddress: ${recipientAddress}`)

  const instructions = [
    SystemProgram.transfer({
      /** Account that will transfer lamports */
      fromPubkey: new PublicKey(existingNFT.data.mint),
      /** Account that will receive transferred lamports */
      toPubkey: new PublicKey(recipientAddress),
      /** Amount of lamports to transfer */
      lamports: 1.0
    })
  ];

  sendTransactionWithSigner(connection, publicKey, instructions, signTransaction)
}

// TODO: get proper types for existingNFT, connection and signTransaction
export async function updateNftySocial(existingNFT: Metadata, profile: LinkedinProfile, arweave: Arweave, publicKey: PublicKey, connection: any, signTransaction: any) {
    
    let on_chain_data = makeOnchainData(profile, existingNFT.data.creators)
    // TODO: upload new image to arweave
    // TODO: hash image
    let off_chain_data = makeOffchainData(profile, on_chain_data, existingNFT.data.creators)

    const off_chain_data_json = JSON.stringify(off_chain_data)

    // TODO: what do to about the OLD arweave metadata
    // on_chain_data.uri = await uploadJsonToArweave(arweave, off_chain_data_json)
    on_chain_data.uri = 'https://arweave.net:443/9p2SDs5_QmQGASG2iEvVp9oy4nyLndWntiX14z9qFI4'

    console.log(`on_chain_data.uri=${on_chain_data.uri}`)
    
    // TODO: update on-chain metadata
    const metadataAccount = (await getMetadataAccount(toPublicKey(existingNFT.mint)))[0];

    const value = new UpdateMetadataArgs({
        data: on_chain_data,
        updateAuthority: publicKey.toBase58(),
        primarySaleHappened: null,
      });

      console.log(METADATA_SCHEMA)

      const txnData = Buffer.from(serialize(METADATA_SCHEMA, value));      

    const instructions = [
        createUpdateMetadataInstruction(
          toPublicKey(metadataAccount),
          publicKey,
          txnData,
        ),
      ];

      sendTransactionWithSigner(connection, publicKey, instructions, signTransaction)
}

/*
export const updateMetadata = async (
    mintKey: PublicKey,
    connection: Connection,
    walletKeypair: Keypair,
    metadataLink: string,
    collection: PublicKey = null,
    uses: Uses,
  ): Promise<PublicKey | void> => {
    // Retrieve metadata
    const data = await createMetadata(metadataLink, collection, uses);
    if (!data) return;
  
    const metadataAccount = await getMetadata(mintKey);
    const signers: anchor.web3.Keypair[] = [];
    const value = new UpdateMetadataV2Args({
      data,
      updateAuthority: walletKeypair.publicKey.toBase58(),
      primarySaleHappened: null,
      isMutable: true,
    });
    const txnData = Buffer.from(serialize(METADATA_SCHEMA, value));
  
    const instructions = [
      createUpdateMetadataInstruction(
        metadataAccount,
        walletKeypair.publicKey,
        txnData,
      ),
    ];
  
    // Execute transaction
    const txid = await sendTransactionWithRetryWithKeypair(
      connection,
      walletKeypair,
      instructions,
      signers,
    );
    console.log('Metadata updated', txid);
    log.info('\n\nUpdated NFT: Mint Address is ', mintKey.toBase58());
    return metadataAccount;
  };
  */

function makeOnchainData(profile: LinkedinProfile, creators: Creator[]): Data {
    return {
        symbol: `${makeDefaultSymbol(profile)}`,
        name: `${profile.firstName} ${profile.lastName}`,
        uri: ' '.repeat(64), // size of url for arweave
        sellerFeeBasisPoints: 0.0,
        creators: creators,
        }
}

function makeOffchainData(profile: LinkedinProfile, on_chain_data: Data, creators: Creator[]): Manifest {
    return {
      animation_url: null,
      external_url: null,
        attributes: [],
        description: '',
        image: profile.pictureURL,
        symbol: on_chain_data.symbol,
        sellerFeeBasisPoints: 0.0,
        name: on_chain_data.name,
        properties: {
          files: [{
            type: 'image/jpeg',
            uri: profile.pictureURL
          }],
        },
        creators: creators
      }         
}

async function makeUserTokenAccountAddress(publicKey: PublicKey, mint: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
        [publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID,
    );
}

// TODO: get proper types for connection and signTransaction
export async function mintNftySocial(profile: LinkedinProfile, connection: any, wallet: WalletSigner, endpoint: any, callback: any) {

    const creator = new Creator({address: wallet.publicKey.toBase58(), verified: false, share: 100.0})

    const on_chain_data = makeOnchainData(profile, [creator])

    // let off_chain_data = Object.assign({}, on_chain_data, {uri: undefined});
    let off_chain_data = makeOffchainData(profile, on_chain_data, [creator])

    const off_chain_data_json = JSON.stringify(off_chain_data)

    const metadataAccount =  await mintNFT(connection, wallet, endpoint, [], off_chain_data, callback, 100)

    console.log(`metadataAccount: ${metadataAccount}`)
}