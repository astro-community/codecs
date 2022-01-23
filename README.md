# Codecs

**Codecs** lets you use read, write, edit, and analyze images.

```shell
npm install @astropub/codecs
```



## Usage

```js
import * as fs from 'node:fs/promises'
import * as codecs from '@astropub/codecs'

// load the JPG image
const image = await codecs.load(
	await fs.readFile('./kitten.jpg')
)

image.type   // string representing the image type ('image/jpeg')
image.data   // Uint8Array representing the image data
image.width  // number representing the image width
image.height // number representing the image height
image.ext    // string representing the image extension ('jpg')

const decoded = await image.decode()

decoded.data   // Uint8ClampedArray representing the decoded image data
decoded.width  // number representing the decoded image width
decoded.height // number representing the decoded image height

// encode the image as Avif & WebP, at 320, 640, & 960
for (const size of [ 320, 640, 960 ]) {
	const resized = await decoded.resize({ width: size })

	for (const type of [ 'image/avif', 'image/webp' ]) {
		const encoded = await resized.encode(type, { quality: 80 })

		encoded.type   // string representing the encoded image type ('image/webp')
		encoded.data   // Uint8Array representing the encoded image data
		encoded.width  // number representing the encoded image width (320 | 640 | 960)
		encoded.height // number representing the encoded image height
		encoded.ext    // string representing the encoded image extension ('webp')

		await fs.writeFile(`./kitten-${size}.${encoded.ext}`, encoded.data)
	}
}
```



## API



### `load`

The `load` function returns a loaded image. It accepts a string path, file URL, Buffer, Response, or TypedArray.

```js
const image = await codecs.load('./kitten.jpg')

image.type   // string representing the image type ('image/jpeg')
image.data   // Uint8Array representing the image data
image.width  // number representing the image width
image.height // number representing the image height
image.ext    // string representing the image extension ('jpg')
```



### `decode`

The `decode` function returns a decoded image. It accepts a Buffer or TypedArray.

```js
const buffer = await fs.readFile('./kitten.jpg')

const decoded = await codecs.decode(buffer)

decoded.data   // Uint8ClampedArray representing the decoded image data
decoded.width  // number representing the decoded image width
decoded.height // number representing the decoded image height
```

Individual decoders are available for `avif`, `jpg`, `jxl`, `png`, `webp`, and `wp2`.

```js
import * as codecs from '@astropub/codecs'

codecs.avif.decode(await fs.readFile('./kitten.avif'))
codecs.jpg.decode(await fs.readFile('./kitten.jpg'))
codecs.jxl.decode(await fs.readFile('./kitten.jxl'))
codecs.png.decode(await fs.readFile('./kitten.png'))
codecs.webp.decode(await fs.readFile('./kitten.webp'))
codecs.wp2.decode(await fs.readFile('./kitten.wp2'))
```



### `encode`

The `encode` function returns an encoded image. It accepts a decoded image.

```js
const encodedImage = await codecs.encode(decoded, 'image/webp', { quality: 80 })

encoded.type   // string representing the encoded image type ('image/webp')
encoded.data   // Uint8Array representing the encoded image data
encoded.width  // number representing the encoded image width (320 | 640 | 960)
encoded.height // number representing the encoded image height
encoded.ext    // string representing the encoded image extension ('webp')

await fs.writeFile('./kitten.webp', encodedImage)
```

Individual encoders are available for `avif`, `jpg`, `jxl`, `png`, `webp`, and `wp2`.

```js
import * as codecs from '@astropub/codecs'

codecs.avif.encode(decoded)
codecs.jpg.encode(decoded)
codecs.jxl.encode(decoded)
codecs.png.encode(decoded)
codecs.webp.encode(decoded)
codecs.wp2.encode(decoded)
```



### `resize`

The `resize` function returns a resized image. It accepts a decoded image.

```js
const resized = await codecs.resize(decoded, { width: 320 })

resized.data   // Uint8ClampedArray representing the resized image data
resized.width  // number representing the resized image width
resized.height // number representing the resized image height
```

If not specified, the resized `height` will be determined from the `width` using the formula `width / naturalWidth * naturalHeight`.



### `blur`

The `blur` function returns a blurred image. It accepts a decoded image.

```js
const blurred = await codecs.blur(decoded, { radius: 30 })
```



### `blurhash`

