import { SvelteCompiler } from './generator/compiler.js';

const compiler = new SvelteCompiler();
console.log('Compiling Svelte components...');
compiler.compileAll();
console.log('Done.');
