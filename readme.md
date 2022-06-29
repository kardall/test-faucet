##Test Faucet Links##

Adjust Swapfile Size https://arcolinux.com/how-to-increase-the-size-of-your-swapfile/
Enable SSH https://linuxize.com/post/how-to-enable-ssh-on-ubuntu-20-04/
Guild Operators (CNTools) https://cardano-community.github.io/guild-operators/basics/
Cardano-Wallet https://developers.cardano.org/docs/get-started/installing-cardano-wallet/#macos--linux
Visual Studio Code https://linuxize.com/post/how-to-install-visual-studio-code-on-ubuntu-20-04/#installing-visual-studio-code-as-a-snap-package

Create Wallet With cardano-wallet

curl -X POST http://localhost:8090/v2/wallets -d '{"mnemonic_sentence":["your","phrases","here"], "passphrase":"somepassphrase", "name":"My Test Wallet", "address_pool_gap":20}' -H "Content-Type: application/json"