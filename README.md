# Codecs

**Codecs** lets you use read, write, and edit different image formats.

```shell
npm install @astropub/codecs
```



## Usage

```js
import * as fs from 'node:fs/promises'
import * as codecs from '@astropub/codecs'

// decode the JPG image
const image = await codecs.jpg.decode(
  await fs.readFile('./kitten.jpg')
)

image.data // Uint8ClampedArray of the decoded JPG
image.width // Width of the decoded JPG
image.height // Height of the decoded JPG

// encode the image as Avif & WebP, at 320, 640, & 960
for (const size of [ 320, 640, 960 ]) {
  const resized = await codecs.resize(image, { width: size })

  for (const type of [ 'avif', 'webp' ]) {
    const encoded = await codecs[type].encode(resized, { quality: 80 })

    await fs.writeFile(`./kitten-${size}.${type}`, encoded)
  }
}
```



## API



### `decode`

Decodes the given image file to a raw image format.

```js
const imageFile = await fs.readFile('./kitten.jpg')

// { data: Uint8ClampedArray, width: number, height: number }
const imageData = await codecs.jpg.decode(imageFile)
```

Decoders are available for `avif`, `jpg`, `jxl`, `png`, `webp`, and `wp2`.



### `encode`

Encodes the given image data to an encoded image format.

```js
// Uint8Array
const encodeU8A = await codecs.webp.encode(imageData)

await fs.writeFile('./kitten.webp', encodeU8A)
```

Encoders are available for `avif`, `jpg`, `jxl`, `png`, `webp`, and `wp2`.



### `resize`

Resizes the given image data and returns new image data.

```js
// { data: Uint8ClampedArray, width: number, height: number }
const sizedData = await codecs.resize(imageData, { width: 320 })
```

If not specified, the `height` will be determined from the image width using the formula `Math.round(width / imageData.width * imageData.height)`.



### `blur`

Blurs an image and returns new image data.

```js
// { data: Uint8ClampedArray, width: number, height: number }
const blurImageData = await codecs.blur(imageData, { radius: 30 })
```



### `blurhash`

Encodes or decodes image data using the [Wolt BlurHash algorithm](https://github.com/woltapp/blurhash/blob/master/Algorithm.md).

```js
// { data: string, width: number, height: number }
const blurhash = await codecs.blurhash.encode(imageData)

// { data: Uint8ClampedArray, width: number, height: number }
const blurhashImageData = await codecs.blurhash.decode(blurhash, { width: 32 })
```

If not specified, the `height` will be determined from the image width using the formula `Math.round(width / imageData.width * imageData.height)`.



### `getType`

Returns the content type of an image file.

```js
// "image/jpeg"
const imageType = await codecs.getType(imageFile)
```



### `getExtension`

Returns the extension of an image file.

```js
// "jpg"
const imageExtension = await codecs.getExtension(imageFile)
```



## License

**Codecs** is a remix of [Squoosh!](https://github.com/GoogleChromeLabs/squoosh). 

Code original to this project is licensed under the CC0-1.0 License.

Code from [Squoosh!](https://github.com/GoogleChromeLabs/squoosh) is licensed under the Apache-2.0 License, Copyright Google Inc.

Code from [Avif Encoder](https://github.com/AOMediaCodec/libavif) is licensed under the BSD License (BSD), Copyright Joe Drago.

Code from [MozJPEG](https://github.com/GoogleChromeLabs/squoosh/blob/12889d9d503a325e78823a8ebc48b54d4c2b9124/codecs/mozjpeg/LICENSE.codec.md) is licensed under the Modified (3-clause) BSD License (BSD), Copyright Viktor Szathmáry.

Code from [JXL](https://github.com/GoogleChromeLabs/squoosh/tree/023304803f988ae39b98f95a369bed4f6f000953/codecs/jxl) is licensed under the Apache-2.0 License, Copyright Google Inc.

Code from [OxiPNG](https://github.com/shssoichiro/oxipng) is licensed under the MIT License (MIT), Copyright Joshua Holmer.

Code from [WebP](https://github.com/webmproject/libwebp) is licensed under the Modified (3-clause) BSD License (BSD), Copyright Google Inc.

Code from [WebP2](https://github.com/GoogleChromeLabs/squoosh/tree/89105bbb22e6247e568af97250477268d7284d11/codecs/wp2) is licensed under the Apache-2.0 License, Copyright Google Inc.

Code from [blurhash](https://github.com/woltapp/blurhash) is licensed under the MIT License, Copyright Olli Mahlamäki.
