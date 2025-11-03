import type { Area } from 'react-easy-crop'

// Pour recadrer et rogner la photo de profil
export default function getCroppedImg(imageSrc: string, crop: Area): Promise<File> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = imageSrc
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        image.onload = () => {
        const { width, height, x, y } = crop
        canvas.width = width
        canvas.height = height

        if (!ctx) {
            reject(new Error('Canvas context not available'))
            return
        }

        ctx.drawImage(image, x, y, width, height, 0, 0, width, height)

        canvas.toBlob((blob) => {
            if (blob) {
            const file = new File([blob], 'cropped-avatar.jpeg', { type: 'image/jpeg' })
            resolve(file)
            } else {
            reject(new Error('Failed to create blob'))
            }
        }, 'image/jpeg')
        }

        image.onerror = () => reject(new Error('Failed to load image'))
    })
}

