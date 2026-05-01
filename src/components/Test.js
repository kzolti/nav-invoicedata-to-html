import * as $ from 'svelte/internal/server';

export default function Test($$renderer, $$props) {
	let name = $.fallback($$props['name'], 'World');

	$$renderer.push(`<h1>Hello ${$.escape(name)}!</h1>`);
	$.bind_props($$props, { name });
}