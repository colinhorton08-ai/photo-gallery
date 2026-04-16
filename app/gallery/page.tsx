'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Lightbox from '@/components/Lightbox'

interface Photo {
  src: string
  name: string
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/photos')
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos ?? []))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false))
  }, [])

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevPhoto = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i))
  }, [])
  const nextPhoto = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i))
  }, [photos.length])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-800/60 bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur">
        <h1 className="text-lg font-semibold tracking-tight text-white">Gallery</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            Upload
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-1.5 text-sm text-neutral-400 transition hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-8 sm:px-6">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-600 border-t-white" />
          </div>
        )}

        {!loading && photos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-4 text-5xl">📂</div>
            <p className="text-neutral-400">No photos yet.</p>
            <Link
              href="/upload"
              className="mt-4 rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
            >
              Upload your first photo
            </Link>
          </div>
        )}

        {!loading && photos.length > 0 && (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
            {photos.map((photo, index) => (
              <div
                key={photo.src}
                className="masonry-item mb-3 cursor-pointer overflow-hidden rounded-lg bg-neutral-900"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={photo.src}
                  alt={photo.name}
                  loading="lazy"
                  decoding="async"
                  className="block w-full object-cover transition hover:opacity-90"
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </div>
  )
}
