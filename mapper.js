import { createClient } from 'redis';
import fs from 'fs';
import readline from 'readline';
import { map } from './util.js';

const redis = createClient({ url: 'redis://redis:6379' });
await redis.connect();

while (true) {
    const task = await redis.brPop('map_tasks', 0);
    const chunkFile = task.element;

    console.log(`Processando ${chunkFile}`);
    const input = fs.createReadStream(`chunks/${chunkFile}`);
    const rl = readline.createInterface({ input, crlfDelay: Infinity });

    const wordCounts = {};

    for await (const line of rl) {
        const pairs = map(line);
        for (const [word, count] of pairs) {
            wordCounts[word] = (wordCounts[word] || 0) + count;
        }
    }

    const mapperId = chunkFile.replace('.txt', '');
    fs.writeFileSync(`intermediates/${mapperId}.json`, JSON.stringify(wordCounts, null, 2));

    await redis.rPush("mapper_done", "done");
    console.log(`Mapper finalizou ${chunkFile}`);
}
