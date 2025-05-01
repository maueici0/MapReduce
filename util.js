export function map(text) {
  const cleanedText = text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9,?"\s]/g, '')
    .replace(/["]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleanedText.split(/\s|,/).filter(Boolean);

  return words.map(word => [word, 1]);
}
