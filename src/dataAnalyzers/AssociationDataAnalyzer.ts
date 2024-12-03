import {
  ComplianceItem,
  InstanceInformation,
  ListComplianceItemsCommand,
  ListComplianceItemsCommandOutput,
} from "@aws-sdk/client-ssm";
import _SSMClient from "../clients/ssm.js";
import { COMPLIANCE_STATUS } from "../types/enums.js";
import DataAnalyzer from "./DataAnalyzer.js";
import Logger from "../utils/logger.js";

class AssociationDataAnalyzer implements DataAnalyzer {
  private client = _SSMClient.getClient();

  public async checkCompliance(resourceItems: Array<InstanceInformation>) {
    Logger.info(`Checking compliance for ${resourceItems.length} instances`);
    const complianceResults = await this.getComplianceChecks(resourceItems);

    const analysis = this.analyzeComplianceChecks(complianceResults);
    Logger.info(
      `Compliance check complete: ${
        Object.keys(analysis.compliantInstances).length
      } compliant, ${Object.keys(analysis.nonCompliantInstances).length} non-compliant`
    );
    return analysis;
  }

  private async getComplianceChecks(resourceData: Array<InstanceInformation>) {
    const managedInstanceIds = resourceData.map((instance) => instance.InstanceId!);
    const complianceChecks = managedInstanceIds.map((instanceId) => {
      Logger.info(`Fetching compliance for Instance ID: ${instanceId}`);
      const command = new ListComplianceItemsCommand({
        ResourceIds: [instanceId],
        // ResourceTypes: ["ManagedInstance"],
      });
      return this.client.send(command);
    });

    try {
      const complianceResults = await Promise.all(complianceChecks);
      return complianceResults;
    } catch (error) {
      Logger.error("Error fetching compliance data", error);
      throw error;
    }
  }

  private analyzeComplianceChecks(complianceResults: ListComplianceItemsCommandOutput[]) {
    const compliantInstances: Record<string, ComplianceItem[]> = {};
    const nonCompliantInstances: Record<string, ComplianceItem[]> = {};
    complianceResults.forEach((result) => {
      result.ComplianceItems?.forEach((item) => {
        const resourceId = item.ResourceId!;
        const isCompliant = item.Status === COMPLIANCE_STATUS.COMPLIANT;
        const target = isCompliant ? compliantInstances : nonCompliantInstances;
        (target[resourceId] || []).push(item);
      });
    });
    return { compliantInstances, nonCompliantInstances };
  }

  public summarizeResults(result: { [key: string]: ComplianceItem[] }) {
    const summary = Object.entries(result).flatMap(([k, v]) => {
      return v.map((item) => {
        return [
          k,
          item.Details?.DocumentName || "",
          item.Severity || "",
          item.Status || "",
        ];
      });
    });
    return summary;
  }
}

export default AssociationDataAnalyzer;
