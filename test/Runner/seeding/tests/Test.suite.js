eve('Suite', (self) => {
	seed('First', () => {});
	seed('Second', () => { throw new Error() });
	seed('Third', () => {});

	test('Test', () => { self.a = 1 })
});