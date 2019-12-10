eve("Suite", () => {
	seed("Seed", () => {
		throw new Error();
	});
}, { mode: Suite.mode.INTERRUPT_RUN });
