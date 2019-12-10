seed('Seed1', (context) => {
	context.a = 1;
}, { scope: 'default' });
seed('Seed2', (context) => {
	context.b = 1;
}, { scope: 'test' });
eve('Suite', () => {});