import { DecodedImage, BlurHashImage, BlurHashOptions } from '../../codecs.d'

export { DecodedImage, BlurHashImage, BlurHashOptions }

/** Returns a new blurhash image from a given decoded image. */
export declare const blurhash: {
	<T extends DecodedImage = DecodedImage>(
		image: T,
		options?: Partial<BlurHashOptions>
	): BlurHashImage<string, T['data'], T['width'], T['height']>
} 
