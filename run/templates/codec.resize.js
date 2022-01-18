import { DecodedImage } from '../utils.js'
import { readFile } from 'node:fs/promises'
import * as codec from './resize.js'

const asmPath = new URL('./resize.wasm', import.meta.url)
const asmData = await readFile(asmPath)

await codec.default(asmData)

export const resize = (image, options) => {
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

	const data = codec.resize(image.data, naturalWidth, naturalHeight, width, height, resizeMethodIndex, premultiply, linearRGB)

	return new DecodedImage(data, width, height)
}

const resizeMethods = [ 'triangle', 'catrom', 'mitchell', 'lanczos3' ]

export const resizeOptions = {
	linearRGB: true,
	method: 'hqx',
	premultiply: true,
	resizeMethod: 'catrom',
}
