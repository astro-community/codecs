import { readFile } from 'node:fs/promises'

const asm = Object.create(null)
const esm = Object.create(null)

export const resize = async (buffer, options) => {
	asm.common = asm.common || await readFile(new URL('./resize.wasm', import.meta.url))
	esm.common = esm.common || await import(new URL('./resize.js', import.meta.url)).then(exports => exports.default(asm.common).then(() => exports))

	const {
		naturalWidth,
		naturalHeight,
		width,
		height,
		resizeMethod,
		premultiply,
		linearRGB,
	} = Object.assign({}, resizeOptions, options)

	const resizeMethodIndex = resizeMethods.indexOf(resizeMethod)

	return esm.common.resize(buffer, naturalWidth, naturalHeight, width, height, resizeMethodIndex, premultiply, linearRGB)
}

const resizeMethods = [ 'triangle', 'catrom', 'mitchell', 'lanczos3' ]

export const resizeOptions = {
	method: 'hqx',
	resizeMethod: 'catrom',
	premultiply: true,
}
