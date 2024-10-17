import { EncryptionKey } from "@super-protocol/dto-js";
import { Crypto, parseStorageCredentials, StorageKeyValueAdapter } from "@super-protocol/sdk-js";

export async function getCredentialsFromOrderResult(
    orderEncryptedResult: string,
    storageOrderKey: EncryptionKey,
  ): Promise<any> {

    const decryptedResult = await Crypto.decrypt({
      ...JSON.parse(orderEncryptedResult),
      ...storageOrderKey,
    });

    const credentials = parseStorageCredentials(decryptedResult);

    const adapter = new StorageKeyValueAdapter<any>(
        {
          storageType: credentials.storageType,
          credentials: credentials.downloadCredentials,
        },
        { showLogs: true },
      );
      const result = await adapter.get('result.json', storageOrderKey.key);

      // TODO: validate result
      return result;
}
