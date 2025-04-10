const fs = require('fs');
const path = require('path');

async function copyWasm() {
    const sourcePath = path.resolve(__dirname, '../node_modules/essentia.js/dist/essentia-wasm.web.wasm');
    const destinationPath = path.resolve(__dirname, '../public/essentia-wasm.web.wasm');

    try {
        await fs.cp(sourcePath, destinationPath, console.error);
        console.log('WASM file copied to public directory');
    } catch (err) {
        console.error('Error copying WASM file:', err);
    }
}

copyWasm();