import React, { FC, useMemo, useEffect, useState } from 'react';
import {Card, Button} from "react-bootstrap"
import request from 'superagent'
import ReactJson from 'react-json-view'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {sendNftySocial, updateNftySocial, LinkedinProfile} from './utils/mint_nfty_social'
import {
    Metadata,
  } from '@oyster/common';
import { initArweave } from './utils/arweave';
import { ShareModal } from './ShareModal'

interface CardData {
    metadata: Metadata;
    profile: LinkedinProfile
}

export const MetaplexNFTCard: FC<CardData> = (props) => {

    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();

    const [showModal, setShowModal] = useState(false)

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

    const updateNFT = (e, profile: LinkedinProfile) => {
        updateNftySocial(props.metadata, props.profile, initArweave(), publicKey, connection, signTransaction)
    }

    const shareNFT = (e, profile: LinkedinProfile) => {
        setShowModal(true)
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

   const handleSubmit = async (val: (string | null)) => {
    if (val && val.length > 0) {
        await sendNftySocial(props.metadata, val, publicKey, connection, signTransaction)
    }
    
    
    // TODO: add progress indicator and completion message
    setShowModal(false)
   }

    return (
        <React.Fragment>
        <ShareModal isOpen={showModal} handleSubmit={handleSubmit} />
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
        {isValidNFT() && isOurNFT() && (<button onClick={(e) => updateNFT(e, props.profile)} disabled={!props.profile}>Update</button>)}
        {isValidNFT() && isOurNFT() && (<button onClick={(e) => shareNFT(e, props.profile)}>Share</button>)}
        </React.Fragment>
    );
}