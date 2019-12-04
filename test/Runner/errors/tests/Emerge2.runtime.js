emerge(async () => {
	await new Promise(() => {
		throw new Error()
	})
});
