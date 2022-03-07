import React, { FC, useMemo, useEffect, useState } from 'react';
import {Card, Button} from "react-bootstrap"
import request from 'superagent'
import ReactJson from 'react-json-view'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {mintNftySocial, updateNftySocial, LinkedinProfile} from './utils/mint_nfty_social'
import {Metadata} from './utils/metaplex'
import { initArweave } from './utils/arweave';

interface CardData {
    metadata: Metadata;
    profile: LinkedinProfile
}

export const MetaplexNFTCard: FC<CardData> = (props) => {

    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();

    const isValidUri = (uri: string): boolean  => {
        let url;
        try {
          url = new URL(uri);
        } catch (_) {
          return false;  
        }
        return url.protocol === "http:" || url.protocol === "https:";
      }

    const isValidNFT = (): boolean => {
        return jsonData != null
    }

    const isOurNFT = (): boolean => {
        return true
    }

    const [jsonData, setJsonData] = useState(null)

    const onClick = (e, profile: LinkedinProfile) => {
        updateNftySocial(props.metadata, props.profile, initArweave(), publicKey, connection, signTransaction)
    }

   useEffect(() => {
       if (props.metadata.data.data.uri && isValidUri(props.metadata.data.data.uri)) {
            request.get(props.metadata.data.data.uri).then((results) => {
                setJsonData(JSON.parse(results.text))
        }).catch((err) => {
            console.log(err)
        })
       } else {
        setJsonData({message: "Invalid metadata"})
       }
        
   }, [props.metadata.data.data.uri])

    return (
        <React.Fragment>
        {isValidNFT() && (<Card style={{ width: '18rem' }}>
            <Card.Img variant="top" src={jsonData.image} />
            <Card.Body>
                <Card.Title>{props.metadata.data.data.symbol}</Card.Title>
                <Card.Text>
                <ReactJson src={jsonData} />
                </Card.Text>
                <Card.Link href={props.metadata.data.data.uri}>{props.metadata.data.data.uri}</Card.Link>
            </Card.Body>
        </Card> )}
        {isValidNFT() && isOurNFT() && (<button onClick={(e) => onClick(e, props.profile)} disabled={!props.profile}>Update</button>)}
        </React.Fragment>
    );
}