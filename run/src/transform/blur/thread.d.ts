import { DecodedImage, BlurOptions } from '../../codecs.d'

export { DecodedImage, BlurOptions }

/** Returns a new blurred image from a given decoded image. */
export declare const blur: {
	<T extends DecodedImage = DecodedImage>(
		image: T,
		options?: Partial<BlurOptions>
	): Promise<DecodedImage<T['data'], T['width'], T['height']>>
} 
