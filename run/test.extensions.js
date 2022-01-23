// @ts-check

import * as assert from './lib/assert.js'
import * as codecs from '../dist/codecs.js'
import * as fs from 'node:fs/promises'

/** @type {Exclude<codecs.ImageType, 'image/gif' | 'image/svg+xml'>[]} */
const types = ['image/avif', 'image/jpeg', 'image/jxl', 'image/png', 'image/webp', 'image/webp2']

/** @type {Omit<codecs.ExtensionMap, 'image/gif' | 'image/svg+xml'>} */
const extensionMap = {
	'image/avif': 'avif',
	'image/jpeg': 'jpg',
	'image/jxl': 'jxl',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/webp2': 'wp2',
}

await assert.test('Detect the correct image extension', async () => {
	for (const type of types) {
		const ext = extensionMap[type]

		const imageFile = await fs.readFile(`test/test.${ext}`)

		assert.expect(codecs.ext(imageFile)).toBe(ext)
	}
})
