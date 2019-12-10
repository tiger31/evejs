eve('Suite', () => {
	suite('Inner Suite', () => {}, {
		epic: 'Epic',
		feature: 'Feature'
	});
	suite('Inner Suite 2', () => {}, {
		feature: 'Feature'
	});
	suite('Inner Suite 3', () => {}, {
		feature: 'Feature 2'
	});
	test('Test 1', () => {}, { story: 'Story 1' })
}, {
	epic: 'Epic'
});