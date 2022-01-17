import { readFile } from 'node:fs/promises'

const asm = Object.create(null)
const esm = Object.create(null)

export const resize = async (image, options) => {
	asm.common = asm.common || await readFile(new URL('./resize.wasm', import.meta.url))
	esm.common = esm.common || await import(new URL('./resize.js', import.meta.url)).then(exports => exports.default(asm.common).then(() => exports))

	let {
		naturalWidth,
		naturalHeight,
		width,
		height,
		resizeMethod,
		premultiply,
		linearRGB,
	} = Object.assign({
		naturalWidth: image.width,
		naturalHeight: image.height,
	}, resizeOptions, options)

	height = isNaN(height) ? Math.round(width / image.width * image.height) : height

	const resizeMethodIndex = resizeMethods.indexOf(resizeMethod)

	const data = esm.common.resize(image.data, naturalWidth, naturalHeight, width, height, resizeMethodIndex, premultiply, linearRGB)

	return { data, width, height }
}

const resizeMethods = [ 'triangle', 'catrom', 'mitchell', 'lanczos3' ]

export const resizeOptions = {
	method: 'hqx',
	resizeMethod: 'catrom',
	premultiply: true,
}
