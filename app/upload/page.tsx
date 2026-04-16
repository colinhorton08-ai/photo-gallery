'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import Link from 'next/link'

interface UploadFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic']

function isAccepted(file: File): boolean {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext)
}

export default function UploadPage() {
  const [uploads, setUploads] = useState<UploadFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [allDone, setAllDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const valid = arr.filter(isAccepted)
    const invalid = arr.filter((f) => !isAccepted(f))

    if (invalid.length > 0) {
      alert(`Skipped unsupported file(s): ${invalid.map((f) => f.name).join(', ')}`)
    }

    if (valid.length === 0) return

    const newUploads: UploadFile[] = valid.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }))

    setUploads((prev) => [...prev, ...newUploads])
    setAllDone(false)
    uploadFiles(newUploads)
  }

  async function uploadFiles(items: UploadFile[]) {
    for (const item of items) {
      setUploads((prev) =>
        prev.map((u) => (u.file === item.file ? { ...u, status: 'uploading', progress: 10 } : u))
      )

      try {
        const formData = new FormData()
        formData.append('files', item.file)

        // Simulate progress via polling
        const progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === item.file && u.status === 'uploading' && u.progress < 85
                ? { ...u, progress: u.progress + 15 }
                : u
            )
          )
        }, 200)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (res.ok) {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === item.file ? { ...u, status: 'done', progress: 100 } : u
            )
          )
        } else {
          const data = await res.json()
          setUploads((prev) =>
            prev.map((u) =>
              u.file === item.file
                ? { ...u, status: 'error', error: data.error || 'Upload failed' }
                : u
            )
          )
        }
      } catch {
        setUploads((prev) =>
          prev.map((u) =>
            u.file === item.file ? { ...u, status: 'error', error: 'Network error' } : u
          )
        )
      }
    }

    setAllDone(true)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  function clearAll() {
    setUploads([])
    setAllDone(false)
  }

  const hasUploads = uploads.length > 0
  const doneCount = uploads.filter((u) => u.status === 'done').length

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-800/60 bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur">
        <h1 className="text-lg font-semibold tracking-tight text-white">Upload Photos</h1>
        <Link
          href="/gallery"
          className="text-sm text-neutral-400 transition hover:text-white"
        >
          ← Back to Gallery
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-16 text-center transition ${
            dragOver
              ? 'border-white bg-white/5 text-white'
              : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className="mb-3 text-4xl">📁</div>
          <p className="text-base font-medium">
            {dragOver ? 'Drop to upload' : 'Drag & drop photos here'}
          </p>
          <p className="mt-1 text-sm">or click to browse</p>
          <p className="mt-3 text-xs text-neutral-600">JPG, PNG, WebP, HEIC supported</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.heic,image/jpeg,image/png,image/webp,image/heic"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload list */}
        {hasUploads && (
          <div className="mt-8 space-y-3">
            {uploads.map((u, i) => (
              <div key={i} className="rounded-lg bg-neutral-900 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="truncate text-sm text-neutral-200">{u.file.name}</span>
                  <span className="shrink-0 text-xs">
                    {u.status === 'done' && <span className="text-green-400">Done</span>}
                    {u.status === 'error' && <span className="text-red-400">Failed</span>}
                    {u.status === 'uploading' && (
                      <span className="text-neutral-400">{u.progress}%</span>
                    )}
                    {u.status === 'pending' && (
                      <span className="text-neutral-500">Queued</span>
                    )}
                  </span>
                </div>

                {(u.status === 'uploading' || u.status === 'done') && (
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        u.status === 'done' ? 'bg-green-500' : 'bg-white'
                      }`}
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}

                {u.status === 'error' && u.error && (
                  <p className="mt-1 text-xs text-red-400">{u.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Success message */}
        {allDone && doneCount > 0 && (
          <div className="mt-6 rounded-lg bg-green-950 px-5 py-4 text-center">
            <p className="font-medium text-green-400">
              {doneCount === 1
                ? '1 photo uploaded successfully!'
                : `${doneCount} photos uploaded successfully!`}
            </p>
            <div className="mt-3 flex justify-center gap-3">
              <Link
                href="/gallery"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
              >
                View Gallery
              </Link>
              <button
                onClick={clearAll}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:border-neutral-500"
              >
                Upload More
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
