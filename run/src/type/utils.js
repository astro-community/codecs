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

export const __object_assign = Object.assign
export const __object_freeze = Object.freeze
export const __object_isPrototypeOf = Function.call.bind(Object.prototype.isPrototypeOf)

export const TypedArray = Object.getPrototypeOf(Int8Array)

export const readUInt16BE = (/** @type {ArrayLike<number>} */ data, /** @type {number} */ offset) => data[offset + 1] | (data[offset] << 8)
export const readUInt16LE = (/** @type {ArrayLike<number>} */ data, /** @type {number} */ offset) => data[offset] | (data[offset + 1] << 8)
export const readUInt24LE = (/** @type {ArrayLike<number>} */ data, /** @type {number} */ offset) => data[offset] + data[offset + 1] * 2 ** 8 + data[offset + 2] * 2 ** 16
export const readUInt32BE = (/** @type {ArrayLike<number>} */ data, /** @type {number} */ offset) => data[offset + 3] | (data[offset + 2] << 8) | (data[offset + 1] << 16) | (data[offset] * 0x1000000)
export const readUInt32LE = (/** @type {ArrayLike<number>} */ data, /** @type {number} */ offset) => data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] * 0x1000000)

const maxSize = 0x3fff

export const getPngSize = (/** @type {ArrayLike<number>} */ data) => ({
	width:  readUInt32BE(data, 16),
	height: readUInt32BE(data, 20),
})

export const getWebPSize = {
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
