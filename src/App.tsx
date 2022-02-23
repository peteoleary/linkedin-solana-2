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
import { LinkedInCallback } from "react-linkedin-login-oauth2";

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MintNFTButton } from './MintNFTButton';
import { MetaplexNFTDisplay } from './MetaplexNFTDisplay'

import {Dropdown} from "react-bootstrap"

const App: FC = () => {

    return (
        <Router>
        <Routes>
            <Route path="/test" element={<span >Inline works</span>} />
            <Route path="/linkedin" element={<LinkedInCallback />} />
            <Route path="/" element={<Body />} />
        </Routes>
      </Router>
    );
  }

const Body: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.

    const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet)

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

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

    const handleSelect = (eventKey, e) => {
        switch (eventKey) {
            case 'localhost':
                setNetwork('http://127.0.0.1:8899')
                break;
            default:
                setNetwork(eventKey);
                break;
        }
      }

    return (
        <ConnectionProvider endpoint={endpoint}>
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
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {

    const [profile, setProfile] = useState(null);

    const setProfileCallback = useCallback((profile) => {
        setProfile(profile);
      }, []);

    return ( <div>
        <WalletMultiButton />
        <LinkedInPage setProfileCallback={setProfileCallback}/>
        <MintNFTButton profile={profile} />
        <MetaplexNFTDisplay />
        </div>
        );
};

export default App