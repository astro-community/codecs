import './lib/URL.js'
import './lib/polyfill.js'
import * as fs from 'node:fs/promises'
import * as JS from './lib/JS.js'
import AdmZip from 'adm-zip'
import { build as buildPng } from './transforms/png.js'
import { build as buildAll } from './transforms/all.js'

const cwd = URL.from(import.meta.url).goto('./')

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

	const createDirs = []

	await fs.rm(cwd.goto(`../dist/`), { force: true, recursive: true })

	for (let codec of ['avif', 'jxl', 'jpg', 'png', 'webp', 'wp2', 'resize', 'rotate']) {
		createDirs.push(
			fs.mkdir(cwd.goto(`../dist/${codec}/`), { recursive: true })
		)
	}

	await Promise.all(createDirs)

	const copyThreads = []

	for (let codec of ['avif', 'jpg', 'jxl', 'png', 'webp', 'wp2']) {
		copyThreads.push(
			fs.cp(
				cwd.goto(`templates/thread.js`),
				cwd.goto(`../dist/${codec}/thread.js`)
			)
		)
	}

	await copyThreads

	const copyFiles = []

	const encodeOptions = {}

	for (let codec of ['avif', 'jpg', 'jxl', 'webp', 'wp2']) {
		for (let type of ['dec', 'enc']) {
			copyFiles.push(
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

	copyFiles.push(
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

				buildPng(program)
				
				return fs.writeFile(
					cwd.goto(`../dist/png/png-enc-dec.js`),
					JS.stringify(program)
				)
			}
		),
		fs.cp(
			cwd.goto(`.build/squoosh-dev/codecs/resize/pkg/squoosh_resize_bg.wasm`),
			cwd.goto(`../dist/resize/resize.wasm`)
		),
		fs.readFile(
			cwd.goto(`.build/squoosh-dev/codecs/resize/pkg/squoosh_resize.js`),
			'utf-8'
		).then(
			(data) => {
				const program = JS.parse(data)

				buildPng(program)
				
				return fs.writeFile(
					cwd.goto(`../dist/resize/resize.js`),
					JS.stringify(program)
				)
			}
		),
		fs.cp(
			cwd.goto(`templates/resize.js`),
			cwd.goto(`../dist/resize/codec.js`)
		),
		fs.cp(
			cwd.goto(`templates/resize-thread.js`),
			cwd.goto(`../dist/resize/thread.js`)
		),
		fs.cp(
			cwd.goto(`.build/squoosh-dev/codecs/rotate/rotate.wasm`),
			cwd.goto(`../dist/rotate/rotate.wasm`)
		)
	)

	await Promise.all(copyFiles)

	const readFiles = []

	const template = await fs.readFile(cwd.goto('templates/all.js'), 'utf-8')

	for (let codec of ['avif', 'jpg', 'jxl', 'webp', 'wp2']) {
		for (let type of ['dec', 'enc']) {
			readFiles.push(
				fs.readFile(
					cwd.goto(`../dist/${codec}/${codec}-${type}.js`),
					'utf-8'
				).then(
					code => {
						const program = JS.parse(code)

						buildAll(program)

						return fs.writeFile(
							cwd.goto(`../dist/${codec}/${codec}-${type}.js`),
							JS.stringify(program)
						)
					}
				),
				fs.writeFile(
					cwd.goto(`../dist/${codec}/codec.js`),
					template.replace(
						/__type__/g, codec
					).replace(
						/__opts__/g, encodeOptions[codec]
					).replace(
						/__test__/g, detections[codec].split(',').join(', ')
					)
				)
			)
		}
	}

	readFiles.push(
		fs.writeFile(
			cwd.goto(`../dist/png/codec.js`),
			await fs.readFile(cwd.goto('templates/png.js'), 'utf-8')
		)
	)

	const actions = []

	actions.push(
		fs.cp(
			cwd.goto(`src/`),
			cwd.goto(`../dist/`),
			{
				force: true,
				recursive: true,
			}
		)
	)

	await Promise.all(readFiles)
	await Promise.all(actions)

	// await fs.rm(cwd.goto('.build'), { force: true, recursive: true })
	// await fs.rm(cwd.goto('.build.zip'), { force: true, recursive: true })
}

setup().then(build)