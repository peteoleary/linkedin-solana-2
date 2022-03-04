import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import React, { FC, useCallback, useState } from 'react';
import {Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout} from '@solana/spl-token'

// TODO: find an alternative way to create this instruction
import { createAssociatedTokenAccountInstruction } from './createAssociatedTokenAccountInstruction'

import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;

import Arweave from 'arweave/node/common';
import { uploadJsonToArweave } from './utils/arweave';

import {DEFAULT_TIMEOUT, getErrorForTransaction, awaitTransactionSignatureConfirmation} from './utils/solana'
import {Data, createMetadata, Creator} from './utils/metaplex'

interface LinkedinProfile {
    id: string,
    firstName: string,
    lastName: string,
    profileURL: string,
    pictureURL: string
  }

interface MintProps {
    profile: LinkedinProfile;
    arweave: Arweave
  }  

  // maetaplex/js/packages/cli/src/commands/upload.ts
  type Manifest = {
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

// metaplex/js/packages/cli/src/commands/mint-nft.ts or metaplex/js/packages/candy-machine-ui/src/candy-machine.ts

export const MintNFTButton: FC<MintProps> = (props) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, signTransaction } = useWallet();

    const [arweave, setArweave] = useState(props.arweave)

    // make PDA for account with `['metadata', metadata_program_id, your_mint_id]` relative to the `metadata_program_id`.
    // create_metadata_account
    // check on chain to see if it already exists
    
    const makeDefaultSymbol = (profile: LinkedinProfile) => {
        return (profile.firstName.slice(0,1) + profile.lastName.slice(0,1)).toLocaleUpperCase('en-US')
    } 

    

    const onClick = useCallback(async (profile) => {
        if (!publicKey) throw new WalletNotConnectedError();

        if (!profile) throw "LinkedIn profile is not set"
    
        const mint = Keypair.generate();

        const userTokenAccountAddress = (await PublicKey.findProgramAddress(
            [publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID,
        ))[0];

        console.log(`publicKey = ${publicKey.toBase58()}`)
        console.log(`mint = ${mint.publicKey.toBase58()}`)
        console.log(`userTokenAccountAddress = ${userTokenAccountAddress.toBase58()}`)

        const instructions = [
            SystemProgram.createAccount({
              fromPubkey: publicKey,
              newAccountPubkey: mint.publicKey,
              space: MintLayout.span,
              lamports:
                await connection.getMinimumBalanceForRentExemption(
                  MintLayout.span,
                ),
              programId: TOKEN_PROGRAM_ID,
            }),
            Token.createInitMintInstruction(
              TOKEN_PROGRAM_ID,
              mint.publicKey,
              0,
              publicKey,
              publicKey,
            ),
            createAssociatedTokenAccountInstruction(
                publicKey,
                userTokenAccountAddress,
                publicKey,
                mint.publicKey,
            ),
            Token.createMintToInstruction(
              TOKEN_PROGRAM_ID,
              mint.publicKey,
              userTokenAccountAddress,
              publicKey,
              [],
              1,
            )
        ]
        const creator = new Creator({address: publicKey.toBase58(), verified: false, share: 100.0})

        const on_chain_data = {
            symbol: `${makeDefaultSymbol(profile)}`,
            name: `${profile.firstName} ${profile.lastName}`,
            uri: ' '.repeat(64), // size of url for arweave
            sellerFeeBasisPoints: 0.0,
            creators: [creator],
            }

        // let off_chain_data = Object.assign({}, on_chain_data, {uri: undefined});
        let off_chain_data: Manifest = {
          image: profile.pictureURL,
          symbol: on_chain_data.symbol,
          seller_fee_basis_points: on_chain_data.sellerFeeBasisPoints,
          name: on_chain_data.name,
          properties: {
            files: [{
              type: 'image/jpeg',
              uri: profile.pictureURL
            }],
            creators: [{
              address: creator.address.toString(),
              share: creator.share
            }]
          }
        }       

        const off_chain_data_json = JSON.stringify(off_chain_data)

        // TODO: fill out other off_chain_data data, push to arweave then put arweave uri into on_chain_data.uri

        const arweave_transaction_id = await uploadJsonToArweave(off_chain_data_json)

        // TODO: get actual arweave URI here
        on_chain_data.uri = `${arweave.api.config.protocol}://${arweave.api.config.host}:${arweave.api.config.port}/${arweave_transaction_id}`

        console.log(`on_chain_data.uri: ${on_chain_data.uri}`)

          const metadataAccount = await createMetadata(
            new Data(on_chain_data),
            publicKey.toBase58(),
            mint.publicKey.toBase58(),
            publicKey.toBase58(),
            instructions,
            publicKey.toBase58()
          );

          console.log(`metadataAccount: ${metadataAccount}`)

          // TODO: all of the transaction stuff should be broken out into utils

          const transaction  = new Transaction()
          transaction.feePayer = publicKey

          for (var i = 0; i < instructions.length; i++) {
            transaction.add(instructions[i])
          }

          transaction.recentBlockhash = await (await connection.getLatestBlockhash('singleGossip')).blockhash
          transaction.partialSign(mint)

          const signedTransaction = await signTransaction(transaction)

        const rawTransaction = transaction.serialize();
        let options = {
            skipPreflight: true,
            commitment: 'singleGossip'
        };

        const txid = await connection.sendRawTransaction(rawTransaction, options);

        console.log(`txid=${txid}`)

        let slot = 0;

        const confirmation = await awaitTransactionSignatureConfirmation(
            txid,
            DEFAULT_TIMEOUT,
            connection,
            'recent',
        );

        if (!confirmation)
            throw new Error('Timed out awaiting confirmation on transaction');
        slot = confirmation?.slot || 0;

        if (confirmation?.err) {
            const errors = await getErrorForTransaction(connection, txid);

            console.log(errors);
            throw new Error(`Raw transaction ${txid} failed`);
        }

    }, [publicKey, sendTransaction, connection]);

    return (
        <div>
        {
        <button onClick={() => onClick(props.profile)} disabled={!publicKey || props.profile == null}>
            Mint LinkedIn NFT
        </button>
        
        }
        </div>
    );
};