const { minify } = require('terser');
const fs = require('fs').promises;

async function minifyFile() {
  try {
    const sourceCode = await fs.readFile('worth_calc_4.js', 'utf8');
    
    const config = JSON.parse(await fs.readFile('terser.config.json', 'utf8'));
    
    const result = await minify(sourceCode, config);
    
    if (result.error) {
      throw result.error;
    }
    
    const outputFile = 'worth_calc.min.js';
    
    await fs.writeFile(outputFile, result.code);
    
    console.log(`Successfully minified to ${outputFile}`);
    console.log(`Original size: ${sourceCode.length} bytes`);
    console.log(`Minified size: ${result.code.length} bytes`);
    console.log(`Reduction: ${Math.round((1 - result.code.length / sourceCode.length) * 100)}%`);
  } catch (error) {
    console.error('Error during minification:', error);
  }
}

minifyFile(); 