import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import fs from 'fs';
import path from 'path';
// const require = createRequire(import.meta.url);

async function main() {
    const componentPath = path.resolve(__dirname, 'components/Test.svelte');
    const source = fs.readFileSync(componentPath, 'utf-8');

    const compiled = compile(source, {
        generate: 'server',
        filename: 'Test.svelte'
    });

    console.log(compiled.js.code);

    // Execute the compiled code to get the component
    // In a real app we might want to write to disk or use a vm, but for now let's try eval (carefully) or writing to a temp file.
    // Writing to temp file is safer and easier for require.

    const tempJsPath = path.resolve(__dirname, 'components/Test.js');
    fs.writeFileSync(tempJsPath, compiled.js.code);

    try {
        const Component = require(tempJsPath).default;
        console.log('Component exports:', Object.keys(require(tempJsPath)));
        const result = render(Component, { props: { name: 'Svelte' } });
        console.log('Rendered HTML:', result.html);
    } catch (err) {
        console.error('Error rendering:', err);
    } finally {
        // Cleanup
        // if (fs.existsSync(tempJsPath)) fs.unlinkSync(tempJsPath);
    }
}

main();
