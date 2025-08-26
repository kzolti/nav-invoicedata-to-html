import fs from "fs";
import path from "path";
import toHtml  from "./toHtml";

const dirPath = path.join(__dirname, "..", "Peldaszamlak_v3.0");
const outputDir = path.join(__dirname, "..", "output");
const files = fs.readdirSync(dirPath);
const lang = "cn";

const xmlFiles = files.filter((file: string) => file.endsWith(".xml"));

async function test(): Promise<void> {
  for (const xmlFile of xmlFiles) {
    const xmlFileName = path.join(__dirname, "..", "Peldaszamlak_v3.0", xmlFile);
    const xml = fs.readFileSync(xmlFileName, "utf-8");
    const html = toHtml(xml, lang);
    const outPath = path.join(outputDir, path.basename(xmlFileName, ".xml") + ".html");
    fs.writeFileSync(outPath, html, { encoding: "utf-8" });
    console.log("generated pdf:", outPath);
  }
}

test().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});