// @ts-check

import * as assert from './lib/assert.js'
import * as codecs from '../dist/codecs.js'

await assert.test('Detect the correct image style', async () => {
	const image = await codecs.load('test/test.jpg').then(image => image.decode())

	assert.expect({
		aspectRatio: image.style.aspectRatio,
		backgroundColor: image.style.backgroundColor,
		height: image.style.height,
		width: image.style.width,
	}).toEqual({
		aspectRatio: '800 / 1189',
		backgroundColor: 'rgb(57 52 43)',
		height: '1189px',
		width: '800px',
	})
})
