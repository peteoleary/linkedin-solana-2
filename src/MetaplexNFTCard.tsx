import React, { FC, useMemo, useEffect, useState } from 'react';
import {Card} from "react-bootstrap"
import { programs } from '@metaplex/js';
import request from 'superagent'

interface CardData {
    metadata: programs.metadata.Metadata;
}

export const MetaplexNFTCard: FC<CardData> = (props) => {

    const [jsonData, setJsonData] = useState(null)

   useEffect(() => {
        request.get(props.metadata.data.data.uri).then((results) => {
            setJsonData(results.text)
        })
   }, [props.metadata.data.data.uri])

    return (
        <Card style={{ width: '18rem' }}>
            <Card.Img variant="top" src="holder.js/100px180" />
            <Card.Body>
                <Card.Title>{props.metadata.data.data.symbol}</Card.Title>
                <Card.Text>
                {jsonData}
                </Card.Text>
                <Card.Link href={props.metadata.data.data.uri}>{props.metadata.data.data.uri}</Card.Link>
            </Card.Body>
        </Card>
    );
}