// @ts-check

import * as assert from './lib/assert.js'
import * as codecs from '../dist/codecs.js'
import * as fs from 'node:fs/promises'

await assert.test('Blur the image', async () => {
	const image = await codecs.jpg.decode(await fs.readFile('test/test.jpg'))

	const blurredImage = await image.blur({ radius: 30 })

	await assert.test('  Encode the blurred image as a WebP', async () => {
		const blurredWebP = await blurredImage.encode('image/webp', { quality: 100 })
		await fs.writeFile('test/test-blur.webp', blurredWebP.data)
	})
})
