eve('Suite', () => {
	seed("Seed", async (self) => {
		await new Promise((resolve, reject) => {
			setTimeout(() => {
				self.values = ['A', 'B', 'C'];
				resolve();
			}, 500);
		});
	});
	suite('Test suite', (context) => {
		for(let value of context.values)
			test(`Test ${value}`, () => { context[value] = value; });
	})
});