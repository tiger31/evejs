eve('Suite', () => {
	scope('default', () => {
		seed('Seed1', (context) => {
			context.a = 1;
		})
	});
	scope('test', () => {
		seed('Seed2', (context) => {
			context.b = 1;
		})
	});
});