export type Dot = {
	x: number,
	y: number
};

export type Line = {
	[point: string]: {
		x: number,
		y: number,
	}
};

export type LineDir = {
	p1: string,
	p2: string,
};