import { default as decodeBlurhash, isBlurhashValid as test } from './decode.js'
import { default as encodeBlurhash } from './encode.js'
import { BlurHashImage } from '../utils.js'

export { test }

/** @type {typeof import('./codec.d').blurhash} */
export const blurhash = (image, options) => {
	/** @type {import('./codec.d').BlurHashOptions} */
	let {
		component,
		componentX,
		componentY,
		punch,
		naturalHeight,
		naturalWidth,
		width,
		height,
		size,
	} = Object(options)

	component = component != null ? Number(component) || 0 : blurhashOptions.component
	componentX = componentX != null ? Number(componentX) || 0 : component
	componentY = componentY != null ? Number(componentY) || 0 : component

	punch = punch != null ? Number(punch) || 0 : blurhashOptions.punch

	naturalWidth = naturalWidth != null ? Number(naturalWidth) || 0 : image.width
	naturalHeight = naturalHeight != null ? Number(naturalHeight) || 0 : image.height

	size    = size != null   ? Number(size)   || 0 : null
	width   = width != null  ? Number(width)  || 0 : size != null ? Number(size) || 0 : height != null ? Math.round(height / image.height * image.width)  || 0 : naturalWidth
	height  = height != null ? Number(height) || 0 : size != null ? Number(size) || 0 : width  != null ? Math.round(width  / image.width  * image.height) || 0 : naturalHeight

	/** @type {string} */
	const hash = encodeBlurhash(image.data, naturalWidth, naturalHeight, componentX, componentY)

	/** @type {TypedArray} */
	const data = decodeBlurhash(hash, width, height, punch)

	return new BlurHashImage(hash, data, width, height)
}

export const blurhashOptions = {
	component: 4,
	punch: 1,
}
