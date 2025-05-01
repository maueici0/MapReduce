import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const REDUCERS_COUNT = 2;
const intermediateDir = 'intermediates';
const outputDir = 'reducer_inputs';

function getReducerIndex(word) {
    const hash = crypto.createHash('md5').update(word).digest('hex');
    return parseInt(hash.slice(0, 8), 16) % REDUCERS_COUNT;
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const reducerGroups = Array.from({ length: REDUCERS_COUNT }, () => ({}));

const files = fs.readdirSync(intermediateDir).filter(f => f.endsWith('.json'));

for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(intermediateDir, file), 'utf-8'));
    for (const [word, count] of Object.entries(content)) {
        const index = getReducerIndex(word);
        if (!Array.isArray(reducerGroups[index][word])) {
            reducerGroups[index][word] = [];
        }
        reducerGroups[index][word].push(count);

    }
}

reducerGroups.forEach((group, index) => {
    fs.writeFileSync(
        `${outputDir}/input${index}.json`,
        JSON.stringify(group, null, 2)
    );
});

console.log('Shuffle concluído.');
