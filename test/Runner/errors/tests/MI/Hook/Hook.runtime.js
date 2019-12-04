mi("Suite", () => {
	seed("Seed", () => {});
	beforeSeed(() => { throw new Error(); });
})
