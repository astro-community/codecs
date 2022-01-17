import { readFile } from 'node:fs/promises'

const asm = Object.create(null)
const esm = Object.create(null)

export const decode = async (uint) => {
	asm.common = asm.common || await readFile(new URL('./png-enc-dec.wasm', import.meta.url))
	esm.common = esm.common || await import(new URL('./png-enc-dec.js', import.meta.url)).then(exports => exports.default(asm.common).then(() => exports))

	return esm.common.decode(uint)
}

export const encode = async (image, options) => {
	asm.common = asm.common || await readFile(new URL('./png-enc-dec.wasm', import.meta.url))
	esm.common = esm.common || await import(new URL('./png-enc-dec.js', import.meta.url)).then(exports => exports.default(asm.common).then(() => exports))

	return esm.common.encode(
		image.data,
		image.width,
		image.height,
		Object.assign({}, encodeOptions, options)
	)
}

export const encodeOptions = {
	level: 2,
	interlace: false,
}

export const test = (b) => [ __test__ ].every(
	(byte, index) => !byte || b[index] === byte
)
