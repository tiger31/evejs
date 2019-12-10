eve('Suite', () => {
	suite('Inner Suite', () => {
		test('Test 2', () => {

		}, {
			feature: 'Feature',
			story: 'Story 2'
		})
	}, {
		epic: 'Epic 2',
		feature: 'Feature'
	});
	test('Test 1', () => {

	}, { story: 'Story 1' })
}, {
	epic: 'Epic'
});