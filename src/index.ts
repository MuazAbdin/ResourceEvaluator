import InstanceDataCollector from "./dataCollectors/InstanceDataCollector.js";

async function run() {
  try {
    const instanceDataCollector = new InstanceDataCollector();
    const allInstances = await instanceDataCollector.getAll();
    console.log(allInstances);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Run the application
run();
