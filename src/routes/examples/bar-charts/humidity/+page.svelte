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

		// 2. Create chart dimensions

		const width = 500;
		let dimensions = {
			width: width,
			height: width * 0.6,
			boundedWidth: 0,
			boundedHeight: 0,
			margin: {
				top: 80,
				right: 50,
				bottom: 50,
				left: 50
			}
		};
		dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
		dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

		const drawHistogram = (metric) => {
			const metricAccessor = (d) => d[metric];
			const yAccessor = (d) => d.length;

			// 3. Draw canvas

			const wrapper = d3
				.select(el)
				.append('svg')
				.attr('width', dimensions.width)
				.attr('height', dimensions.height)
				.attr('role', 'figure')
				.attr('tabindex', '0');

			const label = wrapper
				.append('title')
				.text('Histogram looking at the distribution of humidity in 2016');

			const bounds = wrapper
				.append('g')
				.style('transform', `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);

			// 4. Create scales

			const xScale = d3
				.scaleLinear()
				.domain(d3.extent(dataset, metricAccessor))
				.range([0, dimensions.boundedWidth])
				.nice();

			const binsGenerator = d3.bin().domain(xScale.domain()).value(metricAccessor).thresholds(8);

			const bins = binsGenerator(dataset);

			const yScale = d3
				.scaleLinear()
				.domain([0, d3.max(bins, yAccessor)])
				.range([dimensions.boundedHeight, 0])
				.nice();

			// 5. Draw data

			const binsGroup = bounds
				.append('g')
				.attr('tabindex', '0')
				.attr('role', 'list')
				.attr('aria-label', 'histogram bars');

			const binGroups = binsGroup
				.selectAll('g')
				.data(bins)
				.enter()
				.append('g')
				.attr('tabindex', '0')
				.attr('role', 'listitem')
				.attr(
					'aria-label',
					(d) =>
						`There were ${yAccessor(d)} days between ${d.x0.toString().slice(0, 4)} and ${d.x1
							.toString()
							.slice(0, 4)} humidity levels.`
				);

			const barPadding = 1;
			const barRects = binGroups
				.append('rect')
				.attr('x', (d) => xScale(d.x0) + barPadding / 2)
				.attr('y', (d) => yScale(yAccessor(d)))
				.attr('width', (d) => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
				.attr('height', (d) => dimensions.boundedHeight - yScale(yAccessor(d)))
				.attr('fill', 'cornflowerblue');

			const barText = binGroups
				.filter(yAccessor)
				.append('text')
				.attr('x', (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
				.attr('y', (d) => yScale(yAccessor(d)) - 5)
				.text(yAccessor)
				.style('text-anchor', 'middle')
				.attr('fill', 'darkgrey')
				.style('font-size', '12px')
				.style('font-family', 'sans-serif');

			const mean = d3.mean(dataset, metricAccessor);
			const meanLine = bounds
				.append('line')
				.attr('x1', xScale(mean))
				.attr('x2', xScale(mean))
				.attr('y1', -15)
				.attr('y2', dimensions.boundedHeight)
				.attr('stroke', 'maroon')
				.attr('stroke-dasharray', '2px 4px');

			const meanLabel = bounds
				.append('text')
				.attr('x', xScale(mean))
				.attr('y', -20)
				.text('mean')
				.attr('fill', 'maroon')
				.style('font-size', '12px')
				.style('text-anchor', 'middle');

			// 6. Draw peripherals

			const xAxisGenerator = d3.axisBottom().scale(xScale);

			const xAxis = bounds
				.append('g')
				.call(xAxisGenerator)
				.style('transform', `translateY(${dimensions.boundedHeight}px)`);

			const xAxisLabel = xAxis
				.append('text')
				.attr('x', dimensions.boundedWidth / 2)
				.attr('y', dimensions.margin.bottom - 10)
				.attr('fill', 'black')
				.style('font-size', '1.4em')
				.text(metric);
		};

		const metrics = [
			'windSpeed',
			'moonPhase',
			'dewPoint',
			'humidity',
			'uvIndex',
			'windBearing',
			'temperatureMin',
			'temperatureMax',
			'visibility',
			'cloudCover'
		];

		drawHistogram('humidity');

		// metrics.forEach(drawHistogram);
	});
</script>

<div bind:this={el} />

<style>
	/* Import and use the Inter font https://rsms.me/inter/ */
	@import url('https://rsms.me/inter/inter.css');
	html {
		font-family: 'Inter', sans-serif;
	}

	body {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2em;
		letter-spacing: -0.011em;
		font-family: 'Inter var', sans-serif;
		font-size: 16px;
		color: #34495e;
		background: #f8f9fa;
	}

	svg {
		fill: #34495e;
	}
</style>
