import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			$components: 'src/components',
			$utils: 'src/utils',
			$consts: 'src/constants'
		}
	}
	// vite: {
	// 	resolve: {
	// 		alias: {
	// 			// these are the aliases and paths to them
	// 			'@components': path.resolve('./src/lib/components'),
	// 			'@utils': path.resolve('./src/lib/utils'),
	// 			'@consts': path.resolve('./src/lib/utils')
	// 		}
	// 	}
	// }
};

export default config;
