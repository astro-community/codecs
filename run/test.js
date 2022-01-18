// @ts-check

import * as fs from 'node:fs/promises'
import * as codecs from '../dist/codecs.js'

for (const file of await fs.readdir('test/')) {
	if (file.includes('-')) {
		await fs.rm(`test/${file}`)
	}
}

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

console.log('Get the image type')

for (const type of types) {
	const ext = extensionMap[type]

	const imageFile = await fs.readFile(`test/test.${ext}`)

	if (codecs.ext(imageFile) !== ext) {
		throw new Error(`Unmatched extension checking ${type}.`)
	}
}

/** @type {[320, 640, 960]} */
const sizes = [320, 640, 960]

/** @type {Promise<void>[]} */
const awaits = []

for (const type of types) {
	const ext = extensionMap[type]

	console.log(`Decode the ${ext.toUpperCase()}`)

	const image = await codecs.decode(
		await fs.readFile(`test/test.${ext}`)
	)

	for (const destType of types) {
		const dest = extensionMap[destType]

		console.log(` encode ${dest.toUpperCase()} from ${ext.toUpperCase()}`)

		awaits.push(
			image.encode(destType, { quality: 100 }).then(
				image => fs.writeFile(`test/test-from-${ext}.${dest}`, image.data)
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
	const blurredImage = await image.blur({ radius: 30 })

	console.log(' write blurred image as WebP')
	const blurredWebP = await blurredImage.encode('image/webp', { quality: 100 })
	await fs.writeFile('test/test-blur.webp', blurredWebP.data)
}

{
	console.log('Blurhash the image')

	const image = await codecs.jpg.decode(
		await fs.readFile('test/test.jpg')
	)

	console.log(' create blurhash image')
	const blurHashedImage = await image.blurhash({ width: 32 })

	console.log(' write blurhash image as WebP')
	const blurHashedWebp = await codecs.webp.encode(blurHashedImage, { pass: 6, quality: 100 })

	if (blurHashedImage.hash !== 'U88W{YxYEkE2_MWCkWWBTIbHxtbHXRofw^s:') {
		throw new Error('BlurHash Image hash mismatch.')
	}

	await fs.writeFile('test/test-blurhash.webp', blurHashedWebp.data)
}

{
	console.log('Resize the image')

	const image = await codecs.jpg.decode(
		await fs.readFile('test/test.jpg')
	)

	for (const size of sizes) {
		console.log(` resize to ${size}`)
		const resized = await image.resize({ width: size })

		for (const type of types) {
			const ext = extensionMap[type]

			console.log(`  encode as ${ext}`)
			const encoded = await resized.encode(type, { quality: 80 })

			await fs.writeFile(`test/test-${size}.${ext}`, encoded.data)
		}
	}
}

for (const file of await fs.readdir('test/')) {
	if (file.includes('-')) {
		await fs.rm(`test/${file}`)
	}
}

console.log('Done')

process.exit(0)
