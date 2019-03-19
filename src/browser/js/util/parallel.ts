export async function parallel(times: number, fn: (i?: number) => Promise<any>): Promise<any[]> {
	const promises = [];

	for (let i = 0; i < times; i++) {
		promises.push(fn(i));
	}

	return Promise.all(promises);
};
