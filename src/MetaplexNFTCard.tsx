import React, { FC, useMemo, useEffect, useState } from 'react';
import {Card} from "react-bootstrap"
import { programs } from '@metaplex/js';
import request from 'superagent'
import ReactJson from 'react-json-view'

interface CardData {
    metadata: programs.metadata.Metadata;
}

export const MetaplexNFTCard: FC<CardData> = (props) => {

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
        </React.Fragment>
    );
}