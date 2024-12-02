export default interface DataAnalyzer {
  checkCompliance: (resourceItems: Array<object>) => Promise<{
    compliantInstances: { [key: string]: unknown[] };
    nonCompliantInstances: { [key: string]: unknown[] };
  }>;
}
