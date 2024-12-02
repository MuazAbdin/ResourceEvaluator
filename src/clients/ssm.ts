import { SSMClient, SSMClientConfig } from "@aws-sdk/client-ssm";
import config from "../config.js";

/**
 * Singleton class to get SSMClient
 */
export default class _SSMClient {
  private static client: SSMClient;

  private constructor(config: SSMClientConfig) {
    _SSMClient.client = new SSMClient(config);
  }

  public static getClient() {
    if (!_SSMClient.client) new _SSMClient(config);
    return _SSMClient.client;
  }
}
