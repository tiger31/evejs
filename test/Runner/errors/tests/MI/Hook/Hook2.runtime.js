eve("Suite", () => {
	seed("Seed", () => {});
	beforeSeed(async () => {
		await new Promise(() => {
			throw new Error();
		})
	});
})
