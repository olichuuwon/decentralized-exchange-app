import { ethers } from "ethers";

// Boiler Plate Code

export default class UnCheckedJsonRpcSigner extends ethers.Signer {
  constructor(signer) {
    super()
    ethers.utils.defineReadOnly(this, "signer", signer)
    ethers.utils.defineReadOnly(this, "provider", signer.provider)
  }

  getAddress() {
    return this.signer.getAddress()
  }

  sendTransaction(transaction) {
    return this.signer.sendUncheckedTransaction(transaction).then(hash => {
      return {
        hash: hash,
        nonce: null,
        gasLimit: null,
        data: null,
        value: null,
        chainId: null,
        confirmations: 0,
        from: null,
        wait: confirmations => {
          return this.signer.provider.waitForTransaction(hash, confirmations);
        }
      };
    });
  };

  signMessage(message) {
    return this.signer.signMessage(message);
  }
}