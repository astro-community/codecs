interface ImageLike {}

interface BitmapImage<W extends number = number, H extends number = number, S extends number = number> extends ImageLike {
	readonly data: Uint8ClampedArray & ArrayLike<S>
	readonly size: S
	readonly width: W
	readonly height: H
}

interface EncodedImage<T extends string = string, W extends number = number, H extends number = number, S extends number = number> extends ImageLike {
	readonly data: Uint8Array & ArrayLike<S>
	readonly size: S
	readonly type: T
	readonly width: W
	readonly height: H
}
