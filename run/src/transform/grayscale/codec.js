function grayscale(image) {
	const { data, width, height } = image
	const filtered = new Uint8ClampedArray(data)

	for (let i = 0; i < data.length; i += 4) {
		filtered[i] = data[i + 1] = data[i + 2] = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11
	}

	return { data: filtered, width, height }
}

export { grayscale }
