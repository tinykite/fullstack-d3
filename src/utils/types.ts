export interface DataRecord {
	[key: string]: number | string;
}

export interface Dimensions {
	height: number;
	width: number;
	margin: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
	boundedWidth: number;
	boundedHeight: number;
}
