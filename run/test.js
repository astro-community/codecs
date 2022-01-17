// @ts-check

import * as fs from 'node:fs/promises'
import * as codecs from '../dist/codecs.js'

for (const file of await fs.readdir('test/', { withFileTypes: true })) {
	if (file.name.includes('-')) {
		await fs.rm(`test/${file.name}`)
	}
}

/** @type {['avif', 'jpg', 'jxl', 'png', 'webp', 'wp2']} */
const types = ['avif', 'jpg', 'jxl', 'png', 'webp', 'wp2']

console.log('Get the image type')

for (const type of types) {
	const imageFile = await fs.readFile(`test/test.${type}`)

	void codecs.getType(imageFile)
	void codecs.getExtension(imageFile)
}

/** @type {[320, 640, 960]} */
const sizes = [320, 640, 960]

/** @type {Promise<void>[]} */
const awaits = []

for (const type of types) {
	console.log(`Decode the ${type.toUpperCase()}`)

	const image = await codecs[type].decode(
		await fs.readFile(`test/test.${type}`)
	)

	for (const dest of types) {
		console.log(` encode ${dest.toUpperCase()} from ${type.toUpperCase()}`)

		awaits.push(
			codecs[dest].encode(image).then(
				encoded => fs.writeFile(`test/test-from-${type}.${dest}`, encoded)
			)
		)
	}
}

console.log('Waiting for encodings to finish...')

await Promise.all(awaits)

console.log()

{
	console.log('Blur the image')

	const image = await codecs.jpg.decode(
		await fs.readFile('test/test.jpg')
	)

	console.log(' create blurred image')
	const blurredImage = await codecs.blur(image, { radius: 30 })

	console.log(' write blurred image as WebP')
	const blurredWebP = await codecs.webp.encode(blurredImage, { pass: 1, quality: 100 })
	await fs.writeFile('test/test-blur.webp', blurredWebP)
}

{
	console.log('Blurhash the image')

	const image = await codecs.jpg.decode(
		await fs.readFile('test/test.jpg')
	)

	console.log(' create blurhashed image')
	const blurhash = await codecs.blurhash.encode(image)
	const blurHashedImage = await codecs.blurhash.decode(blurhash, { width: 32 })

	console.log(' write blurrhashed image as WebP')
	const blurwebp = await codecs.webp.encode(blurHashedImage, { pass: 6, quality: 100 })

	await fs.writeFile('test/test-blurhash.webp', blurwebp)
}

{
	console.log('Resize the image')

	const image = await codecs.jpg.decode(
		await fs.readFile('test/test.jpg')
	)

	for (const size of sizes) {
		console.log(` resize to ${size}`)
		const resized = await codecs.resize(image, { width: size })

		for (const type of types) {
			console.log(`  encode as ${type}`)
			const encoded = await codecs[type].encode(resized, { quality: 80 })

			await fs.writeFile(`test/test-${size}.${type}`, encoded)
		}
	}
}

// for (const file of await fs.readdir('test/', { withFileTypes: true })) {
// 	if (file.name.includes('-')) {
// 		await fs.rm(`test/${file.name}`)
// 	}
// }

console.log('Done')
