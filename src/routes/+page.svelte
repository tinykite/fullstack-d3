<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { error } from '@sveltejs/kit';

	interface Day {
		date: string; // date in ISO format
		temperatureMax: number;
		temperatureMin: number;
	}

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
		// TODO: Fix types
		const dataset: [number, number][] | undefined = await d3.json('data/my_weather_data.json');

		if (!dataset) {
			throw error(500, 'No data found');
		}

		const parseDate = d3.timeParse('%Y-%m-%d');

		const yAccessor = (d: any): number => d.temperatureMax;
		const xAccessor = (d: any): Date => parseDate(d.date) as Date;

		if (!xAccessor) {
			throw error(500, 'No dates found');
		}

		let dimensions: ChartDimensions = {
			width: window.innerWidth * 0.9,
			height: 400,
			margin: {
				// Leave space for horizontal and vertical axis labels
				top: 15,
				right: 15,
				bottom: 40,
				left: 60
			}
		};

		dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
		dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

		// Draw SVG
		const wrapper = d3
			.select(el)
			.append('svg')
			.attr('width', dimensions.width)
			.attr('height', dimensions.height);

		// Draw chart bounds
		const bounds = wrapper.append('g').style(
			'transform',
			`translate(${dimensions.margin.left}px, 
			${dimensions.margin.top}px)`
		);

		const yScale = d3
			.scaleLinear()
			.domain(d3.extent(dataset, yAccessor) as Array<Number>)
			.range([dimensions.boundedHeight, 0]);

		const xScale = d3
			.scaleTime()
			.domain(d3.extent(dataset, xAccessor) as Array<Date>)
			.range([0, dimensions.boundedWidth]);

		const freezingTemperaturePlacement = yScale(32);
		const freezingTemperatures = bounds
			.append('rect')
			.attr('x', 0)
			.attr('width', dimensions.boundedWidth)
			.attr('y', freezingTemperaturePlacement)
			.attr('height', dimensions.boundedHeight - freezingTemperaturePlacement)
			.attr('fill', '#e0f3f3');

		const lineGenerator = d3
			.line()
			.x((d) => xScale(xAccessor(d)))
			.y((d) => yScale(yAccessor(d)));

		const line = bounds
			.append('path')
			.attr('d', lineGenerator(dataset))
			.attr('fill', 'none')
			.attr('stroke', '#af9358')
			.attr('stroke-width', 2);

		// @ts-ignore
		const yAxisGenerator = d3.axisLeft().scale(yScale);
		const yAxis = bounds.append('g').call(yAxisGenerator);

		// @ts-ignore
		const xAxisGenerator = d3.axisBottom().scale(xScale);
		const xAxis = bounds
			.append('g')
			.call(xAxisGenerator)
			.style('transform', `translateY(${dimensions.boundedHeight}px)`);
	});
</script>

<div bind:this={el} />
