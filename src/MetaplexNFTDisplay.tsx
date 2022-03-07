import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import React, { FC, useCallback, useMemo, useEffect, useState } from 'react'
import {MetaplexNFTCard} from './MetaplexNFTCard'

import { programs } from '@metaplex/js';

import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

import {ListGroup} from 'react-bootstrap'
import { LinkedinProfile } from './utils/mint_nfty_social';

interface MetaplexNFTDisplayProps {
  arweave: any,
  nftSelected: any // callback
  profile: LinkedinProfile
}

export const MetaplexNFTDisplay: FC<MetaplexNFTDisplayProps> = (props: MetaplexNFTDisplayProps) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
      
      const [existingMetadata, setExistingMetadata] = useState<programs.metadata.Metadata[]>(null)

      useEffect(() => {
        if (!publicKey) return
        programs.metadata.Metadata.findByOwnerV2(connection, publicKey!).then((metadata) => {
          console.log(`Metadata.findByOwnerV2=${metadata}`)
          setExistingMetadata(metadata)
        })
      }, [publicKey, connection]);

    const existingAccounts = useMemo(() =>  {
        if (!publicKey) return []
        return connection.getTokenAccountsByOwner(publicKey!, { programId: TOKEN_PROGRAM_ID} )
      }, [publicKey]);

      const listClicked = (which: any) => {
        props.nftSelected(which)
      }

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
                return <ListGroup.Item><MetaplexNFTCard profile={props.profile} metadata={meta} key={meta.pubkey.toBase58()}/></ListGroup.Item>
            })
            }
            </ListGroup>
          )
        }
      </React.Fragment>
      )
}