# RealTicket Smart Contracts

[RealTicket](link_to_landing_page) is the NFT ticketing platform to replace all others

The tickets live on the [Polygon](https://polygon.technology/) network, a decentralised [Ethereum](https://ethereum.org/en/) scaling platform

These smart contracts extend the ones provided by the [openzeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts/) library

They were developed using the [npm](https://www.npmjs.com/) package [Truffle](https://trufflesuite.com/) for [nodejs](https://nodejs.org/en/)

## Setup

### Install npm on MacOS

    brew install nvm
    nvm install 14
    nvm use 14
    brew install npm

### Install npm packages

    npm install -g truffle
    npm install -g ganache-cli
    npm install -g solc
    npm install truffle-flattener -g
    npm install @openzeppelin/contracts
    npm install @truffle/hdwallet-provider

### Add secrets

    echo MNEMONIC > .secret
    echo INFURA_HEY > .infureId
    echo ALCHEMY_HEY > .alchemyId

## Truffle Steps

### Useful commads

    truffle init
    truffle create contract RealTicket
    truffle create contract ERC721Status
    truffle compile

    truffle create test RealTicket
    truffle test

    truffle create migration RealTicket
    ganache-cli
    truffle migrate

### Deploy smart contracts

    truffle migrate --network mumbai --reset

### Verify on etherscan

    truffle-flattener contracts/RealTicket.sol > merged.sol
    echo "// SPDX-License-Identifier: MIT" > compiled.sol
    grep -v -w SPDX-License-Identifier merged.sol >> compiled.sol
    rm merged.sol
    https://ropsten.etherscan.io/verifyContract

## Useful Links

- [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/)
- [EIP-721](https://eips.ethereum.org/EIPS/eip-721)
- [Open Zeppelin Docs](https://docs.openzeppelin.com/contracts/3.x/erc721)
- [Open Zeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Verify on Polygonscan](https://mumbai.polygonscan.com/verifyContract)
- [Realticket on Mumbai](https://mumbai.polygonscan.com/address/0x04bdaa899293788b8ecd91ef665f30d5ec5d719d)
- [Admin's address](https://mumbai.polygonscan.com/address/0xd37B52e463386611A1F5F5750492AB7E836E5A87)
