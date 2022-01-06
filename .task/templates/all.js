import { readFile } from 'node:fs/promises'

const asm = Object.create(null)
const esm = Object.create(null)

export const decode = async (buffer) => {
	asm.decode = asm.decode || await readFile(new URL('./__type__-dec.wasm', import.meta.url))
	esm.decode = esm.decode || await import(new URL('./__type__-dec.js', import.meta.url)).then(exports => Object.assign(exports.Module, {
		globalThis: {
			ImageData: class ImageData {
				constructor (data, width, height) {
					return { data, width, height }
				}
			},
		},
	}))

	esm.decode.run(asm.decode)

	return esm.decode.ready.then(module => module.decode(buffer))
}

export const encode = async (buffer, w, h, o) => {
	asm.encode = asm.encode || await readFile(new URL('./__type__-enc.wasm', import.meta.url))
	esm.encode = esm.encode || await import('./__type__-enc.js').then(exports => exports.Module)

	esm.encode.run(asm.encode)

	o = Object.assign({}, encodeOptions, o)

	return esm.encode.ready.then(module => module.encode(buffer, w, h, o))
}

export const encodeOptions = __opts__

export const test = (b) => [ __test__ ].every(
	(byte, index) => !byte || b[index] === byte
)
