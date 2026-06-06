<script lang="ts">
	import { APP_NAME, APP_DESCRIPTION } from '$lib/constants';

	interface Breadcrumb {
		name: string;
		url: string;
	}

	interface Props {
		type: 'WebSite' | 'Article' | 'BreadcrumbList';
		url: string;
		// WebSite
		name?: string;
		description?: string;
		// Article
		headline?: string;
		author?: { name: string; url?: string };
		datePublished?: string;
		dateModified?: string;
		image?: string;
		// Breadcrumb
		breadcrumbs?: Breadcrumb[];
	}

	let props: Props = $props();

	let jsonLd = $derived.by(() => {
		const base = props.url.replace(/\/$/, '');

		switch (props.type) {
			case 'WebSite': {
				return JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'WebSite',
					name: props.name ?? APP_NAME,
					url: base,
					description: props.description ?? APP_DESCRIPTION,
					potentialAction: {
						'@type': 'SearchAction',
						target: {
							'@type': 'EntryPoint',
							urlTemplate: `${base}/search?q={search_term_string}`
						},
						'query-input': 'required name=search_term_string'
					}
				});
			}

			case 'Article': {
				const article: Record<string, unknown> = {
					'@context': 'https://schema.org',
					'@type': 'Article',
					headline: props.headline ?? '',
					url: base,
					publisher: {
						'@type': 'Organization',
						name: APP_NAME,
						url: base
					}
				};

				if (props.author?.name) {
					article.author = {
						'@type': 'Person',
						name: props.author.name
					};
					if (props.author.url) {
						(article.author as Record<string, unknown>).url = props.author.url;
					}
				}

				if (props.datePublished) {
					article.datePublished = props.datePublished;
				}
				if (props.dateModified) {
					article.dateModified = props.dateModified;
				}
				if (props.image) {
					article.image = props.image.startsWith('http') ? props.image : `${base}${props.image}`;
				}

				return JSON.stringify(article);
			}

			case 'BreadcrumbList': {
				const items = (props.breadcrumbs ?? []).map((crumb, i) => ({
					'@type': 'ListItem' as const,
					position: i + 1,
					name: crumb.name,
					item: crumb.url.startsWith('http') ? crumb.url : `${base}${crumb.url}`
				}));

				return JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'BreadcrumbList',
					itemListElement: items
				});
			}

			default:
				return '{}';
		}
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>
