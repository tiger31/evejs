seed('Seed', (context) => {
	context.value = [];
	scope('default', () => {
		context.value.push('default');
	});
	scope('test', () => {
		context.value.push('test');
	})
});
mi('Suite', () => {});