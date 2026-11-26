const report = require('multiple-cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

// The reporter parses EVERY .json file in jsonDir, but reports/ also holds
// non-Cucumber JSON (e.g. axe.json from accessibility runs), which crashes it.
// Copy only the Cucumber results into a dedicated folder and report from there.
const reportsDir = path.resolve(__dirname, '../../reports');
const cucumberJson = path.join(reportsDir, 'cucumber-report.json');
const jsonDir = path.join(reportsDir, 'cucumber-json');

if (!fs.existsSync(cucumberJson)) {
  console.error(`No Cucumber results found at ${cucumberJson}. Run the tests first.`);
  process.exit(1);
}
fs.rmSync(jsonDir, { recursive: true, force: true });
fs.mkdirSync(jsonDir, { recursive: true });
fs.copyFileSync(cucumberJson, path.join(jsonDir, 'cucumber-report.json'));

report.generate({
  jsonDir,
  reportPath: './reports/html-report',
  metadata: {
    browser: {
      name: 'chromium',
      version: '120'
    },
    device: 'Local test machine',
    platform: {
      name: 'Windows',
      version: '11'
    }
  },
  customData: {
    title: 'Test Execution Info',
    data: [
      { label: 'Project', value: 'Demoblaze Automation Framework' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Test Environment', value: 'QA' },
      { label: 'Execution Date', value: new Date().toLocaleString() }
    ]
  }
});

console.log('HTML Report generated successfully!');
