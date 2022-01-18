import { readFileSync } from 'node:fs'
import { Module as esmEncode } from './__type__-enc.js'
import { Module as esmDecode } from './__type__-dec.js'

esmDecode.globalThis = {
	ImageData: class ImageData {
		constructor (data, width, height) {
			return { data, width, height }
		}
	},
}

esmDecode.run(readFileSync(new URL('./__type__-dec.wasm', import.meta.url)))
esmEncode.run(readFileSync(new URL('./__type__-enc.wasm', import.meta.url)))

const wasmDecode = await esmDecode.ready.then(exports => exports.decode)
const wasmEncode = await esmEncode.ready.then(exports => exports.encode)

export const decode = (data) => {
	return test(data) ? new DecodedImage(
		...Object.values(wasmDecode(data)),
	) : null
}

export const encode = (image, options) => {
	return new EncodedImage(
		type,
		wasmEncode(
			image.data,
			image.width,
			image.height,
			Object.assign({}, encodeOptions, options)
		),
		image.width,
		image.height
	)
}

export const load = (data) => {
	return test(data) ? new EncodedImage(
		type,
		new Uint8Array(data),
		...Object.values(rect(data))
	) : null
}

export const encodeOptions = __opts__

export const test = (b) => [ __test__ ].every(
	(byte, index) => !byte || b[index] === byte
)
