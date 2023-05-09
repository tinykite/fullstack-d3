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

		const yScale = d3
			.scaleLinear()
			.domain([0, d3.max(bins, yAccessor)])
			.range([dimensions.boundedHeight, 0])
			.nice();

		const binsGroup = bounds.append('g');

		const binGroups = binsGroup.selectAll().data(bins).join('g');

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

		const mean = d3.mean(dataset, xAccessor) as Number;

		const meanLine = bounds
			.append('line')
			.attr('x1', xScale(mean))
			.attr('x2', xScale(mean))
			.attr('y1', -15)
			.attr('y2', dimensions.boundedHeight)
			.attr('stroke', 'maroon')
			.attr('stroke-dasharray', '2px 4px');

		const meanLineLabel = bounds
			.append('text')
			.text('mean')
			.attr('x', xScale(mean))
			.attr('y', 50)
			.attr('text-anchor', 'middle')
			.attr('fill', 'blue')
			.attr('text-size', '12px');

		const axisGenerator = d3.axisBottom().scale(xScale);

		const xAxis = bounds
			.append('g')
			.call(axisGenerator)
			.style('transform', `translateY(${dimensions.boundedHeight}px)`);

		const xAxisLabel = xAxis
			.append('text')
			.attr('x', dimensions.boundedWidth / 2)
			.attr('y', dimensions.margin.bottom - 10)
			.attr('fill', 'black')
			.style('font-size', '1.4em')
			.text('Humidity');
	});
</script>

<div bind:this={el} />
