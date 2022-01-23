/** Returns any kind of path as a posix path. */
export const toPath = (arg) => String(
	arg == null ? '' : arg
).trim().replace(
	// convert slashes
	/\\+/g, '/'
).replace(
	// prefix a slash to drive letters
	/^(?=[A-Za-z]:\/)/, '/'
).replace(
	// encode path characters
	/%/g, '%25'
).replace(
	/\n/g, '%0A'
).replace(
	/\r/g, '%0D'
).replace(
	/\t/g, '%09'
)

export const object_assign = Object.assign
export const object_freeze = Object.freeze
export const object_isPrototypeOf = Function.call.bind(Object.prototype.isPrototypeOf)

export const TypedArray = Object.getPrototypeOf(Int8Array)

export const readUInt16BE = (/** @type {ArrayLike<number>} */ data, /** @type {number} */ offset) => data[offset + 1] | (data[offset] << 8)
export const readUInt16LE = (/** @type {ArrayLike<number>} */ data, /** @type {number} */ offset) => data[offset] | (data[offset + 1] << 8)
export const readUInt24LE = (/** @type {ArrayLike<number>} */ data, /** @type {number} */ offset) => data[offset] + data[offset + 1] * 2 ** 8 + data[offset + 2] * 2 ** 16
export const readUInt32BE = (/** @type {ArrayLike<number>} */ data, /** @type {number} */ offset) => data[offset + 3] | (data[offset + 2] << 8) | (data[offset + 1] << 16) | (data[offset] * 0x1000000)
export const readUInt32LE = (/** @type {ArrayLike<number>} */ data, /** @type {number} */ offset) => data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] * 0x1000000)

const maxSize = 0x3fff

/** @type {{ (from: number, ...bytes: number[]): (data: ArrayBufferLike) => boolean }} */
const getTypeTestByBytes = (from = 0, ...bytes) => (data) => bytes.every(
	(byte, index) => !byte || data[from + index] === byte
)

/** @type {typeof import('./utils.d').getPngSize} */
export const getPngSize = (/** @type {ArrayLike<number>} */ data) => ({
	width:  readUInt32BE(data, 16),
	height: readUInt32BE(data, 20),
})

/** @type {['isVP8_' | 'isVP8L' | 'isVP8X', (data: Uint8Array) => boolean][]} */
const webpTests = Object.entries({
	isVP8_: getTypeTestByBytes(12, 86, 80, 56, 32), // 'VP8 '
	isVP8L: getTypeTestByBytes(12, 86, 80, 56, 76), // 'VP8L'
	isVP8X: getTypeTestByBytes(12, 86, 80, 56, 88), // 'VP8X'
})

const getWebPSizeByType = {
	isVP8_(/** @type {ArrayLike<number>} */ data) {
		return {
			width:  readUInt16LE(data, 26) & maxSize,
			height: readUInt16LE(data, 28) & maxSize,
		}
	},
	isVP8L(/** @type {ArrayLike<number>} */ data) {
		const bits = readUInt32LE(data, 21)

		return {
			width:  (bits & maxSize) + 1,
			height: ((bits >> 14) & maxSize) + 1,
		}
	},
	isVP8X(/** @type {ArrayLike<number>} */ data) {
		return {
			width: 1 + readUInt24LE(data, 20 + 4),
			height: 1 + readUInt24LE(data, 20 + 7),
		}
	},
}

/** @type {typeof import('./utils.d').getWebpSize} */
export const getWebpSize = (data) => {
	for (const [ type, test ] of webpTests) {
		if (test(data)) return getWebPSizeByType[type](data)
	}

	return null
}

// DecodedImage
// ----------------------------------------

const colormemo = new WeakMap

export class DecodedImage {
	/** @arg {Uint8ClampedArray} data @arg {number} width @arg {number} height */
	constructor(data, width, height) {
		this.data = data
		this.width = width
		this.height = height
	}

	get color() {
		if (colormemo.has(this)) return colormemo.get(this)

		const data = this.data
		const size = data.length
		const color = [ 0, 0, 0 ]

		for (let i = 0; i < size; i += 4) {
			color[0] += data[i + 0]
			color[1] += data[i + 1]
			color[2] += data[i + 2]
		}

		const rgb = [ ~~(color[0] * 4 / size), ~~(color[1] * 4 / size), ~~(color[2] * 4 / size) ]

		colormemo.set(this, rgb)

		return rgb
	}

	get style() {
		return {
			aspectRatio: `${this.width} / ${this.height}`,
			backgroundColor: `rgb(${this.color.join(' ')})`,
			height: `${this.height}px`,
			width: `${this.width}px`,
		}
	}
}

// EncodedImage
// ----------------------------------------

/** @type {import('../codecs.d').ExtensionMap} */
const extensionMap = {
	'image/avif': 'avif',
	'image/jpeg': 'jpg',
	'image/jxl': 'jxl',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/webp2': 'wp2',
}

export class EncodedImage {
	/** @this {import('../codecs.d').EncodedImage} @arg {import('../codecs.d').ImageType} type @arg {Uint8Array} data @arg {number} width @arg {number} height */
	constructor(type, data, width, height) {
		this.type = type
		this.data = data
		this.width = width
		this.height = height
	}

	get ext() {
		return extensionMap[this.type]
	}
}

// BlurHashImage
// ----------------------------------------

export class BlurHashImage extends DecodedImage {
	/** @this {import('../codecs.d').BlurHashImage} @arg {string} @arg {Uint8ClampedArray} data @arg {number} width @arg {number} height */
	constructor(hash, data, width, height) {
		super(data, width, height)

		this.hash = hash
	}
}
