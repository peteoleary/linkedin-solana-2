import React, { useState, FC } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'
import {programs} from '@metaplex/js'

type ShareProps = {
  isOpen: boolean,
  handleSubmit: any; // TODO: callback
}

export const ShareModal: FC<ShareProps> = (props: ShareProps) => {

  const [address, setAddress] = useState('')

  return (
    <React.Fragment>
    <Modal 
      show={props.isOpen} 
      onHide={() => {
        props.handleSubmit(null)
      }}
    >
    <Modal.Header closeButton>
      <Modal.Title>Mint NFT to Address</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form.Group >
            <Form.Label>Name: </Form.Label>
            <Form.Control type="text" onChange={(e) => setAddress(e.target.value)} placeholder="address to send to"/>           
        </Form.Group>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="primary" type="submit" onClick={() => {
          props.handleSubmit(address)
          }}>
            Submit
        </Button>
    </Modal.Footer>
  </Modal>
    </React.Fragment>
    )
}