import { readUInt16BE } from './utils.js'

export const getSize = (/** @type {NumericArray} */ data) => {
	if (data.length < 2) return null

	// first marker of the file MUST be 0xFFD8
	if (data[0] !== 0xFF || data[1] !== 0xD8) return null

	let offset = 2

	for (;;) {
		if (data.length - offset < 2) return null

		// not a JPEG marker
		if (data[offset++] !== 0xFF) return null

		let code = data[offset++]
		let length

		// skip padding bytes
		while (code === 0xFF) code = data[offset++]

		// standalone markers, according to JPEG 1992,
		// http://www.w3.org/Graphics/JPEG/itu-t81.pdf, see Table B.1
		if ((0xD0 <= code && code <= 0xD9) || code === 0x01) {
			length = 0
		} else if (0xC0 <= code && code <= 0xFE) {
			// the rest of the unreserved markers
			if (data.length - offset < 2) return null

			length = readUInt16BE(data, offset) - 2
			offset += 2
		} else {
			// unknown markers
			return null
		}

		if (code === 0xD9 /* EOI */ || code === 0xDA /* SOS */) {
			// end of the datastream
			return null
		}

		if (length >= 5 &&
				(0xC0 <= code && code <= 0xCF) &&
				code !== 0xC4 && code !== 0xC8 && code !== 0xCC) {

			if (data.length - offset < length) return null

			return {
				width:  readUInt16BE(data, offset + 3),
				height: readUInt16BE(data, offset + 1),
			}
		}

		offset += length
	}
}

/** @typedef {ArrayLike<number> & { [Symbol.iterator](): Iterator<number>, slice(start?: number, end?: number): NumericArray }} NumericArray */
