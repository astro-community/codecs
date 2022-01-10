import * as avif from './avif/thread.js'
import * as jpg from './jpg/thread.js'
import * as jxl from './jxl/thread.js'
import * as png from './png/thread.js'
import * as webp from './webp/thread.js'
import * as wp2 from './wp2/thread.js'

import { resize } from './resize/thread.js'
import { __object_assign, __object_freeze, toUint8Array } from './utils.js'

export * as avif from './avif/thread.js'
export * as jpg from './jpg/thread.js'
export * as jxl from './jxl/thread.js'
export * as png from './png/thread.js'
export * as webp from './webp/thread.js'
export * as wp2 from './wp2/thread.js'

export { blur } from './blur/thread.js'
export { resize } from './resize/thread.js'

/** @var {number} resize */

export class Image {
	/** @type {Uint8ClampedArray} */
	data = null

	/** @type {number} */
	width = 0

	/** @type {number} */
	height = 0

	/** @arg {Uint8ClampedArray} data @arg {number} width @arg {number} height */
	constructor(data, width = 0, height = data.length / width / 4 || 0) {
		__object_freeze(__object_assign(this, { data, width, height }))
	}

	/** @arg {Partial<EncodeOptions>} options */
	encode(options) {
		/** @type {EncodeOptions} */ 
		let { sizes, resizeMethod, types, ...config } = Object(options)

		sizes = [].concat(sizes || []).filter(size => Number(size))

		types = [].concat(types || []).filter(type => type in codecs)

		resizeMethod = resizeMethod || 'catrom'

		const { data, width, height } = this

		/** @type {Promise<Uint8Array>[]} */
		let promises = []

		if (sizes.length) {
			for (const size of sizes) {
				const cross = Math.round(size / width * height)

				/** @type {Promise<Uint8ClampedArray>} */
				promises.push(
					resize(data, {
						naturalWidth: width,
						naturalHeight: height,
						width: size,
						height: cross,
						resizeMethod,
					}).then(
						uint => ({ data: uint, width: size, height: cross })
					)
				)
			}
		} else {
			promises.push(
				Promise.resolve({ data: new UintArray(data), width, height })
			)
		}

		if (types.length) {
			for (const type of types) {
				promises = promises.map(
					promise => promise.then(
						data => codecs[type].encode(data.data, data.width, data.height, config).then(
							uint => ({ data: uint, width: data.width, height: data.height })
						)
					).then(
						data => new EncodedImage(data.data, type, data.width, data.height)
					)
				)
			}
		}

		return promises
	}
}

export class EncodedImage {
	/** @arg {Uint8Array} data @arg {ImageType} type @arg {number} width @arg {number} height */
	constructor(data, type, width, height) {
		const extension = extensions[type]

		__object_freeze(__object_assign(this, { data, type, extension, width, height }))
	}
}

/** @type {{ (data: Uint8ClampedArray) => ImageType | "" }} */
export const getType = (data) => {
	for (const [ type, test ] of tests) {
		if (test(data)) return type
	}

	return ''
}

export const load = async (arg) => {
	const uint = toUint8Array(await arg)
	const type = getType(uint)
	const codec = codecs[type]

	if (!codec || !codec.decode) return

	const { data, width, height } = await codec.decode(uint)

	return new Image(data, width, height)
}

// Utilities

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

/** @type {Record<ImageType, Codec> & Record<string, undefined>} */
const codecs = {
	'image/avif': avif,
	'image/jpeg': jpg,
	'image/jxl': jxl,
	'image/png': png,
	'image/webp': webp,
	'image/webp2': wp2,
}

/** @type {{ 'image/avif': 'avif', 'image/jpeg': 'jpg', 'image/jxl': 'jxl', 'image/png': 'png', 'image/webp': 'webp', 'image/webp2': 'wp2' } & Record<string, undefined>} */
const extensions = {
	'image/avif': 'avif',
	'image/jpeg': 'jpg',
	'image/jxl': 'jxl',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/webp2': 'wp2',
}

/** @typedef {import('./codecs').Codec} Codec */
/** @typedef {import('./codecs').EncodeOptions} EncodeOptions */
/** @typedef {import('./codecs').ImageType} ImageType */
