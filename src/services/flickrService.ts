export interface FlickrPhoto {
  id: string
  title: string
  url: string
  thumbnail: string
  link: string
  farm: string
  server: string
  secret: string
}

// Flickr API configuration
const FLICKR_API_KEY = 'bec64c9c0f28889dc6e0c5ef7be3511f'
const FLICKR_USER_ID = '60827818@N07'

export class FlickrService {
  async getPhotos(limit: number = 20): Promise<FlickrPhoto[]> {
    try {
      // Use JSONP to bypass CORS - Flickr supports this natively
      const data = await this.fetchWithJsonp(limit)

      if (data.stat !== 'ok' || !data.photos?.photo) {
        return []
      }

      return data.photos.photo.slice(0, limit).map((photo: any): FlickrPhoto => {
        const id = photo.id || ''
        const title = photo.title || 'HeatSync Labs Photo'
        const farm = photo.farm || ''
        const server = photo.server || ''
        const secret = photo.secret || ''

        // Build URLs using Flickr's URL structure
        const baseUrl = `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}`

        return {
          id,
          title,
          url: `${baseUrl}_b.jpg`, // Large size
          thumbnail: `${baseUrl}_m.jpg`, // Medium size for thumbnails
          link: `https://www.flickr.com/photos/hslphotosync/${id}/in/photostream`,
          farm,
          server,
          secret
        }
      })
    } catch (error) {
      console.error('Failed to fetch Flickr photos:', error)
      return []
    }
  }

  private fetchWithJsonp(limit: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Generate unique callback name
      const callbackName = `flickrCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`
      let completed = false
      let timeoutId: number | null = null
      let scriptElement: HTMLScriptElement | null = null

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId)
        if ((window as any)[callbackName]) {
          delete (window as any)[callbackName]
        }
        if (scriptElement && scriptElement.parentNode) {
          scriptElement.parentNode.removeChild(scriptElement)
        }
      }

      // Set up the callback function
      ;(window as any)[callbackName] = (data: any) => {
        if (!completed) {
          completed = true
          cleanup()
          resolve(data)
        }
      }

      // Create script element
      scriptElement = document.createElement('script')
      scriptElement.src = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${FLICKR_API_KEY}&user_id=${encodeURIComponent(FLICKR_USER_ID)}&tags=publish&format=json&jsoncallback=${callbackName}&per_page=${limit}`

      scriptElement.onerror = () => {
        // Only reject if the callback hasn't already succeeded
        if (!completed) {
          completed = true
          cleanup()
          reject(new Error('Failed to load Flickr API'))
        }
      }

      // Add timeout (30 seconds to account for slow Flickr API)
      timeoutId = window.setTimeout(() => {
        if (!completed) {
          completed = true
          cleanup()
          reject(new Error('Flickr API request timed out'))
        }
      }, 30000)

      // Execute the request
      document.head.appendChild(scriptElement)
    })
  }
}
