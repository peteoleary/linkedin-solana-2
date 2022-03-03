# LinkedIn Solana NFT Generator

This is a (WIP) UI which authenticates with LinkedIn then generates an NFT using information from the user's profile.

## Overview

This is a ReactJS front end running on an Express server. Express serves as middleware which proxies API calls to LinkedIn with a client secret which must never make it into the front end. We use Parcel to serve the front end while in development

The general idea is to use OAuth for authentication in the browser to a social network (such as LinkedIn) then mint an NFT with information from the social network. Since most of this happens within the browser, this project demonstrates how to pull several Javascript technologies together for this. The key challenge is to get transaction signing done in the client with Solana and Arweave wallets. Most of the code examples you find start by generating a keypair and airdropping SOL for the transaction payer/signer which is not what we need. We need the browser wallets to sign all transactions.

## Setup and run

You need a to first create a LinkedIn app at https://www.linkedin.com/developers/apps with the "Sign In with LinkedIn" product added. This will give you a "client id" and "client secret" which you need to fill in to the `.env.template` file and rename the file to `.env`

You will need a Solana browser wallet, there are lots to choose from. I use Phantom https://phantom.app/ and it's the only wallet I have tested with so far.

Also, you will need to sign up for Arweave and install https://www.arconnect.io/ in order to pay for uploading images and JSON assets to Arweave.

### Development mode

`yarn install`
`yarn watch` will start Parcel
`yarn start` in a different shell with start Express

### Start test validator with copy of Metaplex Tolken Program

solana-test-validator --clone metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s -u devnet

I haven't gotten the full minting process to work correctly on a test-validator, I think because all of the Metaplex smart contracts need to get ported at the correct addresses and I haven't figured out how to do this.

### Acknowledgements

This project borrows/steals from:

https://github.com/tonyxu-io/React-Linkedin-Login gave me the basic idea

https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/react-ui-starter was the base of the ReactJS front end

https://github.com/nvh95/react-linkedin-login-oauth2 simplified handling LinkedIn OAuth

Much code and knowhow was lifted from https://github.com/metaplex-foundation/metaplex/tree/master/js/packages/candy-machine-ui