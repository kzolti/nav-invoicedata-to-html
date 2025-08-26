const fs = require("fs");
const path = require("path");
const { toHtml } = require("./toHtml");

const dirPath = path.join(__dirname, "..", "Peldaszamlak_v3.0");
const outputDir = path.join(__dirname, "..", "output");
const files = fs.readdirSync(dirPath);
const lang = "cn";

const xmlFiles = files.filter((file) => file.endsWith(".xml"));
async function test() {
  for (const xmlFile of xmlFiles) {
    const xmlFileName = path.join(__dirname, "..", "Peldaszamlak_v3.0", xmlFile);
    const xml = fs.readFileSync(xmlFileName, "utf-8");
    const html = toHtml(xml, lang);
    const outPath = path.join(outputDir, path.basename(xmlFileName, ".xml") + ".html");
    fs.writeFileSync(outPath, html, {encoding:"utf-8"});
    console.log("generated pdf:", outPath);
  }
}
test();
