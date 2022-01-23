import * as assert from './lib/assert.js'
import * as codecs from '../dist/codecs.js'
import * as fs from 'node:fs/promises'

await assert.test('Decode and encode the correct image formats', async () => {
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

	/** @type {Promise<void>[]} */
	const awaits = []

	for (const type of types) {
		const ext = extensionMap[type]

		await assert.test(`  Decode the ${ext.toUpperCase()} image`, async () => {
			const image = await codecs.decode(
				await fs.readFile(`test/test.${ext}`)
			)

			for (const destType of types) {
				const dest = extensionMap[destType]

				await assert.test(`    Encode the ${ext.toUpperCase()} image to ${dest.toUpperCase()}`, async () => {
					awaits.push(
						image.encode(destType, { quality: 100 }).then(
							image => fs.writeFile(`test/test-from-${ext}.${dest}`, image.data)
						)
					)
				})
			}
		})
	}

	console.log('  Await for the encodings to finish')

	await Promise.all(awaits)
})
