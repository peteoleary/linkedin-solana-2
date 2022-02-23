import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import React, { FC, useCallback, useMemo, useEffect, useState } from 'react';
import {Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout} from '@solana/spl-token'
import { createAssociatedTokenAccountInstruction } from './createAssociatedTokenAccountInstruction'

import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;

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
    const { publicKey, sendTransaction } = useWallet();

    // spl-token createMint to create token
    // spl-token createTokenAccount to create token
    // mintTo
    // make PDA for account with `['metadata', metadata_program_id, your_mint_id]` relative to the `metadata_program_id`.
    // create_metadata_account
    // check on chain to see if it already exists


    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        if (!props.profile) throw "LinkedIn profile is not set"

        const mint = Keypair.generate();

        const userTokenAccountAddress = (await PublicKey.findProgramAddress(
            [publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID,
        ))[0];

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
              userTokenAccountAddress,
              publicKey,
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
            // TODO: add Metaplex instructions to mint NFT
          ];

          const transaction = new Transaction()

          // TODO: add all instructions to transaction

        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, 'processed');
    }, [publicKey, sendTransaction, connection]);

    return (
        <div>
        {
        <button onClick={onClick} disabled={!publicKey || props.profile == null}>
            Send 1 lamport to a random address!
        </button>
        
        }
        </div>
    );
};