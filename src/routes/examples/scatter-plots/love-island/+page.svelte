<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { error } from '@sveltejs/kit';
	import type { NumberValue } from 'd3';

	interface LoveIslandRecord {
		'Times got Pied': number;
		'Number of Couples': number;
	}

	let el: HTMLElement;

	onMount(async () => {
		const dataset: LoveIslandRecord[] | undefined = await d3.json(
			'../../data/amynic-love-island.json'
		);

		if (!dataset) {
			error(404, 'Data not found');
		}

		const filteredData = dataset?.filter((d) => d['Times got Pied'] !== 0);

		if (!filteredData) {
			error(404, 'No data found');
		}

		const xAccessor = (d: any) => d['Times got Pied'] as number;
		const yAccessor = (d: any) => d['Number of Couples'] as number;
		const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);

		if (!width) {
			error(400, 'Could not calculate width');
		}

		const dimensions = {
			width: width,
			height: width,
			margin: {
				top: 10,
				right: 10,
				bottom: 50,
				left: 50
			},
			boundedWidth: 0,
			boundedHeight: 0
		};

		if (!dimensions.width || !dimensions.height) {
			throw error(400, 'No dimensions found');
		}

		dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
		dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

		const wrapper = d3
			.select(el)
			.append('svg')
			.attr('width', dimensions.width)
			.attr('height', dimensions.height);

		const bounds = wrapper
			.append('g')
			.attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)
			.attr('fill', 'cornflowerblue');

		const xScale = d3
			.scaleLinear()
			.domain(d3.extent(filteredData, xAccessor) as Iterable<NumberValue>)
			.range([0, dimensions.boundedWidth])
			.nice();

		const yScale = d3
			.scaleLinear()
			.domain(d3.extent(filteredData, yAccessor) as Iterable<NumberValue>)
			.range([dimensions.boundedHeight, 0])
			.nice();

		const dots = bounds
			.selectAll('circle')
			.data(filteredData)
			.join('circle')
			.attr('cx', (d) => xScale(xAccessor(d)))
			.attr('cy', (d) => yScale(yAccessor(d)))
			.attr('r', 4)
			.style('fill', 'cornflowerblue');

		const xAxisGenerator = d3.axisBottom().scale(xScale).ticks(4);

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
			.html('Times Pied');

		const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(5);

		const yAxis = bounds.append('g').call(yAxisGenerator);
		const yAxisLabel = yAxis
			.append('text')
			.attr('x', -dimensions.boundedHeight / 2)
			.attr('y', -dimensions.margin.left + 15)
			.attr('fill', 'black')
			.style('font-size', '1.4em')
			.text('Times Coupled')
			.style('transform', 'rotate(-90deg)')
			.style('text-anchor', 'middle');
	});
</script>

<div bind:this={el} />
