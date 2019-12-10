eve("Suite", () => {
	seed("Seed", async () => {
		await new Promise(() => {
			throw new Error();
		})
	});
}, { mode: Suite.mode.INTERRUPT_RUN });
