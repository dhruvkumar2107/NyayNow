const fs = require('fs');
const { execSync } = require('child_process');

let out = '';
try {
  out += '--- GIT STATUS ---\n';
  out += execSync('git status').toString();
  out += '\n--- GIT PUSH ---\n';
  out += execSync('git push origin main').toString();
  out += '\n--- SUCCESS ---\n';
} catch (e) {
  out += `\nERROR: ${e.message}\n`;
  if (e.stdout) out += `STDOUT: ${e.stdout.toString()}\n`;
  if (e.stderr) out += `STDERR: ${e.stderr.toString()}\n`;
}

fs.writeFileSync('C:\\Users\\DHRUV\\Downloads\\project\\git_result_123.txt', out);
