export type Dot = {
	x: number,
	y: number
};

export type RectDots = {
	[key: string]: { x: number, y: number };
}

export enum ResizeType {
	horiz, vertcl, corner
}