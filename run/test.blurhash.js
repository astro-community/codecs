// @ts-check

import * as assert from './lib/assert.js'
import * as codecs from '../dist/codecs.js'
import * as fs from 'node:fs/promises'

await assert.test('Blurhash the image', async () => {
	const image = await codecs.jpg.decode(await fs.readFile('test/test.jpg'))

	const blurHashedImage = await image.blurhash({ width: 32 })

	await assert.test('  Encode the blurred image as a WebP', async () => {
		const blurHashedWebp = await codecs.webp.encode(blurHashedImage, { pass: 6, quality: 100 })
	
		if (blurHashedImage.hash !== 'U88W{YxYEkE2_MWCkWWBTIbHxtbHXRofw^s:') {
			throw new Error('BlurHash Image hash mismatch.')
		}
	
		await fs.writeFile('test/test-blurhash.webp', blurHashedWebp.data)
	})
})
