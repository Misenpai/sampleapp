// src/services/cronJobs.ts
import axios from "axios";
import cron from "node-cron";

const API_BASE = process.env.API_BASE;

cron.schedule("0 9 * * *", async () => {
  try {
    console.log("Processing field trip attendance...");
    const response = await axios.post(
      `${API_BASE}/field-trips/process-attendance`,
    );
    console.log("Field trip attendance processed:", response.data);
  } catch (error) {
    console.error("Error processing field trip attendance:", error);
  }
});
