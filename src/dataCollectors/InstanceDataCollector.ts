import {
  DescribeInstanceInformationCommand,
  DescribeInstanceInformationRequest,
  InstanceInformation,
  SSMClient,
} from "@aws-sdk/client-ssm";
import DataCollector from "./DataCollector.js";
import config from "../config.js";
import _SSMClient from "../clients/ssm.js";

class InstanceDataCollector implements DataCollector<InstanceInformation> {
  private client = _SSMClient.getClient();

  public async getAll(
    input: DescribeInstanceInformationRequest = {}
  ): Promise<InstanceInformation[]> {
    try {
      const output: InstanceInformation[] = [];
      let nextToken = input?.NextToken;

      do {
        const command = new DescribeInstanceInformationCommand(input);
        const response = await this.client.send(command);
        output.push(...(response.InstanceInformationList || []));
        nextToken = response.NextToken;
      } while (nextToken);

      return output;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async getOne(id: string): Promise<InstanceInformation> {
    try {
      const allInstances = await this.getAll({
        InstanceInformationFilterList: [{ key: "InstanceIds", valueSet: [id] }],
      });
      const output = allInstances[0];
      if (!output) throw Error(`No instace with id: [${id}]`);
      return output;
    } catch (error) {
      console.error(error);
      return {};
    }
  }
}

export default InstanceDataCollector;
