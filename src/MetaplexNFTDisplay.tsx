import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import React, { FC, useCallback, useMemo, useEffect, useState } from 'react';
import {MetaplexNFTCard} from './MetaplexNFTCard'

import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;

export const MetaplexNFTDisplay: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

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

      const metaplexDisplay = () => {
        if (existingMetadata.length == 0){
            return (
                <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
                </div>
            )
        } else {
    
        return existingMetadata.map((meta) => {
                return <MetaplexNFTCard />
            })
        }
    }

    return (
        metaplexDisplay()
    );
}