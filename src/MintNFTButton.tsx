import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useCallback, useState } from 'react';

import Arweave from 'arweave/node/common';

import {mintNftySocial, updateNftySocial, LinkedinProfile} from './utils/mint_nfty_social'

interface MintProps {
    profile: LinkedinProfile;
    arweave: Arweave,
    selectedNFT: any // TODO: fill in type here
  }  

// metaplex/js/packages/cli/src/commands/mint-nft.ts or metaplex/js/packages/candy-machine-ui/src/candy-machine.ts

export const MintNFTButton: FC<MintProps> = (props) => {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();

    const buttonMessage = (): string => {
      if (props.selectedNFT) {
        return "Update LinkedIn NFT"
      } else {
        return "Mint LinkedIn NFT"
      }
    }

    const onClick = useCallback(async (event, profile) => {

        event.preventDefault()
        if (!publicKey) throw new WalletNotConnectedError();

        if (!profile) throw "LinkedIn profile is not set"
    
        if (props.selectedNFT){
          console.log(`updateNftySocial props.selectedNFT=${props.selectedNFT}`)
          updateNftySocial(props.selectedNFT, props.profile, props.arweave, publicKey, connection, signTransaction)
        }
        else {
          console.log(`mintNftySocial`)
          mintNftySocial(props.profile, props.arweave, publicKey, connection, signTransaction)
        }


    }, [publicKey, connection]);

    return (
        <div>
        {
        <button onClick={(e) => onClick(e, props.profile)} disabled={!publicKey || props.profile == null}>
            {buttonMessage()}
        </button>
        
        }
        </div>
    );
};