// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://docs.pelindungbumi.dev',
	integrations: [
		starlight({
			title: 'Pelindung Bumi',
			description: 'Documentation for Pelindung Bumi.',
			logo: {
				src: './src/assets/logo.jpeg',
			},
			favicon: '/logo.jpeg',
			customCss: ['./src/styles/custom.css'],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/pelindung-bumi/peta' },
			],
			sidebar: [
				{
					label: 'Docs',
					items: [
						{ label: 'Getting Started', slug: 'guides/getting-started' },
					],
				},
				{
					label: 'Operations',
					items: [
						{ label: 'Blog Operations', slug: 'operations/blog' },
						{ label: 'Infrastructure Operations', slug: 'operations/infrastructure' },
					],
				},
				{
					label: 'Project',
					items: [
						{ label: 'Project Overview', slug: 'reference/project-overview' },
						{ label: 'Repositories', slug: 'reference/repositories' },
					],
				},
			],
		}),
	],
});
