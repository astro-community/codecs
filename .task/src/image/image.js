import * as avif from '../avif/thread.js'
import * as jpg from '../jpg/thread.js'
import * as jxl from '../jxl/thread.js'
import * as png from '../png/thread.js'
import * as webp from '../webp/thread.js'
import * as wp2 from '../wp2/thread.js'
import * as blur from '../blur/thread.js'

export class ImageLike {
	async toEncoded(/** @type {ImageType} */ type, options = null) {
		const self = isEncodedImage(this) ? await this.toEncoded() : this

		const data = await imageCodecs[type].encode(self.data, self.width, self.height, Object(options))

		return new EncodedImage(data, type, self.width, self.height)
	}
}

export class BitmapImage {
	constructor(data, width, height) {
		const size = data.length

		Object.freeze(Object.assign(this, { data, size, width, height }))
	}

	async toEncoded(/** @type {ImageType} */ type, options = null) {
		const data = await imageCodecs[type].encode(this.data, this.width, this.height, Object(options))

		return new EncodedImage(data, type, this.width, this.height)
	}

	async blur(radius = 4) {
		const blurredData = await blur.blur(this.data, this.width, this.height, radius)
		const blurredImage = new BitmapImage(blurredData, this.width, this.height)

		return blurredImage
	}

	async toBitmap() {
		return this
	}
}

export class EncodedImage {
	constructor(data, /** @type {ImageType} */ type = null, width = -1, height = -1) {
		data = isUint8Array(data) ? data : new Uint8Array(data)
		type = type === null ? imageTypeOf(data) : type

		Object.freeze(Object.assign(this, { data, type, width, height }))
	}

	async toBitmap() {
		const { data, width, height } = await imageCodecs[this.type].decode(this.data)

		return new BitmapImage(data, width, height)
	}

	static from(data, /** @type {ImageType} */ type = null) {
		return new this(data, type)
	}

	static async fromFile(file, /** @type {ImageType} */ type = null) {
		fscache = fscache || await import('node:fs/promises')

		return new this(await fscache.readFile(file), type)
	}
}

let fscache = null

const createTest = (...bytes) => (data) => bytes.every(
	(byte, index) => !byte || data[index] === byte
)

const imageTests = Object.entries({
	'image/avif': createTest(0, 0, 0, 0, 102, 116, 121, 112, 97, 118, 105, 102),
	'image/gif': createTest(71, 73, 70, 56),
	'image/jpeg': createTest(255, 216, 255),
	'image/jxl': createTest(255, 10),
	'image/png': createTest(137, 80, 78, 71, 13, 10, 26, 10),
	'image/svg+xml': createTest(60, 63, 120, 109, 108),
	'image/webp': createTest(82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80),
	'image/webp2': createTest(244, 255, 111),
})

/** @type {Record<ImageType, { encode(): Promise<Uint8Array>, decode(): Promise<ImageData> }>} */
const imageCodecs = {
	'image/avif': avif,
	'image/gif': { encode() {}, decode() {} },
	'image/jpeg': jpg,
	'image/jxl': jxl,
	'image/png': png,
	'image/svg+xml': { encode() {}, decode() {} },
	'image/webp': webp,
	'image/webp2': wp2,
}

const imageTypeOf = (imageData) => {
	for (const [ imageType, imageTest ] of imageTests) {
		if (imageTest(imageData)) return imageType
	}

	return ''
}

const isUint8Array = Function.call.bind(Object.isPrototypeOf, Uint8Array.prototype)
const isBitmapImage = Function.call.bind(Object.isPrototypeOf, BitmapImage.prototype)
const isEncodedImage = Function.call.bind(Object.isPrototypeOf, EncodedImage.prototype)

/** @typedef {'image/avif' | 'image/gif' | 'image/jpeg' | 'image/jxl' | 'image/png' | 'image/svg+xml' | 'image/webp' | 'image/webp2'} ImageType */
/** @typedef {{ data: Uint8ClampedArray, width: number, height: number }} ImageData */