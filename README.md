# <img src="logo.svg" alt="RealTicket Smart Contracts" height="40px">

[![ERC-721](https://img.shields.io/badge/-ERC--721-blue)](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/)
[![EIP-721](https://img.shields.io/badge/-EIP--721-blue)](https://eips.ethereum.org/EIPS/eip-721)
[![OpenZeppelin](https://img.shields.io/badge/-OpenZeppelin-blue)](https://docs.openzeppelin.com/contracts/3.x/erc721)

[RealTicket](https://realticket.lokadevops.com/) is the NFT ticketing platform to replace all others

The tickets live on the [Polygon](https://polygon.technology/) network, a decentralised [Ethereum](https://ethereum.org/en/) scaling platform

This smart contract extend the ones provided by the [openzeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts/) library

They were developed using the [npm](https://www.npmjs.com/) package [Truffle](https://trufflesuite.com/) for [nodejs](https://nodejs.org/en/)

# Overview

Each event launches its own [RealTicket.sol](contracts/RealTicket.sol) smart contract with the following variables:
- `price`: ticket pricing
- `fee`: transaction fee
- `capacity`: event capacity
- `manager role`: which is able to modify the event settings (price, fee, capacity, pause sales) and mint new tickets
- `bouncer role`: which is able to change the status of a given ticket

It extends the base ERC721 standard with:
- `ERC721Enumerable`: enumerate tokens owned by a given account
- `ERC721Burnable`: a ticket may be burnt by its rightful owner
- `ERC721Pausable`: a manager role may pause ticket sales
- `ERC721Status`: a ticket has one of the following status: READY, BOUNDED, USED, BLOCKED

# Contribute
There is still a lot of work ahead and we invite the community to contribute and take this vision a step further. A few things that we would like to pursue as next steps are:

- We must accept any token as payment method, specially stable coins which can be used to provide a steady pricing
- An event should include several ticket types with different prices and permissions
- A bouncer may only change the ticket status with a signature given by the tickets rightful owner 

# License
RealTicket Contracts are released under the [MIT License](LICENSE).

# Learn More

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
    echo INFURA_HEY > .infuraId
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

- [Open Zeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Verify on Polygonscan](https://mumbai.polygonscan.com/verifyContract)
- [Realticket on Mumbai](https://mumbai.polygonscan.com/address/0x04bdaa899293788b8ecd91ef665f30d5ec5d719d)
- [Admin's address](https://mumbai.polygonscan.com/address/0xd37B52e463386611A1F5F5750492AB7E836E5A87)
