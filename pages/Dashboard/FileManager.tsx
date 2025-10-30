"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

interface User {
  _id: string;
  email: string;
  name: string;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  updated_at: string;
}

export default function FileManager() {
  const [user, setUser] = useState<User | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [userFiles, setUserFiles] = useState<UploadedFile[]>([])
  const [storageStats, setStorageStats] = useState({
    totalCount: 0,
    totalSize: 0
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserData(token)
    }
  }, [])

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        // Cargar archivos del usuario después de obtener sus datos
        fetchUserFiles(data.user._id)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const getUserFolder = (userId: string): string => {
    return `user-${userId}`
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    setFiles(selectedFiles)
    setError(null)
  }

  const uploadFiles = async () => {
    if (!files || !user) {
      setError("Please select files to upload.")
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    const bucketName = "llakaScriptBucket"
    const userFolder = getUserFolder(user._id)

    try {
      // Crear carpeta de usuario si no existe
      try {
        await supabase.storage.from(bucketName).upload(`${userFolder}/.keep`, new Blob([]), { 
          upsert: true 
        })
      } catch (error) {
        // Ignorar error si ya existe
        console.log('Folder might already exist')
      }

      const totalFiles = files.length
      let uploadedCount = 0

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i]
        
        // Validar tamaño del archivo
        if (file.size > 10 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is 10MB.`)
          continue
        }

        const filePath = `${userFolder}/${file.name}`

        try {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, { 
              upsert: true,
              cacheControl: '3600'
            })

          if (error) {
            if (error.message.includes('The resource was not found')) {
              throw new Error('Storage bucket not found.')
            }
            throw error
          }

          uploadedCount++
          const currentProgress = Math.round(((i + 1) / totalFiles) * 100)
          setUploadProgress(currentProgress)

        } catch (err) {
          console.error("Error uploading file:", err)
          const errorMessage = `Error uploading ${file.name}: ${err instanceof Error ? err.message : String(err)}`
          setError(errorMessage)
          break
        }
      }

      if (uploadedCount > 0) {
        // Refrescar lista de archivos
        fetchUserFiles(user._id)
        alert(`Successfully uploaded ${uploadedCount} file(s)!`)
      }

    } catch (err) {
      console.error("Upload error:", err)
      setError("Error uploading files. Please try again.")
    } finally {
      setUploading(false)
      // Limpiar input de archivos
      setFiles(null)
    }
  }

  const fetchUserFiles = async (userId: string) => {
    try {
      const userFolder = getUserFolder(userId)
      
      // Listar SOLO los archivos de la carpeta del usuario actual
      const { data, error } = await supabase.storage
        .from("llakaScriptBucket")
        .list(userFolder)

      if (error) {
        // Si la carpeta no existe, no hay archivos
        if (error.message.includes('not found')) {
          setUserFiles([])
          setStorageStats({ totalCount: 0, totalSize: 0 })
          return
        }
        throw error
      }

      // Filtrar archivos del sistema (como .keep)
      const userFilesData = data.filter(file => file.name !== '.keep')
      
      // Obtener URLs públicas y información completa
      const filesWithUrls: UploadedFile[] = await Promise.all(
        userFilesData.map(async (file) => {
          const filePath = `${userFolder}/${file.name}`
          const { data: urlData } = supabase.storage
            .from("llakaScriptBucket")
            .getPublicUrl(filePath)

          return {
            name: file.name,
            url: urlData.publicUrl,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'unknown',
            updated_at: file.updated_at
          }
        })
      )

      setUserFiles(filesWithUrls)
      
      // Calcular estadísticas
      const totalCount = filesWithUrls.length
      const totalSize = filesWithUrls.reduce((acc, file) => acc + file.size, 0)
      setStorageStats({ totalCount, totalSize })

    } catch (err) {
      console.error('Error fetching user files:', err)
      setUserFiles([])
      setStorageStats({ totalCount: 0, totalSize: 0 })
    }
  }

  const deleteFile = async (fileName: string) => {
    if (!user || !confirm('Are you sure you want to delete this file?')) return

    try {
      const userFolder = getUserFolder(user._id)
      const filePath = `${userFolder}/${fileName}`

      const { error } = await supabase.storage
        .from("llakaScriptBucket")
        .remove([filePath])

      if (error) throw error

      // Remover del estado local
      setUserFiles(prev => prev.filter(file => file.name !== fileName))
      
      // Actualizar estadísticas
      const deletedFile = userFiles.find(f => f.name === fileName)
      if (deletedFile) {
        setStorageStats(prev => ({
          totalCount: prev.totalCount - 1,
          totalSize: prev.totalSize - deletedFile.size
        }))
      }

      alert('File deleted successfully!')
    } catch (err) {
      console.error('Error deleting file:', err)
      setError('Error deleting file. Please try again.')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileName: string): string => {
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) return '🖼️'
    if (fileName.match(/\.(pdf)$/i)) return '📄'
    if (fileName.match(/\.(doc|docx)$/i)) return '📝'
    if (fileName.match(/\.(xls|xlsx|csv)$/i)) return '📊'
    if (fileName.match(/\.(zip|rar|7z|tar|gz)$/i)) return '📦'
    if (fileName.match(/\.(txt|rtf|md)$/i)) return '📄'
    if (fileName.match(/\.(mp4|avi|mov|wmv|flv)$/i)) return '🎥'
    if (fileName.match(/\.(mp3|wav|flac|aac)$/i)) return '🎵'
    return '📁'
  }

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || 'file'
    return extension.toUpperCase()
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '10px' }}>TimeChest File Manager</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Your personal secure file storage</p>

      {/* User Folder Info */}
      {user && (
        <div style={{ 
          background: '#e8f4fd', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #b3d9ff'
        }}>
          <p style={{ margin: 0, color: '#0066cc' }}>
            <strong>Your private storage:</strong> <code>user-{user._id}</code>
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#0066cc', opacity: 0.8 }}>
            Only you can access files in this folder
          </p>
        </div>
      )}

      {/* Storage Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '20px', 
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Total Files</h3>
          <p style={{ fontSize: '2em', margin: 0, fontWeight: 'bold' }}>
            {storageStats.totalCount}
          </p>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
          padding: '20px', 
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Storage Used</h3>
          <p style={{ fontSize: '1.5em', margin: 0, fontWeight: 'bold' }}>
            {formatFileSize(storageStats.totalSize)}
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '25px', 
        borderRadius: '10px',
        border: '2px dashed #dee2e6',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>Upload Files</h3>
        
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          style={{ 
            marginBottom: '15px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            width: '100%',
            maxWidth: '400px'
          }}
        />

        {uploading && (
          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#495057' }}>
              Uploading... {uploadProgress}%
            </p>
            <div style={{
              width: '100%',
              background: '#e9ecef',
              borderRadius: '8px',
              overflow: 'hidden',
              height: '10px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #007bff, #0056b3)',
                transition: 'width 0.3s ease',
                borderRadius: '8px'
              }} />
            </div>
          </div>
        )}

        <button
          onClick={uploadFiles}
          disabled={uploading || !files}
          style={{
            background: uploading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: (uploading || !files) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>

        <p style={{ fontSize: '0.8em', color: '#6c757d', margin: '10px 0 0 0' }}>
          Max 10MB per file • All file types supported
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #ffcdd2'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{error}</p>
          <button 
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#c62828',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginTop: '8px',
              fontSize: '12px'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Files List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#333', margin: 0 }}>Your Files</h2>
          <div style={{ 
            background: '#e9ecef', 
            padding: '6px 12px', 
            borderRadius: '15px',
            fontSize: '12px',
            color: '#495057',
            fontWeight: '500'
          }}>
            {userFiles.length} {userFiles.length === 1 ? 'file' : 'files'}
          </div>
        </div>

        {userFiles.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            background: '#f8f9fa', 
            borderRadius: '10px',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{ fontSize: '3em', marginBottom: '15px' }}>📂</div>
            <h3 style={{ color: '#6c757d', margin: '0 0 8px 0' }}>No files yet</h3>
            <p style={{ color: '#6c757d', margin: 0 }}>
              Upload your first file to get started
            </p>
          </div>
        ) : (
          <div style={{ 
            background: 'white', 
            borderRadius: '10px', 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    borderBottom: '1px solid #dee2e6',
                    color: '#495057',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>File</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    borderBottom: '1px solid #dee2e6',
                    color: '#495057',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>Size</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    borderBottom: '1px solid #dee2e6',
                    color: '#495057',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>Modified</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    color: '#495057',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userFiles.map((file, index) => (
                  <tr 
                    key={file.name} 
                    style={{ 
                      borderBottom: index < userFiles.length - 1 ? '1px solid #f1f3f4' : 'none'
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2em' }}>
                          {getFileIcon(file.name)}
                        </span>
                        <div>
                          <div style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                            {file.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6c757d' }}>
                            {getFileType(file.name)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#495057', fontSize: '13px' }}>
                      {formatFileSize(file.size)}
                    </td>
                    <td style={{ padding: '12px', color: '#6c757d', fontSize: '12px' }}>
                      {formatDate(file.updated_at)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            textDecoration: 'none',
                            fontWeight: '500'
                          }}
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteFile(file.name)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Info */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        textAlign: 'center',
        color: '#6c757d',
        fontSize: '12px'
      }}>
        <p style={{ margin: 0 }}>
          <strong>🔒 Secure Storage:</strong> Your files are private and only accessible through your account
        </p>
      </div>
    </div>
  )
}