import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo, useCallback, useState } from 'react';

import LinkedInPage from "./LinkedInPage";

import { MintNFTButton } from './MintNFTButton';
import { MetaplexNFTDisplay } from './MetaplexNFTDisplay'

import {Dropdown} from "react-bootstrap"

import { initArweave } from './utils/arweave'

import { Navbar, Container, Row, Col } from 'react-bootstrap'

import './App.module.css'

import type { NextPage } from 'next'

const App: NextPage = () => {
   
    const arweave =  useMemo(() => initArweave(), []);

    const [profile, setProfile] = useState(null);

    const [selectedNFT, setSelectedNFT] = useState(null);

    const setProfileCallback = useCallback((profile) => {
        setProfile(profile);
      }, []);

    const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet)

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    // const endpoint = 'http://127.0.0.1:8899'

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    );

    const handleSelect = (eventKey: string, e: any) => {
        switch (eventKey) {
            case 'localhost':
                setNetwork('http://127.0.0.1:8899')
                break;
            default:
                setNetwork(eventKey);
                break;
        }
      }

    const networkDropdown = () => {
        return (
            <Dropdown onSelect={handleSelect}>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {network}
                </Dropdown.Toggle>
                <Dropdown.Menu >
                <Dropdown.Item eventKey="localhost">Localhost</Dropdown.Item>
                <Dropdown.Item eventKey={WalletAdapterNetwork.Devnet}>Devnet</Dropdown.Item>
                <Dropdown.Item eventKey={WalletAdapterNetwork.Testnet}>Testnet</Dropdown.Item>
                <Dropdown.Item eventKey={WalletAdapterNetwork.Mainnet}>Mainnet</Dropdown.Item>
            </Dropdown.Menu>
            </Dropdown>
        )
    }

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
            <Container className='container-main'>
                <Row className='row-header'>
                    <Col>Wallet</Col>
                    <Col>Network</Col>
                    <Col>LinkedIn</Col>
                </Row>
                <Row className='row-help'>
                    <Col>Connect your Solana wallet</Col>
                    <Col>Select the network to use. <br />Note: this does not have to be the same network selected in your wallet.</Col>
                    <Col>Connect your linked in Profile</Col>
                </Row>
                <Row className='row-buttons'>
                <Col> <WalletMultiButton /></Col>
                <Col>{ networkDropdown() }
                   
                </Col>
                    <Col>
                    <LinkedInPage setProfileCallback={setProfileCallback}/>
                    </Col>
                </Row>
                <Row>
                    <Col></Col>
                    <Col><MetaplexNFTDisplay profile={profile} arweave={arweave} nftSelected={setSelectedNFT} key={network} /></Col>
                    <Col><MintNFTButton profile={profile} arweave={arweave} selectedNFT={selectedNFT} /></Col>
                </Row>
            </Container>
            </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default App