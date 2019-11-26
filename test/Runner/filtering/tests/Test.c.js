mi('Suite', () => {
	suite('Inner Suite', () => {
		test('Test 2', () => {

		}, {
			feature: 'Feature',
			story: 'Story 2'
		});
		test('Test 3', () => {

		}, {
			feature: 'Feature',
			story: 'Story 3'
		})
	}, {
		epic: 'Epic',
		feature: 'Feature'
	});
	test('Test 1', () => {

	}, { story: 'Story 1' })
}, {
	epic: 'Epic'
});