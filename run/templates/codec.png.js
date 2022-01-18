import { readFile } from 'node:fs/promises'
import * as encdec from './png-enc-dec.js'
import * as optimize from './png-optimize.js'

const encdecWasm = await readFile(new URL('./png-enc-dec.wasm', import.meta.url))
const optimizeWasm = await readFile(new URL('./png-optimize.wasm', import.meta.url))

await encdec.default(encdecWasm)
await optimize.default(optimizeWasm)

export const decode = (data) => {
	return test(data) ? new DecodedImage(
		...Object.values(encdec.decode(data)),
	) : null
}

export const encode = (image, options) => {
	let { level, interlace, quality } = Object(options)

	level = (!isNaN(level) ? Math.max(Math.min(level, 6), 0) : !isNaN(quality) ? Math.round(quality / 100 * 3) : 2) || 0
	interlace = Boolean(interlace)

	return new EncodedImage(
		type,
		optimize.optimise(
			encdec.encode(
				image.data,
				image.width,
				image.height
			),
			level,
			interlace
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

export const encodeOptions = {
	level: 2,
	interlace: false,
}

export const test = (b) => [ __test__ ].every(
	(byte, index) => !byte || b[index] === byte
)
