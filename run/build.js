import './lib/URL.js'
import './lib/polyfill.js'
import * as fs from 'node:fs/promises'
import * as JS from './lib/JS.js'
import AdmZip from 'adm-zip'
import { build as buildCodec } from './transforms/codec.js'
import { build as buildCodecPng } from './transforms/codec.png.js'

const cwd = URL.from(import.meta.url).goto('./')

// setup plugin sources
// ========================================

const exists = (/** @type {URL} */ url) => fs.stat(url).then(() => true, () => false)

const setup = () => exists(cwd.goto('.build/')).then(
	(dirExists) => dirExists ? undefined : fs.mkdir(cwd.goto('.build/'), { recursive: true })
).then(
	() => exists(cwd.goto('.build.zip')).then(
		(zipExists) => zipExists ? undefined : fetch(new URL('https://github.com/GoogleChromeLabs/squoosh/archive/refs/heads/dev.zip')).then(
			(response) => response.arrayBuffer()
		).then(
			(buffer) => new Uint8Array(buffer)
		).then(
			(binary) => fs.writeFile(cwd.goto('.build.zip'), binary)
		).then(
			() => new AdmZip(cwd.goto('.build.zip').pathname).extractAllTo(cwd.goto('.build/').pathname, true)
		)
	)
)

// build plugin dist
// ========================================

