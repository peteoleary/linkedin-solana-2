import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import React, { FC, useCallback } from 'react';
import {Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout} from '@solana/spl-token'

// TODO: find an alternative way to create this instruction
import { createAssociatedTokenAccountInstruction } from './createAssociatedTokenAccountInstruction'

import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;

import {DEFAULT_TIMEOUT, Data, createMetadata, Creator, awaitTransactionSignatureConfirmation, getErrorForTransaction} from './utils'

interface LinkedinProfile {
    id: string,
    firstName: string,
    lastName: string,
    profileURL: string,
    pictureURL: string
  }

interface MintProps {
    profile: LinkedinProfile;
  }  

// metaplex/js/packages/cli/src/commands/mint-nft.ts or metaplex/js/packages/candy-machine-ui/src/candy-machine.ts

export const MintNFTButton: FC<MintProps> = (props) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, signTransaction } = useWallet();

    // spl-token createMint to create token
    // spl-token createTokenAccount to create token
    // mintTo
    // make PDA for account with `['metadata', metadata_program_id, your_mint_id]` relative to the `metadata_program_id`.
    // create_metadata_account
    // check on chain to see if it already exists
    
    const makeDefaultSymbol = (profile: LinkedinProfile) => {
        return 'XXXX'
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

          // TODO: add Metaplex instructions to mint NFT
          const metadataAccount = await createMetadata(
            new Data({
              symbol: `${makeDefaultSymbol(profile)}`,
              name: `${profile.firstName} ${profile.lastName}`,
              uri: ' '.repeat(64), // size of url for arweave
              sellerFeeBasisPoints: 0.0,
              creators: [creator],
            }),
            publicKey.toBase58(),
            mint.publicKey.toBase58(),
            publicKey.toBase58(),
            instructions,
            publicKey.toBase58()
          );

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
            Send 1 lamport to a random address!
        </button>
        
        }
        </div>
    );
};