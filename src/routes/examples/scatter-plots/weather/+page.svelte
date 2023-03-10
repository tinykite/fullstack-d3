<script lang="ts">
	import * as d3 from 'd3';
	import type { NumberValue } from 'd3';
	import { error } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import type { Dimensions } from '../../../../utils/types';
	let el: HTMLElement;

	interface WeatherData {
		dewPoint: NumberValue;
		humidity: NumberValue;
	}

	onMount(async () => {
		const dataset = (await d3.json('../../data/my_weather_data.json')) as WeatherData[];
		if (!dataset) {
			throw error(400, 'No data found');
		}

		const xAccessor = (d: WeatherData) => d.dewPoint;
		const yAccessor = (d: WeatherData) => d.humidity;

		const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);

		if (!width) {
			throw error(400, 'No width found');
		}

		const dimensions: Dimensions = {
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
			throw new Error('No dimensions found');
		}

		dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
		dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;

		const wrapper = d3
			.select(el)
			.append('svg')
			.attr('width', dimensions.width)
			.attr('height', dimensions.height);

		const bounds = wrapper
			.append('g')
			.style('transform', `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);

		const xScale = d3
			.scaleLinear()
			.domain(d3.extent(dataset, xAccessor) as Iterable<NumberValue>)
			.range([0, dimensions.boundedWidth])
			.nice();

		const yScale = d3
			.scaleLinear()
			.domain(d3.extent(dataset, yAccessor) as Iterable<NumberValue>)
			.range([dimensions.boundedHeight, 0])
			.nice();

		const dots = bounds
			.selectAll('circle')
			.data(dataset)
			.join('circle')
			.attr('cx', (d) => xScale(xAccessor(d)))
			.attr('cy', (d) => yScale(yAccessor(d)))
			.attr('r', 4)
			.style('fill', 'cornflowerblue');

		const xAxisGenerator = d3.axisBottom(xScale);

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
			.html('Dew point (&deg;F)');

		const yAxisGenerator = d3.axisLeft(yScale).ticks(4);

		const yAxis = bounds.append('g').call(yAxisGenerator);

		const yAxisLabel = yAxis
			.append('text')
			.attr('x', -dimensions.boundedHeight / 2)
			.attr('y', -dimensions.margin.left + 10)
			.attr('fill', 'black')
			.style('font-size', '1.4em')
			.text('Relative humidity')
			.style('transform', 'rotate(-90deg)')
			.style('text-anchor', 'middle');
	});
</script>

<div class="el" bind:this={el} />
