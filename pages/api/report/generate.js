// pages/api/report/generate.js

import { exec } from "child_process";
import path from "path";

export default function handler(req, res) {
  const { week, days } = req.query; // Accept days param

  if (!week) {
    return res.status(400).json({ error: "Missing week parameter" });
  }

  const projectRoot = path.resolve(process.cwd());
  const pythonScript = path.join(projectRoot, 'backend', 'reporting', 'weekly_report.py');
  const predictionsPath = path.join(projectRoot, 'public', 'heatmap_data.json');
  const csvPath = path.join(projectRoot, 'public', 'ultimate_combined_data.csv');
  const outDir = path.join(projectRoot, 'public', 'reports');

  // --hist_days default to 0 if not provided
  const histDays = days || 0;

  const command = `python3 "${pythonScript}" --week ${week} --predictions "${predictionsPath}" --csv "${csvPath}" --outdir "${outDir}" --hist_days ${histDays}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: "Report generation failed" });
    }

    console.log(stdout);

    return res.status(200).json({
      message: "Report generated",
      url: `/reports/dengue_week_${week}_report.pdf?t=${Date.now()}`,
    });
  });
}
