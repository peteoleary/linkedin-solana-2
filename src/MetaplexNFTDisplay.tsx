import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import React, { FC, useCallback, useMemo, useEffect, useState } from 'react'
import {MetaplexNFTCard} from './MetaplexNFTCard'

import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;

import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

import {ListGroup} from 'react-bootstrap'

interface MetaplexNFTDisplayProps {
  arweave: any,
  nftSelected: any // callback
}

export const MetaplexNFTDisplay: FC<MetaplexNFTDisplayProps> = (props: MetaplexNFTDisplayProps) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
      
      const [existingMetadata, setExistingMetadata] = useState<programs.metadata.Metadata[]>(null)

      useEffect(() => {
        if (!publicKey) return
        Metadata.findByOwnerV2(connection, publicKey!).then((metadata) => setExistingMetadata(metadata))
      }, [publicKey, connection]);

    const existingAccounts = useMemo(() =>  {
        if (!publicKey) return []
        return connection.getTokenAccountsByOwner(publicKey!, { programId: TOKEN_PROGRAM_ID} )
      }, [publicKey]);

      const listClicked = (which: any) => {
        props.nftSelected(which)
      }

      const metaplexDisplay: FC<any> = (props) => {
        return (
        <React.Fragment>
          {!existingMetadata && ( <div className="spinner-border" role="status">
                </div>)
          }
          {existingMetadata && existingMetadata.length == 0 && 
          (
            <span>Found no NFTs</span>
          )}
      
          {existingMetadata&& existingMetadata.length > 0 && (
            <ListGroup onBlur={() => listClicked(null)}>
            { existingMetadata.map((meta) => {
                  return <ListGroup.Item action onClick={() => listClicked(meta)}><MetaplexNFTCard metadata={meta} /></ListGroup.Item>
              })
              }
              </ListGroup>
            )
          }
        </React.Fragment>
        )
    }

    return (
        metaplexDisplay({})
    );
}