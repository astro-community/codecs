import * as codecs from './codecs.utils.js'
import * as utils from './SourceImage.utils.js'

export class SourceImage {
	/** @arg {Uint8Array} data */
	constructor(data) {
		const type = utils.getImageTypeByData(data)
		const extension = utils.getExtensionByType(type)

		if (!type || !extension) throw new TypeError('Could not read source image.')

		__object_freeze((__object_assign(this, { data, type, extension })))
	}

	toData() {
		
	}
}

import { __object_assign, __object_freeze } from './utils.js'
