import { DecodedImage } from '../utils.js'

function blurX(data, width, height, blurRange, guassParam) {
	const newdata = new Uint8ClampedArray(data)

	let ox, gauss, count, R, G, B, A

	for (let i = 0, len = width * height; i < len; ++i) {
		gauss = count = R = G = B = A = 0

		ox = i % width

		for (let x = -1 * blurRange; x <= blurRange; ++x) {
			const tx = ox + x;

			if ((0 <= tx) && (tx < width)) {
				gauss = guassParam[x < 0 ? -x : x] // Math.abs(x)

				const k = i + x

				R += data[k * 4 + 0] * gauss
				G += data[k * 4 + 1] * gauss
				B += data[k * 4 + 2] * gauss
				A += data[k * 4 + 3] * gauss

				count += gauss
			}
		}

		newdata[i * 4 + 0] = (R / count) | 0
		newdata[i * 4 + 1] = (G / count) | 0
		newdata[i * 4 + 2] = (B / count) | 0
		newdata[i * 4 + 3] = (A / count) | 0
	}

	return newdata
}

function switchXY(data, width, height, isClockwise) {
	const newdata = new Uint8ClampedArray(data)

	for (let i = 0, len = width * height; i < len; ++i) {
		const k = (i % width) * height + ((i / width) | 0)
		const [a, b] = isClockwise ? [k, i] : [i, k]

		newdata[a * 4]     = data[b * 4]
		newdata[a * 4 + 1] = data[b * 4 + 1]
		newdata[a * 4 + 2] = data[b * 4 + 2]
		newdata[a * 4 + 3] = data[b * 4 + 3]
	}

	return newdata
}

function blur(image, options) {
	const { radius } = Object(options)

	/** Gaussian distribution σ. */
	const blurRange = Number(radius * 3) || 0

	/** Gaussian distribution coefficient. */
	const guassParam = new Array()

	// creaet gaussian distribution
	for (let i = 0; i <= blurRange; ++i) {
		guassParam[i] = Math.exp(-i * i / (2 * radius * radius))
	}

	const { data, width, height } = image

	// blur y
	const dataToYX = switchXY(data, width, height, true)
	const blur1of2 = blurX(dataToYX, width, height, blurRange, guassParam)

	// blur x
	const dataToXY = switchXY(blur1of2, width, height, false)
	const blur2of2 = blurX(dataToXY, width, height, blurRange, guassParam)

	return new DecodedImage(blur2of2, width, height)
}

export { blur }
