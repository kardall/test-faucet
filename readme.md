# Test Faucet Instructions and Code

The following is how to get started with your own faucet with absolute basics as a jumping off point. The only code included is to monitor the wallet, and send a token currency using the configuration file. Make sure that before you try sending ADA to this wallet, that you change the test_config.json file to match your project details and token.

# Order Of Operations

1. Install OS
2. Setup Swapfile
3. Enable SSH (and do your security settings here)
4. Install CNTools
5. Run Node and let it synchronize with the block chain 100%
6. Install cardano-wallet
7. Install Visual Studio Code
8. Create Wallet with external source (Nami/Eternl/Daedalus/etc.) and record your mnemonic phrases as well as your spending passphrase
9. Run cardano-wallet service and execute the modified curl command to import the wallet using the mnemonics and passphrase previously
10. Visit the cardano-wallet list endpoint and wait for the wallet to synchronize (The json object should have state.status == "ready")

# Test Faucet Links And Snippets

## Adjust Swapfile Size:
  ```
  https://arcolinux.com/how-to-increase-the-size-of-your-swapfile/
  ```
## Enable SSH:
  ```
  https://linuxize.com/post/how-to-enable-ssh-on-ubuntu-20-04/
  ```
## Guild Operators (CNTools):
  ```
  https://cardano-community.github.io/guild-operators/basics/
  ```
## Cardano-Wallet:
  ```
  https://developers.cardano.org/docs/get-started/installing-cardano-wallet/#macos--linux
  ```
## Visual Studio Code:
  ```
  https://linuxize.com/post/how-to-install-visual-studio-code-on-ubuntu-20-04/#installing-visual-studio-code-as-a-snap-package
  ```

## Create Wallet With cardano-wallet

First Create using any wallet of your choice, in my case I used Nami. Write down the mnemonic phrases, and edit the command below to run in terminal when the cardano-wallet is running.

```
curl -X POST http://localhost:8190/v2/wallets -d '{"mnemonic_sentence":["your","phrases","here"], "passphrase":"somepassphrase", "name":"My Test Wallet", "address_pool_gap":20}' -H "Content-Type: application/json"
```

## Let Wallet Synchronize

```
http://localhost:8190/v2/wallets
````

Is the Wallets List endpoint. More endpoints are available at [Cardano Wallet Backend API Documentation](https://input-output-hk.github.io/cardano-wallet/api/edge/)

Once it has done 100% synchronizing, then you should be good to start coding the faucet, as at this point everything is up-to-date and ready to monitor the wallet for transactions.

