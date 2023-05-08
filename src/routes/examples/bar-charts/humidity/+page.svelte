<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { error } from '@sveltejs/kit';

	interface ChartDimensions {
		width: number;
		height: number;
		margin: {
			top: number;
			right: number;
			bottom: number;
			left: number;
		};
		boundedWidth?: number;
		boundedHeight?: number;
	}

	let el: HTMLElement;

	onMount(async () => {
		const dataset: [number, number][] | undefined = await d3.json(
			'../../data/my_weather_data.json'
		);

		if (!dataset) {
			throw error(500, 'No data found');
		}

		const xAccessor = (d) => d.humidity;
		const yAccessor = (d) => d.length;

		const width = 600;
		const dimensions = {
			width,
			height: width * 0.6,
			boundedWidth: 0,
			boundedHeight: 0,
			margin: {
				top: 30,
				right: 10,
				bottom: 50,
				left: 50
			}
		};

		dimensions.boundedWidth = dimensions.width - dimensions.margin.right - dimensions.margin.left;
		dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

		const wrapper = d3
			.select(el)
			.append('svg')
			.attr('width', dimensions.width)
			.attr('height', dimensions.height);

		const bounds = wrapper
			.append('g')
			.style('transform', `translate(${dimensions.margin.left}px ${dimensions.margin.top}px)`);

		const xScale = d3
			.scaleLinear()
			// @ts-ignore
			.domain(d3.extent(dataset, xAccessor))
			.range([0, dimensions.boundedWidth])
			.nice();

		// @ts-ignore
		const binsGenerator = d3.bin().domain(xScale.domain()).value(xAccessor).thresholds(12);
		// @ts-ignore
		const bins = binsGenerator(dataset);

		console.log(bins);
	});
</script>

<div bind:this={el} />
