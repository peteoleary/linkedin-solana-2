import Arweave from 'arweave/node/common';

const arweave_production_params = {
    host: 'arweave.net',// Hostname or IP address for a Arweave host
    port: 443,          // Port
    protocol: 'https',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false,     // Enable network request logging
}

const arweave_local_params = {
    host: 'localhost',// Hostname or IP address for a Arweave host
    port: 1984,          // Port
    protocol: 'http',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: true,     // Enable network request logging
}

export const initArweave = () => {
    return Arweave.init(arweave_production_params)
}

export const uploadJsonToArweave = async (arweave: Arweave, json_string: string) => {
    let transaction = await arweave.createTransaction( {data: json_string} )
    await arweave.transactions.sign(transaction)

    let uploader = await arweave.transactions.getUploader(transaction)

  /* TODO: don't get stuck here */
    while (!uploader.isComplete) {
        await uploader.uploadChunk()
        console.log(
        `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`,
        )
    }
    return transaction.id
}