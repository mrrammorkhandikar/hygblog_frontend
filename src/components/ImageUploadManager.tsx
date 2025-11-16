'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react'

interface ImageUploadManagerProps {
  onImageUpload?: (file: File, url: string) => void
  onImageRemove?: (url: string) => void
  maxFileSize?: number // in bytes
  allowedTypes?: string[]
  multiple?: boolean
  existingImages?: string[]
  className?: string
  uploadEndpoint?: string
  showPreview?: boolean
  disabled?: boolean
}

interface UploadedImage {
  file?: File
  url: string
  name: string
  size?: number
  uploading?: boolean
  error?: string
}

const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  onImageUpload,
  onImageRemove,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  multiple = false,
  existingImages = [],
  className = '',
  uploadEndpoint = '/images',
  showPreview = true,
  disabled = false
}) => {
  const [images, setImages] = useState<UploadedImage[]>(
    existingImages.map(url => ({
      url,
      name: url.split('/').pop() || 'Unknown',
      uploading: false
    }))
  )
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`
    }
    
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024))
      return `File size exceeds ${maxSizeMB}MB limit`
    }
    
    return null
  }

  const uploadFile = async (file: File): Promise<string> => {
    const token = localStorage.getItem('adminToken')
    const formData = new FormData()
    
    // Use correct field name based on endpoint
    const fieldName = uploadEndpoint === '/image-upload/title' ? 'titleImage' : 'image'
    formData.append(fieldName, file)

    const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8080'}${uploadEndpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Upload failed: ${response.status}`)
    }

    const data = await response.json()
    return data.data?.url || data.url
  }

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return

    const fileArray = Array.from(files)
    const filesToProcess = multiple ? fileArray : fileArray.slice(0, 1)

    for (const file of filesToProcess) {
      const validationError = validateFile(file)
      
      if (validationError) {
        // Add file with error
        const errorImage: UploadedImage = {
          file,
          url: '',
          name: file.name,
          size: file.size,
          uploading: false,
          error: validationError
        }
        
        setImages(prev => multiple ? [...prev, errorImage] : [errorImage])
        continue
      }

      // Add file with uploading state
      const uploadingImage: UploadedImage = {
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        uploading: true
      }

      setImages(prev => multiple ? [...prev, uploadingImage] : [uploadingImage])

      try {
        const uploadedUrl = await uploadFile(file)
        
        setImages(prev => prev.map(img => 
          img.file === file 
            ? { ...img, url: uploadedUrl, uploading: false }
            : img
        ))

        onImageUpload?.(file, uploadedUrl)
      } catch (error) {
        setImages(prev => prev.map(img => 
          img.file === file 
            ? { ...img, uploading: false, error: error instanceof Error ? error.message : 'Upload failed' }
            : img
        ))
      }
    }
  }, [disabled, multiple, maxFileSize, allowedTypes, uploadEndpoint, onImageUpload])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const imageToRemove = images[index]
    setImages(prev => prev.filter((_, i) => i !== index))
    
    if (imageToRemove.url && !imageToRemove.file) {
      onImageRemove?.(imageToRemove.url)
    }
    
    // Clean up object URL if it was created locally
    if (imageToRemove.file && imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {dragActive ? 'Drop files here' : 'Upload Images'}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs text-gray-400">
          Supported formats: {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} 
          • Max size: {Math.round(maxFileSize / (1024 * 1024))}MB
          {multiple && ' • Multiple files allowed'}
        </p>
      </div>

      {/* Image Previews */}
      {showPreview && images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            {multiple ? 'Uploaded Images' : 'Uploaded Image'}
          </h4>
          <div className={`grid gap-4 ${multiple ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {image.error ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p className="text-xs text-center px-2">{image.error}</p>
                    </div>
                  ) : (
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Loading Overlay */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                  
                  {/* Success Indicator */}
                  {!image.uploading && !image.error && image.url && (
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Image Info */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-900 truncate" title={image.name}>
                    {image.name}
                  </p>
                  {image.size && (
                    <p className="text-xs text-gray-500">
                      {formatFileSize(image.size)}
                    </p>
                  )}
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploadManager