eve('Suite', () => {
	suite('Seed', (context) => {
		test('Test', () => {
			context.value = [];
			scope('default', () => {
				context.value.push('default');
			});
			scope('test', () => {
				context.value.push('test');
			})
		})
	});
});