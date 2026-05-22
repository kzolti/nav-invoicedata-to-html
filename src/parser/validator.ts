import { XmlDocument, XsdValidator } from 'libxml2-wasm';
// @ts-ignore: Típusdefiníció miatt szükséges lehet ignore
import { xmlRegisterFsInputProviders } from 'libxml2-wasm/lib/nodejs.mjs';
import path from 'path';
import fs from 'fs';

// Regisztráljuk a fájlrendszer elérhetőségét, hogy az XSD importokat (pl. common.xsd) fel tudja oldani a libxml2
xmlRegisterFsInputProviders();

export async function validateXml(xmlData: string, xsdPath: string): Promise<boolean> {
    if (!fs.existsSync(xsdPath)) {
        throw new Error(`XSD file not found: ${xsdPath}`);
    }

    let xmlDoc: XmlDocument | null = null;
    let xsdDoc: XmlDocument | null = null;
    let validator: XsdValidator | null = null;

    try {
        const xsdContent = fs.readFileSync(xsdPath, 'utf8');
        
        // Fontos: a url paraméter megadása elengedhetetlen ahhoz, hogy a relatív importok (<import namespace="...">) működjenek
        // Linuxon az abszolút útvonalhoz file:/// (3 perjel) kell
        const absoluteXsdPath = path.resolve(xsdPath).replace(/\\/g, '/');
        const xsdUrl = absoluteXsdPath.startsWith('/') ? `file://${absoluteXsdPath}` : `file:///${absoluteXsdPath}`;
        
        xsdDoc = XmlDocument.fromString(xsdContent, { url: xsdUrl });
        validator = XsdValidator.fromDoc(xsdDoc);
        
        xmlDoc = XmlDocument.fromString(xmlData);
        
        validator.validate(xmlDoc);
        return true;
    } catch (err) {
        console.error('XSD Validation failed:', err);
        return false;
    } finally {
        if (xmlDoc) xmlDoc.dispose();
        if (validator) validator.dispose();
        if (xsdDoc) xsdDoc.dispose();
    }
}
