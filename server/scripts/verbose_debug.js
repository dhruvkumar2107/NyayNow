const fs = require('fs');
const path = require('path');

console.log('DEBUG: Starting...');
try {
    const target = path.resolve(__dirname, '../debug_output.txt');
    console.log('DEBUG: Writing to', target);
    fs.writeFileSync(target, 'Hello World');
    console.log('DEBUG: Wrote file');
} catch (e) {
    console.error('DEBUG: Error', e);
    process.exit(1);
}
console.log('DEBUG: Done');
process.exit(0);
