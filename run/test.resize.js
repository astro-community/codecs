// @ts-check

import * as assert from './lib/assert.js'
import * as codecs from '../dist/codecs.js'
import * as fs from 'node:fs/promises'

await assert.test('Resize the image', async () => {
	const image = await codecs.jpg.decode(await fs.readFile('test/test.jpg'))

	/** @type {[320, 640, 960]} */
	const sizes = [320, 640, 960]

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

	for (const size of sizes) {
		await assert.test(`  Resize the image to ${size} width`, async () => {
			const resized = await image.resize({ width: size })

			for (const type of types) {
				const ext = extensionMap[type]

				await assert.test(`  Encode the ${size} width image to ${ext.toUpperCase()}`, async () => {
					const encoded = await resized.encode(type, { quality: 80 })

					await fs.writeFile(`test/test-${size}.${ext}`, encoded.data)
				})
			}
		})
	}
})
