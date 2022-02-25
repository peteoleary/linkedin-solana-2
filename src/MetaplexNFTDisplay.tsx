import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import React, { FC, useCallback, useMemo, useEffect, useState } from 'react';
import {MetaplexNFTCard} from './MetaplexNFTCard'

import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;

import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

interface MetaplexNFTDisplayProps {
  arweave: any
}

export const MetaplexNFTDisplay: FC<MetaplexNFTDisplayProps> = (props: MetaplexNFTDisplayProps) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
      
      const [existingMetadata, setExistingMetadata] = useState<programs.metadata.Metadata[]>(null)

      useEffect(() => {
        if (!publicKey) return
        Metadata.findByOwnerV2(connection, publicKey!).then((metadata) => setExistingMetadata(metadata))
      }, [publicKey]);

    const existingAccounts = useMemo(() =>  {
        if (!publicKey) return []
        return connection.getTokenAccountsByOwner(publicKey!, { programId: TOKEN_PROGRAM_ID} )
      }, [publicKey]);

      const metaplexDisplay: FC<any> = (props) => {
        return (
        <React.Fragment>
          {!existingMetadata && ( <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
                </div>)
          }
          {existingMetadata && existingMetadata.length == 0 && 
          (
            <span className="sr-only">Nothing</span>
          )}
      
          {existingMetadata&& existingMetadata.length > 0 && existingMetadata.map((meta) => {
                  return <MetaplexNFTCard metadata={meta} />
              })}
        </React.Fragment>
        )
    }

    return (
        metaplexDisplay()
    );
}