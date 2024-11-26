import cron from "node-cron";
import { alertRulesService } from "../services/alertRules";

// Function to process alert rules
async function processAlertRules(conditionType: string) {
  try {
    const rules = await alertRulesService.getByConditionType(conditionType);

    // Process each rule
    for (const rule of rules) {
      // Add your processing logic here
      console.log(
        `Processing rule ${rule.id} with condition type: ${conditionType}`
      );

      // Example: You might want to check conditions and trigger alerts
      // await checkConditionsAndTriggerAlert(rule);
    }
  } catch (error) {
    console.error("Error processing alert rules:", error);
  }
}

// Schedule the cron job to run every 5 minutes
export function startAlertRulesCron() {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running alert rules cron job...");

    // Add your condition types here
    const conditionTypes = ["type1", "type2"]; // Replace with your actual condition types

    // Process rules for each condition type
    for (const conditionType of conditionTypes) {
      await processAlertRules(conditionType);
    }
  });
}
