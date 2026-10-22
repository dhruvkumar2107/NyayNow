const fs = require('fs');
try {
    fs.writeFileSync('simple_success.txt', 'It worked from server dir');
} catch (e) {
    // ignore
}
console.log("Done");
