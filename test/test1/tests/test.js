MISuite(() => {
	main(() => {
		it ("OK2", () => {});
		it ("OK", async () => {
			allure.epic('LUL');
			await expect(axios.get('https://google.com')).to.not.be.rejected	
		})
	})
})
