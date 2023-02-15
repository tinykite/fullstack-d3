<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { error } from '@sveltejs/kit';
	import type { DSVRowArray } from 'd3';

	let el: HTMLElement;

	onMount(async () => {
		// TODO: Fix types
		const unfilteredData: DSVRowArray<string> = await d3.csv(
			'../../data/historical_lighthouses.csv'
		);
		const filteredData = unfilteredData.filter((d) => d.YearBuilt !== '0');
		const sortedData = d3
			.groups(filteredData, (d) => d.YearBuilt)
			.sort((a, b) => d3.ascending(a[0], b[0]));

		if (sortedData.length) {
			error(404, 'No data found');
		}

		const xAccessor = (d: string) => Date.parse(d[0]);
		const yAccessor = (d: string) => d[1].length;

		const dimensions = {
			width: window.innerWidth * 0.9,
			height: 400,
			margin: {
				top: 15,
				right: 15,
				bottom: 40,
				left: 60
			}
		};

		const boundedDimensions = {
			width: dimensions.width - dimensions.margin.left - dimensions.margin.right,
			height: dimensions.height - dimensions.margin.top - dimensions.margin.bottom
		};

		const wrapper = d3
			.select(el)
			.append('svg')
			.attr('width', dimensions.width)
			.attr('height', dimensions.height);

		const bounds = wrapper.append('g').style(
			'transform',
			`translate(${dimensions.margin.left}px,
			${dimensions.margin.top}px)`
		);

		const yScale = d3
			.scaleLinear()
			// @ts-ignore
			.domain(d3.extent(sortedData, yAccessor))
			.range([boundedDimensions.height, 0]);

		const xScale = d3
			.scaleTime()
			// @ts-ignore
			.domain(d3.extent(sortedData, xAccessor))
			.range([0, boundedDimensions.width]);

		const lineGenerator = d3
			.line()
			.x((d) => xScale(xAccessor(d)))
			.y((d) => yScale(yAccessor(d)));

		const line = bounds
			.append('path')
			// @ts-ignore
			.attr('d', lineGenerator(sortedData))
			.attr('fill', 'none')
			.attr('stroke', 'green')
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
			.style('transform', `translateY(${boundedDimensions.height}px)`);
	});
</script>

<div bind:this={el} />

<style></style>
