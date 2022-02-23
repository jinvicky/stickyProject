export type Dot = {
	x: number,
	y: number
};

export type LineDir = {
	p1: string,
	p2: string,
};

export type iObj = {
	[key: string]: { x: number, y: number };
}

export type test = [
	{
		L1: { p1: string, p2: string },
		L2: { p1: string, p2: string },

	}
];