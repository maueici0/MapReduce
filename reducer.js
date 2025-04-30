import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';

const redis = createClient({ url: 'redis://redis:6379' });
await redis.connect();

while (true) {
    const task = await redis.brPop('reduce_tasks', 0);
    const inputFile = task.element;
    const index = inputFile.match(/\d+/)[0];

    console.log(`Reducer ${index} processando ${inputFile}...`);
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    const resultLines = [];

    for (const [word, values] of Object.entries(data)) {
        const sum = values.reduce((a, b) => a + b, 0);
        resultLines.push(`${word}: ${sum}`);
    }

    fs.writeFileSync(`reducer_outputs/output${index}.txt`, resultLines.join('\n'));
    console.log(`Reducer ${index} finalizou.`);
}
