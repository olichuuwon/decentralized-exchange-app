import { ethers } from "ethers";
import UnCheckedJsonRpcSigner from "./signer";

export function isAddress(value) {
  try {
    return ethers.utils.getAddress(value.toLowerCase())//make sure it's an address

  } catch {
    return false;
  }
}

export function getProviderOrSigner(library, account) {
  return account ? new UnCheckedJsonRpcSigner(library.getSigner(account)) : library
}

export function getContract(address, ABI, library, account) {
  // making sure Eth address starts with 0
  if (!isAddress(address) || address === ethers.constants.AddressZero) {
    throw Error(`Invalid "address" parameter ${address}`);
  }

  // return new contract
  return new ethers.Contract(address, ABI, getProviderOrSigner(library, account));
}