import {
  DescribeInstanceInformationCommand,
  DescribeInstanceInformationRequest,
  InstanceInformation,
  SSMClient,
} from "@aws-sdk/client-ssm";
import DataCollector from "./DataCollector.js";
import _SSMClient from "../clients/ssm.js";
import Logger from "../utils/logger.js";

class InstanceDataCollector implements DataCollector<InstanceInformation> {
  private client = _SSMClient.getClient();

  public async getAll(
    input: DescribeInstanceInformationRequest = {}
  ): Promise<InstanceInformation[]> {
    Logger.info("Fetching all managed instances");

    const output: InstanceInformation[] = [];
    let nextToken = input?.NextToken; // to continue to next batch of instances

    do {
      const command = new DescribeInstanceInformationCommand(input);
      const response = await this.client.send(command);
      output.push(...(response.InstanceInformationList || []));
      nextToken = response.NextToken;
    } while (nextToken);

    Logger.info(`Fetched ${output.length} managed instances`);
    return output;
  }

  public async getOne(id: string): Promise<InstanceInformation> {
    Logger.info(`Fetching instance information for ID: ${id}`);
    const allInstances = await this.getAll({
      InstanceInformationFilterList: [{ key: "InstanceIds", valueSet: [id] }],
    });
    const output = allInstances[0];
    if (!output) throw Error(`No instace with id: [${id}]`);
    return output;
  }
}

export default InstanceDataCollector;
