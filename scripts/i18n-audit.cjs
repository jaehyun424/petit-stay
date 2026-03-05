const en = require("../src/locales/en.json");
const ko = require("../src/locales/ko.json");
const ja = require("../src/locales/ja.json");
const zh = require("../src/locales/zh.json");

function flattenKeys(obj, prefix) {
  prefix = prefix || "";
  let keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? prefix + "." + key : key;
    if (typeof obj[key] === "object" && obj[key] != null) {
      keys = keys.concat(flattenKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = new Set(flattenKeys(en));
const koKeys = new Set(flattenKeys(ko));
const jaKeys = new Set(flattenKeys(ja));
const zhKeys = new Set(flattenKeys(zh));

const allKeys = new Set([...enKeys, ...koKeys, ...jaKeys, ...zhKeys]);

let missing = { en: [], ko: [], ja: [], zh: [] };
for (const key of allKeys) {
  if (!enKeys.has(key)) missing.en.push(key);
  if (!koKeys.has(key)) missing.ko.push(key);
  if (!jaKeys.has(key)) missing.ja.push(key);
  if (!zhKeys.has(key)) missing.zh.push(key);
}

console.log("Total unique keys:", allKeys.size);
console.log("EN keys:", enKeys.size, "| Missing:", missing.en.length);
console.log("KO keys:", koKeys.size, "| Missing:", missing.ko.length);
console.log("JA keys:", jaKeys.size, "| Missing:", missing.ja.length);
console.log("ZH keys:", zhKeys.size, "| Missing:", missing.zh.length);

if (missing.en.length) console.log("\nMissing in EN:", JSON.stringify(missing.en, null, 2));
if (missing.ko.length) console.log("\nMissing in KO:", JSON.stringify(missing.ko, null, 2));
if (missing.ja.length) console.log("\nMissing in JA:", JSON.stringify(missing.ja, null, 2));
if (missing.zh.length) console.log("\nMissing in ZH:", JSON.stringify(missing.zh, null, 2));
