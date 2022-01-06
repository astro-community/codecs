import { readFile } from 'node:fs/promises'

const asm = Object.create(null)
const esm = Object.create(null)

export const decode = async (buffer) => {
	asm.common = asm.common || await readFile(new URL('./png-enc-dec.wasm', import.meta.url))
	esm.common = esm.common || await import(new URL('./png-enc-dec.js', import.meta.url)).then(exports => exports.default(asm.common).then(() => exports))

	return esm.common.decode(buffer)
}

export const encode = async (buffer, w, h, o) => {
	asm.common = asm.common || await readFile(new URL('./png-enc-dec.wasm', import.meta.url))
	esm.common = esm.common || await import(new URL('./png-enc-dec.js', import.meta.url)).then(exports => exports.default(asm.common).then(() => exports))

	return esm.common.encode(buffer, w, h, o)
}

export const encodeOptions = {
	level: 2,
	interlace: false,
}
