/** @type {{ (...bytes: number[]): (data: ArrayBufferLike) => boolean }} */ 
const createTest = (...bytes) => (data) => bytes.every(
	(byte, index) => !byte || data[index] === byte
)

/** @type {[ ImageType, (data: Uint8ClampedArray) => boolean ][]} */
const tests = Object.entries({
	'image/avif': createTest(0, 0, 0, 0, 102, 116, 121, 112, 97, 118, 105, 102),
	'image/gif': createTest(71, 73, 70, 56),
	'image/jpeg': createTest(255, 216, 255),
	'image/jxl': createTest(255, 10),
	'image/png': createTest(137, 80, 78, 71, 13, 10, 26, 10),
	'image/svg+xml': createTest(60, 63, 120, 109, 108),
	'image/webp': createTest(82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80),
	'image/webp2': createTest(244, 255, 111),
})

/** @type {import('./codecs.d').ExtensionMap & Record<string, undefined>} */
const extensionsByType = {
	'image/avif': 'avif',
	'image/jpeg': 'jpg',
	'image/jxl': 'jxl',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/webp2': 'wp2',
}

/** @type {import('./codecs.d').GetType} */
export const getImageTypeByData = (data) => {
	for (const [ type, test ] of tests) {
		if (test(data)) return type
	}

	return ''
}

/** @type {import('./codecs.d').GetTypeByExtension} */
export const getExtensionByType = (type) => {
	return extensionsByType[type] || ''
}
