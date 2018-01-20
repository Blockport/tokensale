# Blockport
Solidity smart contracts for the Blockport token and pre-/crowdsale

## Overview

Blockport is a user-friendly crypto exchange that combines social trading with a hybrid-decentralized architecture to help people safely trade crypto assets.

Contracts for this repo are created for the [token sale](https://blockport.io/beforetokensale.html) of Blockport starting on January 3rd, 2018.


## Parameters

### Token


| Field            | Value         |
|------------------|---------------|
| Token name       | Blockport     |
| Token Ticker     | BPT           |
| Decimals         | 18            |
| Total supply     | 69.440.000    |
| Token Sale       | 71.4% Sale    |
| Reserved tokens  | 14.3% Team    |
| 				   | 14.3% Company |

### Pre-sale


| Field              	| Value                      	|
|-----------------------|-------------------------------|
| Tiers              	| 1                         	|
| Supply             	| 6.400.000 BPT                	|
| Rate               	| 3840 (incl. 33% bonus)      	|
| Allow Modifying       | Yes							|
| Whitelist         	| Yes                        	|
| Start date         	| 3 January, 2018 14:00 GMT  	|
| End date           	| 17 January, 2018 14:00 GMT 	|


Additional information:

- Rate - how many tokens for 1 ETH (Final rate will be set on 2nd of January 2018)
- Supply - max cap of tokens for pre-sale. Token is mintable. Unsold tokens will not be produced.
- "Allow modifying - Yes" means that rate, cap, minimum investment, start date, end date are modifiable.
- "Whitelist - Yes" means that whitelist is enable and only whitelisted accounts can participate in the Pre-sale.

### Crowdsale

Parameters

| Field              	| Value                      	|
|-----------------------|-------------------------------|
| Tiers              	| 1                         	|
| Supply             	| 43.200.000 BPT               	|
| Rate               	| 2880                      	|
| Individual cap       	| 50 ETH                      	|
| Minimum investment   	| 0.1 ETH                      	|
| Allow Modifying       | Yes							|
| Whitelist         	| Yes                        	|
| Start date         	| 24 January, 2018 14:00 GMT  	|
| End date           	| 28 February, 2018 14:00 GMT 	|


Additional information:

- Rate - how many tokens for 1 ETH
- Supply - max cap of tokens for Crowdsale. Token is mintable. Unsold tokens will not be produced.
- "Allow modifying - Yes" means that rate, cap, minimum investment, start date, end date are modifiable.
- "Whitelist - Yes" means that whitelist is enable and only whitelisted accounts can participate in the Crowdsale.

## Deployed contracts (Source code + verified)

* [Blockport Token](https://etherscan.io/token/0x327682779bab2bf4d1337e8974ab9de8275a7ca8)
* [Blockport Presale](https://etherscan.io/address/0xb901cbb8b07e0dd7e114284ca63f4092c7683322)
* [Blockport Crowdsale](https://etherscan.io/address/tba)
