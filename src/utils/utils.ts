import {
  Blockhash,
  Commitment,
  Connection,
  FeeCalculator,
  RpcResponseAndContext,
  SignatureStatus,
  SimulatedTransactionResponse,
  TransactionSignature,
  Keypair, SystemProgram, Transaction, PublicKey, TransactionInstruction, SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import { serialize } from 'borsh';
import {MetadataDataData} from '@metaplex-foundation/mpl-token-metadata'

import BN from 'bn.js'

const log = {
  error: console.log,
  warn : console.log,
  debug: console.log
}

// code copied from /metaplex/js/packages/token-entangler/src/utils/transactions.ts
// TODO: lots of copypasta in the metaplex code base


export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}



type UseStorageReturnValue = {
  getItem: (key: string) => string;
  setItem: (key: string, value: string) => boolean;
  removeItem: (key: string) => void;
};

export const useLocalStorage = (): UseStorageReturnValue => {
  const isBrowser: boolean = ((): boolean => typeof window !== 'undefined')();

  const getItem = (key: string): string => {
    return isBrowser ? window.localStorage[key] : '';
  };

  const setItem = (key: string, value: string): boolean => {
    if (isBrowser) {
      window.localStorage.setItem(key, value);
      return true;
    }

    return false;
  };

  const removeItem = (key: string): void => {
    window.localStorage.removeItem(key);
  };

  return {
    getItem,
    setItem,
    removeItem,
  };
};