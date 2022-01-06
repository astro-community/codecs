import './lib/URL.js'
import * as fs from 'node:fs/promises'
import * as codecs from '@astropub/codecs'
import * as avif from '@astropub/codecs/avif'
import * as jpg from '@astropub/codecs/jpg'
import * as jxl from '@astropub/codecs/jxl'
import * as png from '@astropub/codecs/png'
import * as webp from '@astropub/codecs/webp'
import * as wp2 from '@astropub/codecs/wp2'

const cwd = URL.from(import.meta.url).goto('./')

/** @type {ImageData} */
let image;

console.log('Using the JPG:')

{
	image = await codecs.jpg.decode(await fs.readFile(cwd.goto('../test/test.jpg')))

	console.log('  resize JPG')

	await fs.writeFile(
		cwd.goto('../test/test-resized.jpg'),
		await jpg.encode(await codecs.resize(image.data, {
			naturalWidth: image.width,
			naturalHeight: image.height,
			width: image.width / 2,
			height: image.height / 2,
		}), image.width / 2, image.height / 2)
	)

	console.log('  encode AVIF from JPG')

	await fs.writeFile(cwd.goto('../test/test-from-jpg.avif'), await avif.encode(image.data, image.width, image.height))

	console.log('  encode JPG from JPG')

	await fs.writeFile(cwd.goto('../test/test-from-jpg.jpg'), await jpg.encode(image.data, image.width, image.height))

	console.log('  encode JXL from JPG')

	await fs.writeFile(cwd.goto('../test/test-from-jpg.jxl'), await jxl.encode(image.data, image.width, image.height))

	console.log('  encode PNG from JPG')

	await fs.writeFile(cwd.goto('../test/test-from-jpg.png'), await png.encode(image.data, image.width, image.height))

	console.log('  encode WEBP from JPG')

	await fs.writeFile(cwd.goto('../test/test-from-jpg.webp'), await webp.encode(image.data, image.width, image.height))

	console.log('  encode WP2 from JPG')

	await fs.writeFile(cwd.goto('../test/test-from-jpg.wp2'), await wp2.encode(image.data, image.width, image.height))
}

console.log('Using the WEBP:')

{
	image = await codecs.webp.decode(await fs.readFile(cwd.goto('../test/test.webp')))

	console.log('  resize WEBP')

	await fs.writeFile(
		cwd.goto('../test/test-resized.webp'),
		await webp.encode(await codecs.resize(image.data, {
			naturalWidth: image.width,
			naturalHeight: image.height,
			width: image.width / 2,
			height: image.height / 2,
		}), image.width / 2, image.height / 2)
	)

	console.log('  encode AVIF from WEBP')

	await fs.writeFile(cwd.goto('../test/test-from-webp.avif'), await avif.encode(image.data, image.width, image.height))

	console.log('  encode JPG from WEBP')

	await fs.writeFile(cwd.goto('../test/test-from-webp.jpg'), await jpg.encode(image.data, image.width, image.height))

	console.log('  encode JXL from WEBP')

	await fs.writeFile(cwd.goto('../test/test-from-webp.jxl'), await jxl.encode(image.data, image.width, image.height))

	console.log('  encode PNG from WEBP')

	await fs.writeFile(cwd.goto('../test/test-from-webp.png'), await png.encode(image.data, image.width, image.height))

	console.log('  encode WEBP from WEBP')

	await fs.writeFile(cwd.goto('../test/test-from-webp.webp'), await webp.encode(image.data, image.width, image.height))

	console.log('  encode WP2 from WEBP')

	await fs.writeFile(cwd.goto('../test/test-from-webp.wp2'), await wp2.encode(image.data, image.width, image.height))
}

console.log('Using the PNG:')

{
	image = await codecs.png.decode(await fs.readFile(cwd.goto('../test/test.png')))

	console.log('  resize PNG')

	await fs.writeFile(
		cwd.goto('../test/test-resized.png'),
		await png.encode(await codecs.resize(image.data, {
			naturalWidth: image.width,
			naturalHeight: image.height,
			width: image.width / 2,
			height: image.height / 2,
		}), image.width / 2, image.height / 2)
	)

	console.log('  encode AVIF from PNG')

	await fs.writeFile(cwd.goto('../test/test-from-png.avif'), await avif.encode(image.data, image.width, image.height))

	console.log('  encode JPG from PNG')

	await fs.writeFile(cwd.goto('../test/test-from-png.jpg'), await jpg.encode(image.data, image.width, image.height))

	console.log('  encode JXL from PNG')

	await fs.writeFile(cwd.goto('../test/test-from-png.jxl'), await jxl.encode(image.data, image.width, image.height))

	console.log('  encode PNG from PNG')

	await fs.writeFile(cwd.goto('../test/test-from-png.png'), await png.encode(image.data, image.width, image.height))

	console.log('  encode WEBP from PNG')

	await fs.writeFile(cwd.goto('../test/test-from-png.webp'), await webp.encode(image.data, image.width, image.height))

	console.log('  encode WP2 from PNG')

	await fs.writeFile(cwd.goto('../test/test-from-png.wp2'), await wp2.encode(image.data, image.width, image.height))
}

console.log('Done')