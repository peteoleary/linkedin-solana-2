import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useCallback, useState } from 'react';

import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;

import Arweave from 'arweave/node/common';

import {mintNftySocial, LinkedinProfile} from './utils/mint_nfty_social'

interface MintProps {
    profile: LinkedinProfile;
    arweave: Arweave
  }  

// metaplex/js/packages/cli/src/commands/mint-nft.ts or metaplex/js/packages/candy-machine-ui/src/candy-machine.ts

export const MintNFTButton: FC<MintProps> = (props) => {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();

    const [arweave, setArweave] = useState(props.arweave)

    const onClick = useCallback(async (profile) => {
        if (!publicKey) throw new WalletNotConnectedError();

        if (!profile) throw "LinkedIn profile is not set"
    
        mintNftySocial(props.profile, props.arweave, publicKey, connection, signTransaction)

    }, [publicKey, connection]);

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