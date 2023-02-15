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
		const dataset: [number, number][] | undefined = await d3.json(
			'../../data/my_weather_data.json'
		);

		if (!dataset) {
			throw error(500, 'No data found');
		}

		// Function that returns a date object based on an ISO date string
		const parseDate = d3.timeParse('%Y-%m-%d');

		// Functions that return the relevant values for the x and y axis of a chart from an individual record
		const yAccessor = (d: any): number => d.temperatureMax;
		const xAccessor = (d: any): Date => parseDate(d.date) as Date;

		if (!xAccessor) {
			throw error(500, 'No dates found');
		}

		// These are the total dimensions of the chart, including margins for axis labels
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

		// These are the dimensions of the chart bounds, which is the area inside the margins
		dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
		dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

		// This is the parent svg element that will contain the chart
		const wrapper = d3
			.select(el)
			.append('svg')
			.attr('width', dimensions.width)
			.attr('height', dimensions.height);

		// This is the parent g element that will contain the chart bounds
		// The chart bounds contain everything that isn't an axis label
		const bounds = wrapper.append('g').style(
			'transform',
			`translate(${dimensions.margin.left}px, 
			${dimensions.margin.top}px)`
		);

		// This one of two functions that can be passed a raw value from a dataset and calculate the pixel value needed for the chart
		const yScale = d3
			.scaleLinear()
			.domain(d3.extent(dataset, yAccessor) as Array<Number>)
			.range([dimensions.boundedHeight, 0]);

		const xScale = d3
			.scaleTime()
			.domain(d3.extent(dataset, xAccessor) as Array<Date>)
			.range([0, dimensions.boundedWidth]);

		// Water freezes at 32 degrees F
		// Based on that information, we need to figure out where on the chart the freezing temperature should be marked
		const freezingTemperaturePlacement = yScale(32);

		// Draw a rectangle that covers the area below the freezing temperature point
		const freezingTemperatures = bounds
			.append('rect')
			.attr('x', 0)
			.attr('width', dimensions.boundedWidth)
			.attr('y', freezingTemperaturePlacement)
			.attr('height', dimensions.boundedHeight - freezingTemperaturePlacement)
			.attr('fill', '#e0f3f3');

		// Line generator is a function that can be called with an array of data points
		// It will return path data that can be used to draw a line
		const lineGenerator = d3
			.line()
			.x((d) => xScale(xAccessor(d)))
			.y((d) => yScale(yAccessor(d)));

		// Here were draw a line with the path data that the lineGenerator function provides
		const line = bounds
			.append('path')
			.attr('d', lineGenerator(dataset))
			.attr('fill', 'none')
			.attr('stroke', '#af9358')
			.attr('stroke-width', 2);

		// @ts-ignore
		// Drawing the y-axis
		const yAxisGenerator = d3.axisLeft().scale(yScale);
		const yAxis = bounds.append('g').call(yAxisGenerator);

		// @ts-ignore
		// Drawing the x-axis
		const xAxisGenerator = d3.axisBottom().scale(xScale);
		const xAxis = bounds
			.append('g')
			.call(xAxisGenerator)
			.style('transform', `translateY(${dimensions.boundedHeight}px)`);
	});
</script>

<div bind:this={el} />