const build = async () => {
	const adjustedFileName = (file) => file === 'jpg_dec' ? 'mozjpeg_node_dec' : file.replace(/^jpg/, 'mozjpeg')
	const adjustedDirName = (dir) => dir === 'jpg' ? 'mozjpeg' : dir
	const adjustedFeatName = (dir) => String({ jpg: 'mozJPEG', webp: 'webP' }[dir] || dir)

	const detections = {
		avif: '0,0,0,0,102,116,121,112,97,118,105,102',
		gif: '71,73,70,56',
		jpg: '255,216,255',
		jxl: '255,10',
		png: '137,80,78,71,13,10,26,10',
		svg: '60,63,120,109,108',
		webp: '82,73,70,70,0,0,0,0,87,69,66,80',
		wp2: '244,255,111',
	}

	const transforms = {
		avif: (data) => [
			data,
			`import { DecodedImage, EncodedImage } from '../transform/utils.js'`,
			`import { getSize as rect } from '../transform/utils.avif.js'`,
			`export { rect }`,
			`export const ext = 'avif'`,
			`export const type = 'image/avif'`,
		].join('\n'),

		gif: (data) => [
			data,
			`import { DecodedImage, EncodedImage } from '../transform/utils.js'`,
			`export const rect = (data) => { const { width, height } = decode(data); return { width, height } }`,
			`export const ext = 'gif'`,
			`export const type = 'image/gif'`,
		].join('\n'),

		jpg: (data) => [
			data,
			`import { DecodedImage, EncodedImage } from '../transform/utils.js'`,
			`import { getSize as rect } from '../transform/utils.jpg.js'`,
			`export { rect }`,
			`export const ext = 'jpg'`,
			`export const type = 'image/jpeg'`,
		].join('\n'),

		jxl: (data) => [
			data,
			`import { DecodedImage, EncodedImage } from '../transform/utils.js'`,
			`export const rect = (data) => { const { width, height } = decode(data); return { width, height } }`,
			`export const ext = 'jxl'`,
			`export const type = 'image/jxl'`,
		].join('\n'),

		png: (data) => [
			data,
			`import { DecodedImage, EncodedImage, getPngSize as rect } from '../transform/utils.js'`,
			`export { rect }`,
			`export const ext = 'png'`,
			`export const type = 'image/png'`,
		].join('\n'),

		svg: (data) => [
			data,
			`import { DecodedImage, EncodedImage } from '../transform/utils.js'`,
			`export const ext = 'svg'`,
			`export const type = 'image/svg+xml'`,
		].join('\n'),

		webp: (data) => [
			data,
			`import { DecodedImage, EncodedImage, getWebpSize as rect } from '../transform/utils.js'`,
			`export { rect }`,
			`export const ext = 'webp'`,
			`export const type = 'image/webp'`,
		].join('\n'),

		wp2: (data) => [
			data,
			`import { DecodedImage, EncodedImage } from '../transform/utils.js'`,
			`export const rect = (data) => { const { width, height } = decode(data); return { width, height } }`,
			`export const ext = 'wp2'`,
			`export const type = 'image/webp2'`,
		].join('\n'),
	}

	// create directories for each codec
	// ========================================

	/** @type {Promise<void>[]} */
	const awaitDirs = []

	await fs.rm(cwd.goto(`../dist/`), { force: true, recursive: true })

	for (let codec of ['avif', 'jxl', 'jpg', 'png', 'webp', 'wp2', 'transform']) {
		awaitDirs.push(
			fs.mkdir(cwd.goto(`../dist/${codec}/`), { recursive: true })
		)
	}

	await Promise.all(awaitDirs)

	// copy thread javascript into each codec
	// ========================================

	/** @type {Promise<void>[]} */
	const awaitThreadJs = []

	for (let codec of ['avif', 'jpg', 'jxl', 'png', 'webp', 'wp2']) {
		awaitThreadJs.push(
			fs.cp(
				cwd.goto(`templates/thread.js`),
				cwd.goto(`../dist/${codec}/thread.js`)
			)
		)
	}

	await Promise.all(awaitThreadJs)

	// copy codecs and options into each codec
	// ========================================

	/** @type {Promise<void>[]} */
	const awaitCodecSources = []

	const encodeOptions = {
		png: '{\n\tlevel: 2,\n}'
	}

	for (let codec of ['avif', 'jpg', 'jxl', 'webp', 'wp2']) {
		for (let type of ['dec', 'enc']) {
			awaitCodecSources.push(
				fs.cp(
					cwd.goto(`.build/squoosh-dev/codecs/${adjustedDirName(codec)}/${type}/${adjustedFileName(`${codec}_${type}`)}.wasm`),
					cwd.goto(`../dist/${codec}/${codec}-${type}.wasm`)
				),
				fs.cp(
					cwd.goto(`.build/squoosh-dev/codecs/${adjustedDirName(codec)}/${type}/${adjustedFileName(`${codec}_${type}`)}.js`),
					cwd.goto(`../dist/${codec}/${codec}-${type}.js`)
				),
				fs.readFile(
					cwd.goto(`.build/squoosh-dev/src/features/encoders/${adjustedFeatName(codec)}/shared/meta.ts`),
					'utf-8'
				).then(
					(data) => {
						encodeOptions[codec] = data.replace(
							/^[\W\w]+EncodeOptions = /, ''
						).replace(
							/;\s*$/, ''
						).replace(
							/\n  /g, '\n\t'
						).replace(
							/AVIFTune\.auto/, '0'
						).replace(
							/Csp\.kYCoCg/, '0'
						).replace(
							/MozJpegColorSpace\.YCbCr/, '3'
						).replace(
							/UVMode\.UVModeAuto/, '3'
						)
					}
				)
			)
		}
	}

	// copy png codec and options into png codec
	// ========================================

	awaitCodecSources.push(
		fs.cp(
			cwd.goto(`.build/squoosh-dev/codecs/png/pkg/squoosh_png_bg.wasm`),
			cwd.goto(`../dist/png/png-enc-dec.wasm`)
		),
		fs.readFile(
			cwd.goto(`.build/squoosh-dev/codecs/png/pkg/squoosh_png.js`),
			'utf-8'
		).then(
			(data) => {
				const program = JS.parse(data)

				buildCodecPng(program)

				return fs.writeFile(
					cwd.goto(`../dist/png/png-enc-dec.js`),
					JS.stringify(program)
				)
			}
		),
		fs.cp(
			cwd.goto(`.build/squoosh-dev/codecs/oxipng/pkg/squoosh_oxipng_bg.wasm`),
			cwd.goto(`../dist/png/png-optimize.wasm`)
		),
		fs.readFile(
			cwd.goto(`.build/squoosh-dev/codecs/oxipng/pkg/squoosh_oxipng.js`),
			'utf-8'
		).then(
			(data) => {
				const program = JS.parse(data)

				buildCodecPng(program)

				return fs.writeFile(
					cwd.goto(`../dist/png/png-optimize.js`),
					JS.stringify(program)
				)
			}
		),
		fs.cp(
			cwd.goto(`.build/squoosh-dev/codecs/resize/pkg/squoosh_resize_bg.wasm`),
			cwd.goto(`../dist/transform/resize/resize.wasm`)
		),
		fs.readFile(
			cwd.goto(`.build/squoosh-dev/codecs/resize/pkg/squoosh_resize.js`),
			'utf-8'
		).then(
			(data) => {
				const program = JS.parse(data)

				buildCodecPng(program)

				return fs.writeFile(
					cwd.goto(`../dist/transform/resize/resize.js`),
					JS.stringify(program)
				)
			}
		),
		fs.cp(
			cwd.goto(`templates/codec.resize.js`),
			cwd.goto(`../dist/transform/resize/codec.js`)
		),
		fs.cp(
			cwd.goto(`templates/thread.resize.js`),
			cwd.goto(`../dist/transform/resize/thread.js`)
		),
		fs.cp(
			cwd.goto(`.build/squoosh-dev/codecs/rotate/rotate.wasm`),
			cwd.goto(`../dist/transform/rotate/rotate.wasm`)
		)
	)

	await Promise.all(awaitCodecSources)

	// copy codec script into each codec
	// ========================================

	/** @type {Promise<void>[]} */
	const awaitCodecScripts = []

	const template = await fs.readFile(cwd.goto('templates/codec.js'), 'utf-8')

	for (let codec of ['avif', 'jpg', 'jxl', 'webp', 'wp2']) {
		for (let type of ['dec', 'enc']) {
			awaitCodecScripts.push(
				fs.readFile(
					cwd.goto(`../dist/${codec}/${codec}-${type}.js`),
					'utf-8'
				).then(
					code => {
						const program = JS.parse(code)

						buildCodec(program)

						return fs.writeFile(
							cwd.goto(`../dist/${codec}/${codec}-${type}.js`),
							JS.stringify(program)
						)
					}
				)
			)
		}
		awaitCodecScripts.push(
			fs.writeFile(
				cwd.goto(`../dist/${codec}/codec.js`),
				transforms[codec](
					template.replace(
						/__type__/g, codec
					).replace(
						/__opts__/g, encodeOptions[codec]
					).replace(
						/__test__/g, detections[codec].split(',').join(', ')
					)
				)
			)
		)
	}

	// copy png codec script into the png codec
	// ========================================

	awaitCodecScripts.push(
		fs.writeFile(
			cwd.goto(`../dist/png/codec.js`),
			await fs.readFile(cwd.goto('templates/codec.png.js'), 'utf-8').then(
				data => transforms.png(
					data.replace(
						/__opts__/g, encodeOptions.png
					).replace(
						/__test__/g, detections.png.split(',').join(', ')
					)
				)
			)
		)
	)

	await Promise.all(awaitCodecScripts)

	// copy source into the dist directory
	// ========================================

	const awaitSource = []

	awaitSource.push(
		fs.cp(
			cwd.goto(`src/`),
			cwd.goto(`../dist/`),
			{
				force: true,
				recursive: true,
			}
		)
	)

	await Promise.all(awaitSource)

	// copy blurhash into the dist directory
	// ========================================

	const blurhash = cwd.goto('../node_modules/blurhash/dist/esm/')
	const blurdist = cwd.goto('../dist/transform/blurhash/')

	for (const file of await fs.readdir(blurhash)) {
		if (file.endsWith('.js') && file !== 'index.js') {
			fs.writeFile(
				blurdist.goto(file),
				await fs.readFile(
					blurhash.goto(file),
					'utf-8'
				).then(
					code => code.replace(/^(import [^\n]+)";/mg, '$1.js";\n')
				)
			)
		}
	}

	// await fs.rm(cwd.goto('.build'), { force: true, recursive: true })
	// await fs.rm(cwd.goto('.build.zip'), { force: true, recursive: true })
}

// run setup then build
// ========================================

setup().then(build)
