import { programs } from '@metaplex/js';
import {createMetadata, Data} from '../src/utils/metaplex'
import { AccountInfo, Keypair, PublicKey } from '@solana/web3.js';
import {findByOwnerV2MockData} from './fixtures'

describe('Data and metadata', function () {

    test('loads Metadata', () => {
        const accountInfo: AccountInfo<Buffer> = {
            /** `true` if this account's data contains a loaded program */
            executable: findByOwnerV2MockData['info']['executable'],
            /** Identifier of the program that owns the account */
            owner: new PublicKey(findByOwnerV2MockData['info']['owner']),
            /** Number of lamports assigned to the account */
            lamports: findByOwnerV2MockData['info']['lamports'],
            /** Optional data assigned to the account */
            data: Buffer.from(findByOwnerV2MockData['info']['data']['data'])
          };
        const accounts = new programs.metadata.Metadata(findByOwnerV2MockData['pubkey'], accountInfo )
        
        expect(accounts).not.toBe(null);
    });

    test('creates Metadata', () => {
        const key = new Keypair()
        const data = new Data({
            symbol: 'TEST',
            name: 'Test data',
            uri: ' '.repeat(64), // size of url for arweave
            sellerFeeBasisPoints: 0.0,
            creators: [],
            })
        const publicKeyString = key.publicKey.toBase58()
        const meta = createMetadata(data, publicKeyString, publicKeyString, publicKeyString, [], publicKeyString)
        
        expect(meta).not.toBe(null);
    });

});
