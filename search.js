const fs = require('fs');
const readline = require('readline');

async function searchTranscript() {
    const fileStream = fs.createReadStream('C:\\Users\\niaza\\.gemini\\antigravity-ide\\brain\\9ce7e370-5767-40d9-85df-23e868de2d46\\.system_generated\\logs\\transcript.jsonl');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if (line.includes('app/globals.css') && line.includes('replace_file_content')) {
            console.log('Found replace_file_content for globals.css');
        }
        if (line.includes('globals.css') && line.includes('view_file')) {
            console.log('Found view_file for globals.css');
        }
        if (line.includes('TopSellingProducts.tsx') && line.includes('view_file')) {
            console.log('Found view_file for TopSellingProducts.tsx');
        }
        if (line.includes('button.tsx') && line.includes('view_file')) {
            console.log('Found view_file for button.tsx');
        }
    }
}

searchTranscript();
