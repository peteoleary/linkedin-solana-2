# LinkedIn Solana NFT Generator

This is a (WIP) UI which authenticates with LinkedIn then generates an NFT using information from the user's profile.

## Overview

This is a ReactJS front end running on an Express server. Express serves as middleware which proxies API calls to LinkedIn with a client secret which must never make it into the front end. We use Parcel to serve the front end while in development

## Setup and run

You need a to first create a LinkedIn app at https://www.linkedin.com/developers/apps with the "Sign In with LinkedIn" product added. This will give you a "client id" and "client secret" which you need to fill in to the `.env.template` file and rename the file to `.env`

### Development mode

`yarn install`
`yarn watch` will start Parcel
`yarn start` in a different shell with start Express

### Acknowledgements

This project borrows/steals from:

https://github.com/tonyxu-io/React-Linkedin-Login gave me the basic idea

https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/react-ui-starter was the base of the ReactJS front end

https://github.com/nvh95/react-linkedin-login-oauth2 simplified handling LinkedIn OAuth