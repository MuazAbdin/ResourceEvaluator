import AssociationDataAnalyzer from "./dataAnalyzers/AssociationDataAnalyzer.js";
import InstanceDataCollector from "./dataCollectors/InstanceDataCollector.js";
import ConsoleDisplay from "./resultDisplay/ConsoleDisplay.js";
import Logger from "./utils/logger.js";

async function run() {
  try {
    Logger.info("Starting data collection process");
    const instanceDataCollector = new InstanceDataCollector();
    const allInstances = await instanceDataCollector.getAll();

    const associationDataAnalyzer = new AssociationDataAnalyzer();
    const { compliantInstances, nonCompliantInstances } =
      await associationDataAnalyzer.checkCompliance(allInstances);
    const tableData = associationDataAnalyzer.SummrizeResults(nonCompliantInstances);

    ConsoleDisplay.display({
      title: "NON-COMPLIANT MANAGED INSTANCES",
      header: ["InstanceId", "Association", "Severity", "Status"],
      items: tableData,
    });

    Logger.info("Data collection and analysis complete");
  } catch (error) {
    Logger.error("An unexpected error occurred", error);
  }
}

// Run the application
run();
