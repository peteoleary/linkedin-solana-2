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

export const getErrorForTransaction = async (
    connection: Connection,
    txid: string,
  ) => {
    // wait for all confirmation before geting transaction
    await connection.confirmTransaction(txid, 'max');
  
    const tx = await connection.getParsedConfirmedTransaction(txid);
  
    const errors: string[] = [];
    if (tx?.meta && tx.meta.logMessages) {
      tx.meta.logMessages.forEach(log => {
        const regex = /Error: (.*)/gm;
        let m;
        while ((m = regex.exec(log)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }
  
          if (m.length > 1) {
            errors.push(m[1]);
          }
        }
      });
    }
  
    return errors;
  };
  
  export const DEFAULT_TIMEOUT = 15000;
  
  export const explorerLinkFor = (
    txid: TransactionSignature,
    connection: Connection,
  ): string => {
    return `https://explorer.solana.com/tx/${txid}?cluster=${envFor(connection)}`;
  };
  

export async function awaitTransactionSignatureConfirmation(
    txid: TransactionSignature,
    timeout: number,
    connection: Connection,
    commitment: Commitment = 'recent',
    queryStatus = false,
  ): Promise<SignatureStatus | null | void> {
    let done = false;
    let status: SignatureStatus | null | void = {
      slot: 0,
      confirmations: 0,
      err: null,
    };
    let subId = 0;
    // eslint-disable-next-line no-async-promise-executor
    status = await new Promise(async (resolve, reject) => {
      setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        log.warn('Rejecting for timeout...');
        reject({ timeout: true });
      }, timeout);
      try {
        subId = connection.onSignature(
          txid,
          (result, context) => {
            done = true;
            status = {
              err: result.err,
              slot: context.slot,
              confirmations: 0,
            };
            if (result.err) {
              log.warn('Rejected via websocket', result.err);
              reject(status);
            } else {
              log.debug('Resolved via websocket', result);
              resolve(status);
            }
          },
          commitment,
        );
      } catch (e) {
        done = true;
        log.error('WS error in setup', txid, e);
      }
      while (!done && queryStatus) {
        // eslint-disable-next-line no-loop-func
        (async () => {
          try {
            const signatureStatuses = await connection.getSignatureStatuses([
              txid,
            ]);
            status = signatureStatuses && signatureStatuses.value[0];
            console.log(explorerLinkFor(txid, connection));
            if (!done) {
              if (!status) {
                log.debug('REST null result for', txid, status);
              } else if (status.err) {
                log.error('REST error for', txid, status);
                done = true;
                reject(status.err);
              } else if (!status.confirmations) {
                log.error('REST no confirmations for', txid, status);
              } else {
                log.debug('REST confirmation for', txid, status);
                done = true;
                resolve(status);
              }
            }
          } catch (e) {
            if (!done) {
              log.error('REST connection error: txid', txid, e);
            }
          }
        })();
        await sleep(2000);
      }
    });
  
    //@ts-ignore
    if (connection._signatureSubscriptions[subId])
      connection.removeSignatureListener(subId);
    done = true;
    log.debug('Returning status', status);
    return status;
  }

  export const findProgramAddress = async (
    seeds: (Buffer | Uint8Array)[],
    programId: PublicKey,
  ) => {
    const localStorage = useLocalStorage();
    const key =
      'pda-' +
      seeds.reduce((agg, item) => agg + item.toString('hex'), '') +
      programId.toString();
    const cached = localStorage.getItem(key);
    if (cached) {
      const value = JSON.parse(cached);
  
      return [value.key, parseInt(value.nonce)] as [string, number];
    }
  
    const result = await PublicKey.findProgramAddress(seeds, programId);
  
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          key: result[0].toBase58(),
          nonce: result[1],
        }),
      );
    } catch {
      // ignore
    }
  
    return [result[0].toBase58(), result[1]] as [string, number];
  };

const PubKeysInternedMap = new Map<string, PublicKey>();

export const toPublicKey = (key: (string | PublicKey)) => {
  if (typeof key !== 'string') {
    return key;
  }

  let result = PubKeysInternedMap.get(key);
  if (!result) {
    result = new PublicKey(key);
    PubKeysInternedMap.set(key, result);
  }

  return result;
};