const fs = require('fs');
const html = fs.readFileSync('c:/Users/BIMA NUGRAHA/Downloads/legacylearn/legacylearn_dashboard_complete.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  fs.writeFileSync('c:/Users/BIMA NUGRAHA/Downloads/legacylearn/script_test.js', scriptMatch[1], 'utf8');
  console.log('Extracted to script_test.js');
} else {
  console.log('No script found');
}