The `blurhash` function returns a blurhashed image, using the [Wolt BlurHash algorithm](https://github.com/woltapp/blurhash/blob/master/Algorithm.md). It accepts a decoded image.

```js
const blurhashed = await decoded.blurhash({ width: 32 })
```

If not specified, the `height` will be determined from the image width using the formula `width / naturalWidth * naturalHeight`.



### `type`

The `type` function returns the content type for an image buffer. It accepts a Buffer or TypedArray.

```js
// 'image/jpeg'
const type = await codecs.type(buffer)
```



### `ext`

The `ext` function returns the file extension for an image buffer. It accepts a Buffer or TypedArray.

```js
// 'jpg'
const ext = await codecs.ext(buffer)
```



### `DecodedImage`

The `DecodedImage` class represents raw, decoded image data.

```js
const decoded = new DecodedImage(
	data   // Uint8ClampedArray
	width  // number
	height // number
)
```



### `DecodedImage#encode`

The `encode` function of `DecodedImage` returns a promised encoded image from the current decoded image.

```js
const encoded = await decoded.encoded('image/webp') // EncodedImage<'image/web', Uint8Array>
```



### `DecodedImage#blur`

The `blur` function of `DecodedImage` returns a promised blurred image from the current decoded image.
```js
const blurred = await decoded.blur({ radius: 30 }) // DecodedImage
```



### `DecodedImage#blurhash`

The `blurhash` function of `DecodedImage` returns a promised blurhashed image from the current decoded image.
```js
const blurhash = await decoded.blurhash({ radius: 30 }) // DecodedImage
```



### `DecodedImage#resize`

The `resize` function of `DecodedImage` returns a promised resized image from the current decoded image.
```js
const resized = await decoded.resize({ width: 320 }) // DecodedImage
```



### `DecodedImage#color`

The `color` property of `DecodedImage` returns the dominant color in the decoded image.

```js
decoded.color // [ 57, 52, 43 ]
```



### `EncodedImage`

The `EncodedImage` class represents analyzed, encoded image data.

```js
const encoded = new EncodedImage(
	type   // string ('image/avif' | 'image/gif' | 'image/jpeg' | 'image/jxl' | 'image/png' | 'image/svg+xml' | 'image/webp' | 'image/webp2')
	data   // Uint8Array
	width  // number
	height // number
)
```



### `EncodedImage#decode`

The `decode` function of `EncodedImage` returns a promised decoded image from the current encoded image.

```js
const decoded = await encoded.decoded()
```



## Types



### `ImageType`

The `ImageType` type represents known image content types.

```js
import type { ImageType } from '@astropub/codecs'

// 'image/avif' | 'image/gif' | 'image/jpeg' | 'image/jxl' | 'image/png' | 'image/svg+xml' | 'image/webp' | 'image/webp2'
ImageType
```



### `ImageType`

The `ImageType` type represents known image content types.

```js
import type { ImageType } from '@astropub/codecs'

// 'image/avif' | 'image/gif' | 'image/jpeg' | 'image/jxl' | 'image/png' | 'image/svg+xml' | 'image/webp' | 'image/webp2'
ImageType
```



## License

**Codecs** is generally a remix of [Squoosh!](https://github.com/GoogleChromeLabs/squoosh). 

Code original to this project is licensed under the CC0-1.0 License.

Code from [Squoosh!](https://github.com/GoogleChromeLabs/squoosh) is licensed under the Apache-2.0 License, copyright Google Inc.

Code from [Avif Encoder](https://github.com/AOMediaCodec/libavif) is licensed under the BSD License, copyright Joe Drago.

Code from [MozJPEG](https://github.com/GoogleChromeLabs/squoosh/blob/12889d9d503a325e78823a8ebc48b54d4c2b9124/codecs/mozjpeg/LICENSE.codec.md) is licensed under the Modified (3-clause) BSD License, copyright Viktor Szathmáry.

Code from [JXL](https://github.com/GoogleChromeLabs/squoosh/tree/023304803f988ae39b98f95a369bed4f6f000953/codecs/jxl) is licensed under the Apache-2.0 License, copyright Google Inc.

Code from [OxiPNG](https://github.com/shssoichiro/oxipng) is licensed under the MIT License, copyright Joshua Holmer.

Code from [WebP](https://github.com/webmproject/libwebp) is licensed under the Modified (3-clause) BSD License, copyright Google Inc.

Code from [WebP2](https://github.com/GoogleChromeLabs/squoosh/tree/89105bbb22e6247e568af97250477268d7284d11/codecs/wp2) is licensed under the Apache-2.0 License, copyright Google Inc.

Code from [blurhash](https://github.com/woltapp/blurhash) is licensed under the MIT License, copyright Olli Mahlamäki.
