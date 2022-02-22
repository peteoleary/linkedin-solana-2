import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import React, { FC, useCallback, useMemo, useEffect, useState } from 'react';

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

// /Users/pete_o/Documents/Dev/crypto/metaplex/js/packages/cli/src/commands/mint-nft.ts

export const MintNFTButton: FC<MintProps> = (props) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    // spl-token createMint to create token
    // spl-token createTokenAccount to create token
    // mintTo
    // make PDA for account with `['metadata', metadata_program_id, your_mint_id]` relative to the `metadata_program_id`.
    // create_metadata_account
    // check on chain to see if it already exists


    const TOKEN_PROGRAM_ID = new PublicKey(
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
      );
      
    const METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        // 'GCUQ7oWCzgtRKnHnuJGxpr5XVeEkxYUXwTKYcqGtxLv4',
      );
      
      const [existingMetadata, setExistingMetadata] = useState<programs.metadata.Metadata[]>([])

      useEffect(() => {
        if (!publicKey) return
        Metadata.findByOwnerV2(connection, publicKey!).then((metadata) => setExistingMetadata(metadata))
      }, [publicKey]);

    const existingAccounts = useMemo(() =>  {
        if (!publicKey) return []
        return connection.getTokenAccountsByOwner(publicKey!, { programId: TOKEN_PROGRAM_ID} )
      }, [publicKey]);

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        if (!props.profile) throw "LinkedIn profile is not set"

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: Keypair.generate().publicKey,
                lamports: 1,
            })
        );

        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, 'processed');
    }, [publicKey, sendTransaction, connection]);

    return (
        <div>{
            existingMetadata.map((meta) => {
                <div>Existing stuff</div>
            })
        }
        {
        <button onClick={onClick} disabled={!publicKey}>
            Send 1 lamport to a random address!
        </button>
        
        }
        </div>
    );
};