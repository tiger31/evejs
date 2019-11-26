mi('Suite', () => {
	suite('Inner Suite', () => {
		test('Test 1', () => {}, { story: "Story" });
		test('Test 1', () => {}, { story: "Story 2" });
	}, {
		feature: 'Feature'
	});
	suite('Inner Suite 2', () => {
		test('Test 1', () => {}, { story: "Story" });
	}, {
		feature: 'Feature 2'
	});
	suite('Inner Suite 3', () => {
		test('Test 1', () => {}, { story: "Story 3" });
		test('Test 1', () => {}, { story: "Story 3" });
	}, {
		story: 'Story 3',
		feature: 'Feature 3'
	});
	test('Test 1', () => {}, { story: "Story" });

}, {
	epic: 'Epic'
});