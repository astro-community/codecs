import * as utilsAVIF from './utils.avif.js'
import * as utilsJPEG from './utils.jpg.js'
import * as utils from './utils.js'

/** @type {{ (data: Uint8Array): ImageType | '' }} */
export const getType = (data) => {
	for (const [ type, test ] of typeTests) {
		if (test(data)) return type
	}

	return ''
}

/** @type {{ (data: Uint8Array): ImageExtension | '' }} */
export const getExtension = (data) => extensionsByType[getType(data)] || ''

/** @type {{ (from: number, ...bytes: number[]): (data: ArrayBufferLike) => boolean }} */
const getTypeTestByBytes = (from = 0, ...bytes) => (data) => bytes.every(
	(byte, index) => !byte || data[from + index] === byte
)

/** @type {{ (testA: (data: ArrayBufferLike) => boolean, testB: (data: ArrayBufferLike) => boolean): (data: ArrayBufferLike) => boolean }} */
const getTypeTestPair = (testA, testB) => (data) => testA(data) && testB(data)

/** @type {[ImageType, (data: Uint8Array) => boolean][]} */
const typeTests = Object.entries({
	'image/avif': getTypeTestPair(getTypeTestByBytes(4, 102, 116, 121, 112), getTypeTestByBytes(8, 97, 118, 105, 102)),
	'image/gif': getTypeTestByBytes(0, 71, 73, 70, 56),
	'image/jpeg': getTypeTestByBytes(0, 255, 216, 255),
	'image/jxl': getTypeTestByBytes(0, 255, 10),
	'image/png': getTypeTestPair(getTypeTestByBytes(0, 137, 80, 78, 71, 13, 10, 26, 10), getTypeTestByBytes(12, 73, 72, 68, 82)),
	'image/svg+xml': getTypeTestByBytes(0, 60, 63, 120, 109, 108),
	'image/webp': getTypeTestByBytes(0, 82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80),
	'image/webp2': getTypeTestByBytes(0, 244, 255, 111),
})

/** @type {['isVP8_' | 'isVP8L' | 'isVP8X', (data: Uint8Array) => boolean][]} */
const webpTests = Object.entries({
	isVP8_: getTypeTestByBytes(12, 86, 80, 56, 32), // 'VP8 '
	isVP8L: getTypeTestByBytes(12, 86, 80, 56, 76), // 'VP8L'
	isVP8X: getTypeTestByBytes(12, 86, 80, 56, 88), // 'VP8X'
})

/** @type {{ (data: Uint8Array): { width: number, height: number } }} */
const getWebpSize = (data) => {
	for (const [ type, test ] of webpTests) {
		if (test(data)) return utils.getWebPSize[type](data)
	}

	return null
}

/** @type {Record<ImageType, ImageExtension>} */
const extensionsByType = {
	'image/avif': 'avif',
	'image/jpeg': 'jpg',
	'image/jxl': 'jxl',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/webp2': 'wp2',
}

/** @type {Record<ImageType, ImageExtension>} */
const measurerersByType = {
	'image/avif': utilsAVIF.getSize,
	'image/jpeg': utilsJPEG.getSize,
	'image/png': utils.getPngSize,
	'image/webp': getWebpSize,
	'image/webp2': getWebpSize,
}

/** @type {{ (data: Uint8Array): { width: number, height: number } | null }} */
export const getMeasurements = (data) => {
	const measurerer = measurerersByType[getType(data)]

	return measurerer ? measurerer(data) : null
}

/** @typedef {'image/avif' | 'image/gif' | 'image/jpeg' | 'image/jxl' | 'image/png' | 'image/svg+xml' | 'image/webp' | 'image/webp2'} ImageType */
/** @typedef {'avif' | 'jpg' | 'jxl' | 'png' | 'webp' | 'wp2'} ImageExtension */
