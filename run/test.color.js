// @ts-check

import * as assert from './lib/assert.js'
import * as codecs from '../dist/codecs.js'

await assert.test('Detect the correct image color', async () => {
	const image = await codecs.load('test/test.jpg').then(image => image.decode())

	assert.expect(image.color).toEqual([ 57, 52, 43 ])
})
