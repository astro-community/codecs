// polyfills
// ----------------------------------------

import * as webapi from '@astropub/webapi'

/** @type {globalThis.fetch} */
const fetch = globalThis.fetch || webapi.fetch

// codecs
// ----------------------------------------

import * as avif from './avif/thread.js'
import * as jpg from './jpg/thread.js'
import * as jxl from './jxl/thread.js'
import * as png from './png/thread.js'
import * as webp from './webp/thread.js'
import * as wp2 from './wp2/thread.js'

import { blur } from './transform/blur/thread.js'
import { blurhash } from './transform/blurhash/thread.js'
import { resize } from './transform/resize/thread.js'

export { avif, jpg, jxl, png, webp, wp2, blur, blurhash, resize }

/** @type {import('./codecs.d').CodecList} */
const codecList = [ avif, jpg, jxl, png, webp, wp2 ]

/** @type {import('./codecs.d').CodecMap} */
const codecMap = {
	'image/avif': avif,
	'image/jpeg': jpg,
	'image/jxl': jxl,
	'image/png': png,
	'image/webp': webp,
	'image/webp2': wp2,
}

// encoded image
// ----------------------------------------

import { DecodedImage, EncodedImage } from './transform/utils.js'

Object.assign(DecodedImage.prototype, {
	/** @this {DecodedImage} @arg {import('./codecs.d').ImageType} type @arg {import('./codecs.d').EncodeOptionsMap[keyof import('./codecs.d').EncodeOptionsMap]} [options] */
	encode(type, options = null) {
		const codec = codecMap[type]

		return codec ? codec.encode(this, options) : null
	},
	/** @this {DecodedImage} @arg {import('./codecs.d').BlurOptions} [options] */
	blur(options = null) {
		return blur(this, options)
	},
	/** @this {DecodedImage} @arg {import('./codecs.d').BlurHashImage} [options] */
	blurhash(options = null) {
		return blurhash(this, options)
	},
	/** @this {DecodedImage} @arg {import('./codecs.d').ResizeOptions} [options] */
	resize(options = null) {
		return resize(this, options)
	},
})

Object.assign(EncodedImage.prototype, {
	decode() {
		return decode(this.data)
	},
})

export { DecodedImage, EncodedImage }

// decode
// ----------------------------------------

/** @type {typeof import('./codecs.d').decode} */
export const decode = (buffer) => {
	for (const codec of codecList) {
		if (codec.test(buffer)) return codec.decode(buffer)
	}
}

/** @type {typeof import('./codecs.d').encode} */
export const encode = (image, type, options) => {
	const codec = codecMap[type]

	return codec ? codec.encode(image, options) : null
}

// ext
// ----------------------------------------

/** @type {typeof import('./codecs.d').ext} */
export const ext = (data) => {
	for (const codec of codecList) {
		if (codec.test(data)) return codec.ext
	}
}

// load
// ----------------------------------------

/** @type {{ (data: any): Promise<import('./codecs.d').TypedArray> }} */
const preload = (data) => {
	if (data !== Object(data)) {
		return preload(
			fetch(
				new URL(
					posix.getPath(data),
					new URL(posix.getDir(process.env()), 'file:')
				)
			)
		)
	}

	if (typeof data.then === 'function') {
		return data.then(preload)
	}

	if (typeof data.arrayBuffer === 'function') {
		return preload(data.arrayBuffer())
	}

	if (data.length < 1) {
		return []
	}

	return data
}

/** @type {typeof import('./codecs.d').load} */
export const load = (source) => preload(source).then(
	buffer => decode(buffer)
)

// type
// ----------------------------------------

/** @type {typeof import('./codecs.d').type} */
export const type = (data) => {
	for (const codec of codecList) {
		if (codec.test(data)) return codec.type
	}
}
