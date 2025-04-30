import { createClient } from 'redis';
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const REDUCERS_COUNT = 2;

const redis = createClient({ url: 'redis://redis:6379' });
await redis.connect();

function cleanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath);
    });
}

cleanDirectory('./intermediates');
cleanDirectory('./reducer_outputs');

if (fs.existsSync('final_result.txt')) {
    fs.unlinkSync('final_result.txt');
}

await redis.del('mapper_done');
await redis.del('reduce_tasks');
await redis.del('map_tasks');

for (let i = 0; i < 10; i++) {
    const chunkName = `chunk${i}.txt`;
    await redis.lPush('map_tasks', chunkName);
}
console.log('Todas as tarefas dos mappers foram enfileiradas.');

console.log('Aguardando conclusão dos mappers...');
while (true) {
    const doneCount = parseInt(await redis.sendCommand(['LLEN', 'mapper_done']));
    if (doneCount >= 10) break;
    await new Promise(res => setTimeout(res, 1000));
}
console.log("Todos os mappers concluíram.");

console.log('Executando fase de shuffle...');
execSync('node shuffle.js');

for (let i = 0; i < REDUCERS_COUNT; i++) {
    await redis.lPush('reduce_tasks', `reducer_inputs/input${i}.json`);
}

console.log('Todas as tarefas dos reducers foram enfileiradas.');

console.log('Aguardando conclusão dos reducers...');

while (true) {
    const files = fs.readdirSync('./reducer_outputs').filter(f => f.endsWith('.txt'));
    if (files.length >= REDUCERS_COUNT) break;
    await new Promise(res => setTimeout(res, 1000));
}

const output = fs.createWriteStream('final_result.txt');
for (let i = 0; i < REDUCERS_COUNT; i++) {
    const content = fs.readFileSync(`reducer_outputs/output${i}.txt`, 'utf-8');
    output.write(content + '\n');
}
output.end();

console.log('MapReduce finalizado com sucesso: final_result.txt');

await redis.quit();
