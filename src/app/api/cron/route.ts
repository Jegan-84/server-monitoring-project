// pages/api/cron-job.ts
import type { NextApiRequest, NextApiResponse } from "next";
import cron from "node-cron";

let isCronScheduled = false;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isCronScheduled) {
    cron.schedule("* * * * *", () => {
      console.log("Cron job running every minute");
      // Your logic here
    });
    isCronScheduled = true;
  }

  res.status(200).json({ message: "Cron job set up successfully!" });
}
