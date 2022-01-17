/** @type {{ (data: Uint8Array): ImageType | '' }} */
export const getType = (data) => {
	for (const [ type, test ] of typeTests) {
		if (test(data)) return type
	}

	return ''
}

/** @type {{ (data: Uint8Array): ImageExtension | '' }} */
export const getExtension = (data) => extensionsByType[getType(data)] || ''

/** @type {{ (...bytes: number[]): (data: ArrayBufferLike) => boolean }} */ 
const getTypeTestByBytes = (...bytes) => (data) => bytes.every(
	(byte, index) => !byte || data[index] === byte
)

/** @type {[ImageType, (data: Uint8Array) => boolean][]} */
const typeTests = Object.entries({
	'image/avif': getTypeTestByBytes(0, 0, 0, 0, 102, 116, 121, 112, 97, 118, 105, 102),
	'image/gif': getTypeTestByBytes(71, 73, 70, 56),
	'image/jpeg': getTypeTestByBytes(255, 216, 255),
	'image/jxl': getTypeTestByBytes(255, 10),
	'image/png': getTypeTestByBytes(137, 80, 78, 71, 13, 10, 26, 10),
	'image/svg+xml': getTypeTestByBytes(60, 63, 120, 109, 108),
	'image/webp': getTypeTestByBytes(82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80),
	'image/webp2': getTypeTestByBytes(244, 255, 111),
})

/** @type {Record<ImageType, ImageExtension>} */
const extensionsByType = {
	'image/avif': 'avif',
	'image/jpeg': 'jpg',
	'image/jxl': 'jxl',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/webp2': 'wp2',
}

/** @typedef {'image/avif' | 'image/gif' | 'image/jpeg' | 'image/jxl' | 'image/png' | 'image/svg+xml' | 'image/webp' | 'image/webp2'} ImageType */
/** @typedef {'avif' | 'jpg' | 'jxl' | 'png' | 'webp' | 'wp2'} ImageExtension */
