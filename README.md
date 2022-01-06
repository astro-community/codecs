# Codecs

**Codecs** lets you use read, write, and edit different image formats.

```shell
npm install @astropub/codecs
```

## Usage

```js
import * as fs from 'node:fs/promises'
import * as codecs from '@astropub/codecs'

/** Decoded JPG. */
const image = await codecs.jpg.decode(
  await fs.readFile(
    new URL('./kitten.jpg', import.meta.url)
  )
)

image.data // UUint8ClampedArray of the decoded JPG
image.width // Width of the decoded JPG
image.height // Height of the decoded JPG

// WebP encode the image
await fs.writeFile(
  new URL('./kitten.webp', import.meta.url),
  await codecs.webp.encode(image, image.width, image.height)
)
```

Individual exports are also available.

```js
import * as avif from '@astropub/codecs/avif'
import * as jpg from '@astropub/codecs/jpg'
import * as jxl from '@astropub/codecs/jxl'
import * as png from '@astropub/codecs/png'
import * as webp from '@astropub/codecs/webp'
import * as wp2 from '@astropub/codecs/wp2'
import * as resize from '@astropub/codecs/resize'
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
