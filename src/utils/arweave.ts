import Arweave from 'arweave/node/common';

const uploadJsonToArweave = async (arweave: Arweave, json_string: string) => {
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

export {uploadJsonToArweave}