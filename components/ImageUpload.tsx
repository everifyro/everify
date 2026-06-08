'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

export type ExtractedData = {
  text: string
  email: string | null
  iban: string | null
  link: string | null
  cui: string | null
  conversatie: string | null
}

type Props = {
  onExtracted: (data: ExtractedData) => void
  context: 'job' | 'url' | 'iban' | 'ai'
}

const MAX_IMAGES = 4

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ImageUpload({ onExtracted, context }: Props) {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [extracted, setExtracted] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    const slots = MAX_IMAGES - images.length
    if (slots <= 0) return
    const toAdd = arr.slice(0, slots)
    const base64s = await Promise.all(toAdd.map(fileToBase64))
    setImages(prev => [...prev, ...base64s].slice(0, MAX_IMAGES))
    setExtracted(null)
    setError('')
  }, [images.length])

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const imageItems = Array.from(items).filter(it => it.type.startsWith('image/'))
      if (!imageItems.length) return
      const files = imageItems.map(it => it.getAsFile()).filter(Boolean) as File[]
      if (files.length) addFiles(files)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [addFiles])

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setExtracted(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  const extract = async () => {
    if (!images.length) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/extract-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, context }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setExtracted(data.text || '')
      onExtracted(data)
    } catch {
      setError('Eroare la extragere. Încercați din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 10 }}>

      {/* Drop zone */}
      <div
        onClick={() => !images.length && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#0ea5e9' : 'rgba(30,41,59,0.15)'}`,
          borderRadius: 10,
          padding: images.length ? '10px 12px' : '14px 12px',
          background: isDragging ? 'rgba(14,165,233,0.06)' : 'rgba(248,250,252,0.8)',
          transition: 'border-color 0.2s, background 0.2s',
          cursor: images.length < MAX_IMAGES ? 'pointer' : 'default',
        }}
      >
        {images.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>📷</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(30,41,59,0.6)', margin: 0 }}>
                Adaugă imagini — captură ecran, poză anunț, conversație
              </p>
              <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.4)', margin: '2px 0 0' }}>
                Click, Ctrl+V sau trage fișiere. Max {MAX_IMAGES} imagini.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {images.map((src, i) => (
              <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(30,41,59,0.15)', display: 'block' }}
                />
                <button
                  onClick={e => { e.stopPropagation(); removeImage(i) }}
                  style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, padding: 0, lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                style={{ width: 56, height: 56, borderRadius: 6, border: '2px dashed rgba(14,165,233,0.4)', background: 'rgba(14,165,233,0.06)', color: '#0ea5e9', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                +
              </button>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files) { addFiles(e.target.files); e.target.value = '' } }}
      />

      {/* Extract button + GDPR */}
      {images.length > 0 && !extracted && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 10 }}>
          <p style={{ fontSize: 10, color: 'rgba(30,41,59,0.4)', margin: 0, lineHeight: 1.4 }}>
            🔒 Imaginile sunt procesate temporar și nu sunt stocate.
          </p>
          <button
            onClick={extract}
            disabled={loading}
            style={{ flexShrink: 0, background: loading ? 'rgba(14,165,233,0.4)' : 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Se extrage...
              </>
            ) : '📄 Extrage text din imagini'}
          </button>
        </div>
      )}

      {/* GDPR note when no images */}
      {images.length === 0 && (
        <p style={{ fontSize: 10, color: 'rgba(30,41,59,0.4)', margin: '4px 0 0', lineHeight: 1.4 }}>
          🔒 Imaginile sunt procesate temporar și nu sunt stocate.
        </p>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Extracted preview */}
      {extracted !== null && (
        <div style={{ marginTop: 8, background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#0ea5e9', margin: '0 0 4px', letterSpacing: 0.3 }}>
            ✅ Am citit din imagine:
          </p>
          <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.75)', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>
            {extracted || '(niciun text detectat)'}
          </p>
          <p style={{ fontSize: 10, color: 'rgba(30,41,59,0.4)', margin: '4px 0 0' }}>
            Câmpurile de mai sus au fost completate automat — verificați și corectați dacă e necesar.
          </p>
        </div>
      )}

    </div>
  )
}
