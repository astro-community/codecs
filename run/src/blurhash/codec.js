import { default as decodeBlurhash } from './decode.js'
import { default as encodeBlurhash } from './encode.js'
export { isBlurhashValid as test } from './decode.js'

/** @type {{ (image: BlurhashImage, options: { width?: number, height?: number, punch?: number, size?: number }): Image }} */
export const decode = (image, options) => {
	let { height, punch, size, width } = Object.assign({ punch: 1 }, options)

	width  = Number(!isNaN(size) ? size : !isNaN(width)  ? width  : !isNaN(height) ? Math.round(height / image.height * image.width)  : image.width)  || 0
	height = Number(!isNaN(size) ? size : !isNaN(height) ? height : !isNaN(width)  ? Math.round(width  / image.width  * image.height) : image.height) || 0

	punch = Number(punch) || 0

	const data = decodeBlurhash(image.data, width, height, punch)

	return { data, width, height }
}

/** @type {{ (image: Image, options: { component?: number, componentX?: number, componentY?: number }): BlurhashImage }} */
export const encode = (image, options) => {
	const { width, height } = image
	let { component, componentX, componentY } = Object.assign({ component: 4 }, options)

	component = Number(component) || 0
	componentX = Number(componentX) || Number(component) || 0
	componentY = Number(componentY) || Number(component) || 0

	/** @type {string} */
	const data = encodeBlurhash(image.data, width, height, componentX, componentY)

	return { data, width, height }
}

/** @typedef {{ data: Uint8ClampedArray, width: number, height: number }} Image */
/** @typedef {{ data: string, width: number, height: number }} BlurhashImage */
