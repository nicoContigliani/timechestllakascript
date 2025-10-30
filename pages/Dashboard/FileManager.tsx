// "use client"
// import { useState, useEffect } from "react"
// import { supabase } from "../../lib/supabase"
// import { ZipService } from "../../services/zipService"

// interface User {
//   _id: string;
//   email: string;
//   name: string;
// }

// interface UploadedFile {
//   name: string;
//   url: string;
//   size: number;
//   type: string;
//   updated_at: string;
//   isZipped?: boolean;
// }

// export default function FileManager() {
//   const [user, setUser] = useState<User | null>(null)
//   const [files, setFiles] = useState<FileList | null>(null)
//   const [uploading, setUploading] = useState(false)
//   const [compressing, setCompressing] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [uploadProgress, setUploadProgress] = useState(0)
//   const [userFiles, setUserFiles] = useState<UploadedFile[]>([])
//   const [storageStats, setStorageStats] = useState({
//     totalCount: 0,
//     totalSize: 0
//   })
//   const [downloadPassword, setDownloadPassword] = useState("")
//   const [showDownloadModal, setShowDownloadModal] = useState(false)
//   const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)

//   useEffect(() => {
//     const token = localStorage.getItem('token')
//     if (token) {
//       fetchUserData(token)
//     }
//   }, [])

//   const fetchUserData = async (token: string) => {
//     try {
//       const response = await fetch('/api/user', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       })

//       const data = await response.json()
//       if (data.success) {
//         setUser(data.user)
//         fetchUserFiles(data.user._id)
//       }
//     } catch (error) {
//       console.error('Error fetching user data:', error)
//     }
//   }

//   const getUserFolder = (userId: string): string => {
//     return `user-${userId}`
//   }

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFiles = event.target.files
//     setFiles(selectedFiles)
//     setError(null)
//   }

//   const compressAndUploadFiles = async () => {
//     if (!files || !user) {
//       setError("Please select files to upload.")
//       return
//     }

//     setCompressing(true)
//     setError(null)

//     try {
//       const filesArray = Array.from(files);

//       // Convertir files a base64 para enviar al backend
//       const filesWithData = await Promise.all(
//         filesArray.map(async (file) => ({
//           name: file.name,
//           type: file.type,
//           data: await file.arrayBuffer()
//         }))
//       );

//       const userPassword = await getUserPassword();

//       const response = await fetch('/api/files/create-protected-zip', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify({
//           files: filesWithData,
//           password: userPassword,
//           userId: user._id
//         }),
//       });

//       const result = await response.json();

//       if (!result.success) {
//         throw new Error(result.message);
//       }

//       // El backend debería devolver la URL del ZIP creado
//       // o podrías subirlo desde el backend directamente a Supabase

//     } catch (err) {
//       console.error("Compression error:", err)
//       setError(`Error comprimiendo archivos: ${err instanceof Error ? err.message : String(err)}`)
//     } finally {
//       setCompressing(false)
//     }
//   }

//   const getUserPassword = async (): Promise<string> => {
//     try {
//       const token = localStorage.getItem('token')
//       const response = await fetch('/api/user/password', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       })

//       const data = await response.json()
//       if (data.success) {
//         return data.passwordHash
//       }
//       throw new Error('No se pudo obtener la contraseña')
//     } catch (error) {
//       console.error('Error getting password:', error)
//       // Fallback: usar el ID del usuario como contraseña
//       return user?._id || 'default-password'
//     }
//   }

//   const uploadZipFile = async (zipFile: File) => {
//     if (!user) return

//     setUploading(true)
//     setUploadProgress(0)

//     const bucketName = "llakaScriptBucket"
//     const userFolder = getUserFolder(user._id)

//     try {
//       // Crear carpeta de usuario si no existe
//       try {
//         await supabase.storage.from(bucketName).upload(`${userFolder}/.keep`, new Blob([]), {
//           upsert: true
//         })
//       } catch (error) {
//         // Ignorar error si ya existe
//       }

//       const filePath = `${userFolder}/${zipFile.name}`

//       const { data, error } = await supabase.storage
//         .from(bucketName)
//         .upload(filePath, zipFile, {
//           upsert: true,
//           cacheControl: '3600'
//         })

//       if (error) throw error

//       setUploadProgress(100)

//       // Refrescar lista de archivos
//       setTimeout(() => {
//         fetchUserFiles(user._id)
//         alert('Archivos comprimidos y subidos exitosamente!')
//       }, 500)

//     } catch (err) {
//       console.error("Upload error:", err)
//       setError(`Error subiendo archivo: ${err instanceof Error ? err.message : String(err)}`)
//     } finally {
//       setUploading(false)
//       setFiles(null)
//     }
//   }

//   const fetchUserFiles = async (userId: string) => {
//     try {
//       const userFolder = getUserFolder(userId)

//       const { data, error } = await supabase.storage
//         .from("llakaScriptBucket")
//         .list(userFolder)

//       if (error) {
//         if (error.message.includes('not found')) {
//           setUserFiles([])
//           setStorageStats({ totalCount: 0, totalSize: 0 })
//           return
//         }
//         throw error
//       }

//       const userFilesData = data.filter(file => file.name !== '.keep')

//       const filesWithUrls: UploadedFile[] = await Promise.all(
//         userFilesData.map(async (file) => {
//           const filePath = `${userFolder}/${file.name}`
//           const { data: urlData } = supabase.storage
//             .from("llakaScriptBucket")
//             .getPublicUrl(filePath)

//           return {
//             name: file.name,
//             url: urlData.publicUrl,
//             size: file.metadata?.size || 0,
//             type: file.metadata?.mimetype || 'unknown',
//             updated_at: file.updated_at,
//             isZipped: file.name.endsWith('.zip')
//           }
//         })
//       )

//       setUserFiles(filesWithUrls)

//       const totalCount = filesWithUrls.length
//       const totalSize = filesWithUrls.reduce((acc, file) => acc + file.size, 0)
//       setStorageStats({ totalCount, totalSize })

//     } catch (err) {
//       console.error('Error fetching user files:', err)
//       setUserFiles([])
//       setStorageStats({ totalCount: 0, totalSize: 0 })
//     }
//   }

//   const downloadFile = async (file: UploadedFile) => {
//     if (file.isZipped) {
//       setSelectedFile(file)
//       setShowDownloadModal(true)
//       return
//     }

//     // Descarga normal para archivos no comprimidos
//     window.open(file.url, '_blank')
//   }

//   const handleDownloadWithPassword = async () => {
//     if (!selectedFile || !downloadPassword || !user) return

//     try {
//       // Descargar el archivo ZIP
//       const response = await fetch(selectedFile.url)
//       const zipBlob = await response.blob()

//       // Obtener la contraseña correcta
//       const correctPassword = await getUserPassword()

//       if (downloadPassword !== correctPassword) {
//         throw new Error("Contraseña incorrecta")
//       }

//       // Extraer archivos del ZIP usando tu servicio
//       const extractedFiles = await ZipService.extractZip(zipBlob)

//       // Descargar cada archivo extraído
//       extractedFiles.forEach(file => {
//         const url = URL.createObjectURL(file)
//         const a = document.createElement('a')
//         a.href = url
//         a.download = file.name
//         document.body.appendChild(a)
//         a.click()
//         document.body.removeChild(a)
//         URL.revokeObjectURL(url)
//       })

//       setShowDownloadModal(false)
//       setDownloadPassword("")
//       setSelectedFile(null)

//       alert('Archivos extraídos y descargados exitosamente!')

//     } catch (err) {
//       console.error('Download error:', err)
//       setError(`Error descargando archivos: ${err instanceof Error ? err.message : String(err)}`)
//     }
//   }

//   const deleteFile = async (fileName: string) => {
//     if (!user || !confirm('Are you sure you want to delete this file?')) return

//     try {
//       const userFolder = getUserFolder(user._id)
//       const filePath = `${userFolder}/${fileName}`

//       const { error } = await supabase.storage
//         .from("llakaScriptBucket")
//         .remove([filePath])

//       if (error) throw error

//       setUserFiles(prev => prev.filter(file => file.name !== fileName))

//       const deletedFile = userFiles.find(f => f.name === fileName)
//       if (deletedFile) {
//         setStorageStats(prev => ({
//           totalCount: prev.totalCount - 1,
//           totalSize: prev.totalSize - deletedFile.size
//         }))
//       }

//       alert('File deleted successfully!')
//     } catch (err) {
//       console.error('Error deleting file:', err)
//       setError('Error deleting file. Please try again.')
//     }
//   }

//   const formatFileSize = (bytes: number): string => {
//     if (bytes === 0) return '0 Bytes'
//     const k = 1024
//     const sizes = ['Bytes', 'KB', 'MB', 'GB']
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
//   }

//   const formatDate = (dateString: string): string => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   const getFileIcon = (fileName: string): string => {
//     if (fileName.endsWith('.zip')) return '📦'
//     if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) return '🖼️'
//     if (fileName.match(/\.(pdf)$/i)) return '📄'
//     if (fileName.match(/\.(doc|docx)$/i)) return '📝'
//     if (fileName.match(/\.(xls|xlsx|csv)$/i)) return '📊'
//     if (fileName.match(/\.(txt|rtf|md)$/i)) return '📄'
//     if (fileName.match(/\.(mp4|avi|mov|wmv|flv)$/i)) return '🎥'
//     if (fileName.match(/\.(mp3|wav|flac|aac)$/i)) return '🎵'
//     return '📁'
//   }

//   const getFileType = (fileName: string): string => {
//     if (fileName.endsWith('.zip')) return 'ZIP PROTEGIDO'
//     const extension = fileName.split('.').pop()?.toLowerCase() || 'file'
//     return extension.toUpperCase()
//   }

//   // Load user files on component mount
//   useEffect(() => {
//     if (user) {
//       fetchUserFiles(user._id)
//     }
//   }, [user])

//   return (
//     <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
//       <h1 style={{ color: '#333', marginBottom: '10px' }}>TimeChest File Manager</h1>
//       <p style={{ color: '#666', marginBottom: '30px' }}>Almacenamiento seguro con compresión protegida</p>

//       {/* User Folder Info */}
//       {user && (
//         <div style={{
//           background: '#e8f4fd',
//           padding: '15px',
//           borderRadius: '8px',
//           marginBottom: '20px',
//           border: '1px solid #b3d9ff'
//         }}>
//           <p style={{ margin: 0, color: '#0066cc' }}>
//             <strong>Tu almacenamiento seguro:</strong> <code>user-{user._id}</code>
//           </p>
//           <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#0066cc', opacity: 0.8 }}>
//             Todos los archivos se comprimen y protegen con contraseña automáticamente
//           </p>
//         </div>
//       )}

//       {/* Storage Statistics */}
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//         gap: '15px',
//         marginBottom: '30px'
//       }}>
//         <div style={{
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           padding: '20px',
//           borderRadius: '10px',
//           color: 'white',
//           textAlign: 'center'
//         }}>
//           <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Archivos</h3>
//           <p style={{ fontSize: '2em', margin: 0, fontWeight: 'bold' }}>
//             {storageStats.totalCount}
//           </p>
//         </div>

//         <div style={{
//           background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
//           padding: '20px',
//           borderRadius: '10px',
//           color: 'white',
//           textAlign: 'center'
//         }}>
//           <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Almacenamiento</h3>
//           <p style={{ fontSize: '1.5em', margin: 0, fontWeight: 'bold' }}>
//             {formatFileSize(storageStats.totalSize)}
//           </p>
//         </div>
//       </div>

//       {/* Upload Section */}
//       <div style={{
//         background: '#f8f9fa',
//         padding: '25px',
//         borderRadius: '10px',
//         border: '2px dashed #dee2e6',
//         marginBottom: '30px',
//         textAlign: 'center'
//       }}>
//         <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>Subir Archivos Seguros</h3>
//         <p style={{ color: '#6c757d', marginBottom: '15px', fontSize: '14px' }}>
//           Los archivos se comprimirán y protegerán con contraseña automáticamente
//         </p>

//         <input
//           type="file"
//           multiple
//           onChange={handleFileChange}
//           disabled={uploading || compressing}
//           style={{
//             marginBottom: '15px',
//             padding: '10px',
//             border: '1px solid #ddd',
//             borderRadius: '6px',
//             width: '100%',
//             maxWidth: '400px'
//           }}
//         />

//         {(uploading || compressing) && (
//           <div style={{ marginBottom: '15px' }}>
//             <p style={{ margin: '0 0 8px 0', color: '#495057' }}>
//               {compressing ? 'Comprimiendo...' : 'Subiendo...'} {uploadProgress}%
//             </p>
//             <div style={{
//               width: '100%',
//               background: '#e9ecef',
//               borderRadius: '8px',
//               overflow: 'hidden',
//               height: '10px',
//               maxWidth: '400px',
//               margin: '0 auto'
//             }}>
//               <div style={{
//                 width: `${uploadProgress}%`,
//                 height: '100%',
//                 background: 'linear-gradient(90deg, #007bff, #0056b3)',
//                 transition: 'width 0.3s ease',
//                 borderRadius: '8px'
//               }} />
//             </div>
//           </div>
//         )}

//         <button
//           onClick={compressAndUploadFiles}
//           disabled={uploading || compressing || !files}
//           style={{
//             background: (uploading || compressing) ? '#6c757d' : '#007bff',
//             color: 'white',
//             border: 'none',
//             padding: '10px 20px',
//             borderRadius: '6px',
//             cursor: (uploading || compressing || !files) ? 'not-allowed' : 'pointer',
//             fontSize: '14px',
//             fontWeight: '500'
//           }}
//         >
//           {compressing ? 'Comprimiendo...' : (uploading ? 'Subiendo...' : 'Comprimir y Subir')}
//         </button>

//         <p style={{ fontSize: '0.8em', color: '#6c757d', margin: '10px 0 0 0' }}>
//           Máximo 10MB por archivo • Compresión protegida
//         </p>
//       </div>

//       {/* Error Display */}
//       {error && (
//         <div style={{
//           background: '#ffebee',
//           color: '#c62828',
//           padding: '12px',
//           borderRadius: '6px',
//           marginBottom: '20px',
//           border: '1px solid #ffcdd2'
//         }}>
//           <p style={{ margin: 0, fontWeight: 'bold' }}>{error}</p>
//           <button
//             onClick={() => setError(null)}
//             style={{
//               background: 'none',
//               border: 'none',
//               color: '#c62828',
//               textDecoration: 'underline',
//               cursor: 'pointer',
//               marginTop: '8px',
//               fontSize: '12px'
//             }}
//           >
//             Cerrar
//           </button>
//         </div>
//       )}

//       {/* Files List */}
//       <div>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <h2 style={{ color: '#333', margin: 0 }}>Tus Archivos</h2>
//           <div style={{
//             background: '#e9ecef',
//             padding: '6px 12px',
//             borderRadius: '15px',
//             fontSize: '12px',
//             color: '#495057',
//             fontWeight: '500'
//           }}>
//             {userFiles.length} {userFiles.length === 1 ? 'archivo' : 'archivos'}
//           </div>
//         </div>

//         {userFiles.length === 0 ? (
//           <div style={{
//             textAlign: 'center',
//             padding: '40px 20px',
//             background: '#f8f9fa',
//             borderRadius: '10px',
//             border: '2px dashed #dee2e6'
//           }}>
//             <div style={{ fontSize: '3em', marginBottom: '15px' }}>📂</div>
//             <h3 style={{ color: '#6c757d', margin: '0 0 8px 0' }}>No hay archivos</h3>
//             <p style={{ color: '#6c757d', margin: 0 }}>
//               Sube tu primer archivo protegido
//             </p>
//           </div>
//         ) : (
//           <div style={{
//             background: 'white',
//             borderRadius: '10px',
//             overflow: 'hidden',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//             border: '1px solid #e9ecef'
//           }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ background: '#f8f9fa' }}>
//                   <th style={{
//                     padding: '12px',
//                     textAlign: 'left',
//                     borderBottom: '1px solid #dee2e6',
//                     color: '#495057',
//                     fontWeight: '600',
//                     fontSize: '12px'
//                   }}>Archivo</th>
//                   <th style={{
//                     padding: '12px',
//                     textAlign: 'left',
//                     borderBottom: '1px solid #dee2e6',
//                     color: '#495057',
//                     fontWeight: '600',
//                     fontSize: '12px'
//                   }}>Tamaño</th>
//                   <th style={{
//                     padding: '12px',
//                     textAlign: 'left',
//                     borderBottom: '1px solid #dee2e6',
//                     color: '#495057',
//                     fontWeight: '600',
//                     fontSize: '12px'
//                   }}>Modificado</th>
//                   <th style={{
//                     padding: '12px',
//                     textAlign: 'center',
//                     borderBottom: '1px solid #dee2e6',
//                     color: '#495057',
//                     fontWeight: '600',
//                     fontSize: '12px'
//                   }}>Acciones</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {userFiles.map((file, index) => (
//                   <tr
//                     key={file.name}
//                     style={{
//                       borderBottom: index < userFiles.length - 1 ? '1px solid #f1f3f4' : 'none'
//                     }}
//                   >
//                     <td style={{ padding: '12px' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                         <span style={{ fontSize: '1.2em' }}>
//                           {getFileIcon(file.name)}
//                         </span>
//                         <div>
//                           <div style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
//                             {file.name}
//                           </div>
//                           <div style={{ fontSize: '11px', color: '#6c757d' }}>
//                             {getFileType(file.name)}
//                             {file.isZipped && ' 🔒'}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td style={{ padding: '12px', color: '#495057', fontSize: '13px' }}>
//                       {formatFileSize(file.size)}
//                     </td>
//                     <td style={{ padding: '12px', color: '#6c757d', fontSize: '12px' }}>
//                       {formatDate(file.updated_at)}
//                     </td>
//                     <td style={{ padding: '12px', textAlign: 'center' }}>
//                       <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
//                         <button
//                           onClick={() => downloadFile(file)}
//                           style={{
//                             background: file.isZipped ? '#ffc107' : '#28a745',
//                             color: 'white',
//                             border: 'none',
//                             padding: '6px 10px',
//                             borderRadius: '4px',
//                             cursor: 'pointer',
//                             fontSize: '11px',
//                             fontWeight: '500'
//                           }}
//                         >
//                           {file.isZipped ? '🔓 Descargar' : 'Descargar'}
//                         </button>
//                         <button
//                           onClick={() => deleteFile(file.name)}
//                           style={{
//                             background: '#dc3545',
//                             color: 'white',
//                             border: 'none',
//                             padding: '6px 10px',
//                             borderRadius: '4px',
//                             cursor: 'pointer',
//                             fontSize: '11px',
//                             fontWeight: '500'
//                           }}
//                         >
//                           Eliminar
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Download Modal */}
//       {showDownloadModal && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           background: 'rgba(0,0,0,0.5)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           zIndex: 1000
//         }}>
//           <div style={{
//             background: 'white',
//             padding: '20px',
//             borderRadius: '10px',
//             width: '90%',
//             maxWidth: '400px'
//           }}>
//             <h3 style={{ margin: '0 0 15px 0' }}>Descargar Archivo Protegido</h3>
//             <p style={{ margin: '0 0 15px 0', color: '#666' }}>
//               Ingresa tu contraseña para extraer los archivos de {selectedFile?.name}
//             </p>

//             <input
//               type="password"
//               placeholder="Tu contraseña"
//               value={downloadPassword}
//               onChange={(e) => setDownloadPassword(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '6px',
//                 marginBottom: '15px'
//               }}
//             />

//             <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
//               <button
//                 onClick={() => {
//                   setShowDownloadModal(false)
//                   setDownloadPassword("")
//                   setSelectedFile(null)
//                 }}
//                 style={{
//                   background: '#6c757d',
//                   color: 'white',
//                   border: 'none',
//                   padding: '8px 16px',
//                   borderRadius: '6px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 Cancelar
//               </button>
//               <button
//                 onClick={handleDownloadWithPassword}
//                 disabled={!downloadPassword}
//                 style={{
//                   background: '#007bff',
//                   color: 'white',
//                   border: 'none',
//                   padding: '8px 16px',
//                   borderRadius: '6px',
//                   cursor: downloadPassword ? 'pointer' : 'not-allowed'
//                 }}
//               >
//                 Descargar
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Security Info */}
//       <div style={{
//         marginTop: '30px',
//         padding: '15px',
//         background: '#f8f9fa',
//         borderRadius: '8px',
//         textAlign: 'center',
//         color: '#6c757d',
//         fontSize: '12px'
//       }}>
//         <p style={{ margin: 0 }}>
//           <strong>🔒 Almacenamiento Seguro:</strong> Todos los archivos se comprimen y protegen automáticamente
//         </p>
//       </div>
//     </div>
//   )
// }



"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { ZipService, FileData } from "../../services/zipService"

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
  isZipped?: boolean;
}

export default function FileManager() {
  const [user, setUser] = useState<User | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [userFiles, setUserFiles] = useState<UploadedFile[]>([])
  const [storageStats, setStorageStats] = useState({
    totalCount: 0,
    totalSize: 0
  })
  const [downloadPassword, setDownloadPassword] = useState("")
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)

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

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        fetchUserFiles(data.user._id)
      } else {
        throw new Error(data.message || 'Failed to fetch user data')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Error loading user data')
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

  const compressAndUploadFiles = async () => {
    if (!files || !user) {
      setError("Please select files to upload.");
      return;
    }

    setCompressing(true);
    setError(null);
    setUploadProgress(0);

    try {
      const filesArray = Array.from(files);
      console.log(`Processing ${filesArray.length} files`);

      // Verificar tamaño total de archivos
      const totalSize = filesArray.reduce((acc, file) => acc + file.size, 0);
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (totalSize > maxSize) {
        throw new Error(`Total file size exceeds 50MB limit. Current size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
      }

      setUploadProgress(10);

      // Preparar archivos para el backend usando ZipService
      const filesWithData = await ZipService.prepareFilesForBackend(filesArray);
      setUploadProgress(50);

      // Obtener la contraseña del usuario
      const userPassword = await getUserPassword();
      console.log('Using password for ZIP');
      setUploadProgress(70);

      // Llamar al endpoint del backend para crear el ZIP protegido
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos timeout

      const response = await fetch('/api/files/create-protected-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          files: filesWithData,
          password: userPassword,
          userId: user._id
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      setUploadProgress(90);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Unknown error from server');
      }

      setUploadProgress(100);

      // El backend ya subió el archivo a Supabase, actualizar la lista
      alert('Archivos comprimidos y subidos exitosamente!');
      // Esperar un poco antes de actualizar la lista
      setTimeout(() => {
        fetchUserFiles(user._id);
      }, 1000);

    } catch (err: any) {
      console.error("Compression error:", err);

      let errorMessage = 'Error comprimiendo archivos';
      if (err.name === 'AbortError') {
        errorMessage = 'La operación tardó demasiado tiempo. Intenta con menos archivos o más pequeños.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setCompressing(false);
      setFiles(null);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const getUserPassword = async (): Promise<string> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/password', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch password')
      }

      const data = await response.json()
      if (data.success) {
        return data.passwordHash
      }
      throw new Error('No se pudo obtener la contraseña')
    } catch (error) {
      console.error('Error getting password:', error)
      // Fallback: usar el ID del usuario como contraseña
      return user?._id || 'default-password'
    }
  }

  const fetchUserFiles = async (userId: string) => {
    try {
      const userFolder = getUserFolder(userId)

      const { data, error } = await supabase.storage
        .from("llakaScriptBucket")
        .list(userFolder)

      if (error) {
        if (error.message.includes('not found')) {
          setUserFiles([])
          setStorageStats({ totalCount: 0, totalSize: 0 })
          return
        }
        throw error
      }

      // Filtrar archivos vacíos o de sistema
      const userFilesData = data.filter(file =>
        file.name !== '.emptyFolderPlaceholder' &&
        !file.name.startsWith('.') &&
        file.name !== '.keep'
      )

      const filesWithUrls: UploadedFile[] = await Promise.all(
        userFilesData.map(async (file) => {
          const filePath = `${userFolder}/${file.name}`
          const { data: urlData } = supabase.storage
            .from("llakaScriptBucket")
            .getPublicUrl(filePath)

          // Obtener metadata adicional si está disponible
          const { data: metadata } = await supabase.storage
            .from("llakaScriptBucket")
            .getPublicUrl(filePath)

          return {
            name: file.name,
            url: urlData.publicUrl,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'unknown',
            updated_at: file.updated_at || file.created_at || new Date().toISOString(),
            isZipped: file.name.endsWith('.zip')
          }
        })
      )

      setUserFiles(filesWithUrls)

      const totalCount = filesWithUrls.length
      const totalSize = filesWithUrls.reduce((acc, file) => acc + file.size, 0)
      setStorageStats({ totalCount, totalSize })

    } catch (err) {
      console.error('Error fetching user files:', err)
      setError('Error loading files list')
      setUserFiles([])
      setStorageStats({ totalCount: 0, totalSize: 0 })
    }
  }

  const downloadFile = async (file: UploadedFile) => {
    if (file.isZipped) {
      setSelectedFile(file)
      setShowDownloadModal(true)
      return
    }

    // Descarga normal para archivos no comprimidos
    try {
      const response = await fetch(file.url)
      if (!response.ok) throw new Error('Failed to download file')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      setError('Error downloading file')
    }
  }

  const handleDownloadWithPassword = async () => {
    if (!selectedFile || !downloadPassword || !user) return

    try {
      // Descargar el archivo ZIP
      const response = await fetch(selectedFile.url)
      if (!response.ok) throw new Error('Failed to download file')

      const zipBlob = await response.blob()

      // Verificar la contraseña
      const correctPassword = await getUserPassword()

      if (downloadPassword !== correctPassword) {
        throw new Error("Contraseña incorrecta")
      }

      // Extraer archivos del ZIP
      const extractedFiles = await ZipService.extractZip(zipBlob)

      // Descargar cada archivo extraído
      extractedFiles.forEach(file => {
        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })

      setShowDownloadModal(false)
      setDownloadPassword("")
      setSelectedFile(null)

      alert('Archivos extraídos y descargados exitosamente!')

    } catch (err) {
      console.error('Download error:', err)
      setError(`Error descargando archivos: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const deleteFile = async (fileName: string) => {
    if (!user || !confirm('¿Estás seguro de que quieres eliminar este archivo?')) return

    try {
      const userFolder = getUserFolder(user._id)
      const filePath = `${userFolder}/${fileName}`

      const { error } = await supabase.storage
        .from("llakaScriptBucket")
        .remove([filePath])

      if (error) throw error

      // Actualizar estado local
      setUserFiles(prev => prev.filter(file => file.name !== fileName))

      // Actualizar estadísticas
      const deletedFile = userFiles.find(f => f.name === fileName)
      if (deletedFile) {
        setStorageStats(prev => ({
          totalCount: prev.totalCount - 1,
          totalSize: prev.totalSize - deletedFile.size
        }))
      }

      alert('Archivo eliminado exitosamente!')
    } catch (err) {
      console.error('Error deleting file:', err)
      setError('Error eliminando archivo. Por favor, intenta de nuevo.')
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
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileName: string): string => {
    if (fileName.endsWith('.zip')) return '📦'
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) return '🖼️'
    if (fileName.match(/\.(pdf)$/i)) return '📄'
    if (fileName.match(/\.(doc|docx)$/i)) return '📝'
    if (fileName.match(/\.(xls|xlsx|csv)$/i)) return '📊'
    if (fileName.match(/\.(txt|rtf|md)$/i)) return '📄'
    if (fileName.match(/\.(mp4|avi|mov|wmv|flv)$/i)) return '🎥'
    if (fileName.match(/\.(mp3|wav|flac|aac)$/i)) return '🎵'
    return '📁'
  }

  const getFileType = (fileName: string): string => {
    if (fileName.endsWith('.zip')) return 'ZIP PROTEGIDO'
    const extension = fileName.split('.').pop()?.toLowerCase() || 'file'
    return extension.toUpperCase()
  }

  // Load user files on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchUserFiles(user._id)
    }
  }, [user])

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '10px' }}>TimeChest File Manager</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Almacenamiento seguro con compresión protegida</p>

      {/* User Info */}
      {user && (
        <div style={{
          background: '#e8f4fd',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #b3d9ff'
        }}>
          <p style={{ margin: 0, color: '#0066cc' }}>
            <strong>Usuario:</strong> {user.email} | <strong>Carpeta:</strong> <code>user-{user._id}</code>
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
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Archivos</h3>
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
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Almacenamiento</h3>
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
        <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>Subir Archivos Seguros</h3>
        <p style={{ color: '#6c757d', marginBottom: '15px', fontSize: '14px' }}>
          Los archivos se comprimirán y protegerán con contraseña automáticamente
        </p>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={uploading || compressing}
          style={{
            marginBottom: '15px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            width: '100%',
            maxWidth: '400px'
          }}
        />

        {files && files.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: 0, color: '#495057', fontSize: '14px' }}>
              {files.length} archivo(s) seleccionado(s) - {formatFileSize(Array.from(files).reduce((acc, file) => acc + file.size, 0))}
            </p>
          </div>
        )}

        {(uploading || compressing) && (
          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#495057' }}>
              {compressing ? 'Comprimiendo...' : 'Subiendo...'} {uploadProgress}%
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
          onClick={compressAndUploadFiles}
          disabled={uploading || compressing || !files}
          style={{
            background: (uploading || compressing) ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: (uploading || compressing || !files) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            minWidth: '160px'
          }}
        >
          {compressing ? 'Comprimiendo...' : (uploading ? 'Subiendo...' : 'Comprimir y Subir')}
        </button>

        <p style={{ fontSize: '0.8em', color: '#6c757d', margin: '10px 0 0 0' }}>
          Máximo 50MB por lote • Compresión protegida
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
            Cerrar
          </button>
        </div>
      )}

      {/* Files List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#333', margin: 0 }}>Tus Archivos</h2>
          <div style={{
            background: '#e9ecef',
            padding: '6px 12px',
            borderRadius: '15px',
            fontSize: '12px',
            color: '#495057',
            fontWeight: '500'
          }}>
            {userFiles.length} {userFiles.length === 1 ? 'archivo' : 'archivos'}
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
            <h3 style={{ color: '#6c757d', margin: '0 0 8px 0' }}>No hay archivos</h3>
            <p style={{ color: '#6c757d', margin: 0 }}>
              Sube tu primer archivo protegido
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
                  }}>Archivo</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '1px solid #dee2e6',
                    color: '#495057',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>Tamaño</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '1px solid #dee2e6',
                    color: '#495057',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>Modificado</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    borderBottom: '1px solid #dee2e6',
                    color: '#495057',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {userFiles.map((file, index) => (
                  <tr
                    key={file.name}
                    style={{
                      borderBottom: index < userFiles.length - 1 ? '1px solid #f1f3f4' : 'none',
                      background: index % 2 === 0 ? '#fafafa' : 'white'
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
                            {file.isZipped && ' 🔒'}
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
                        <button
                          onClick={() => downloadFile(file)}
                          style={{
                            background: file.isZipped ? '#ffc107' : '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}
                        >
                          {file.isZipped ? '🔓 Descargar' : 'Descargar'}
                        </button>
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
                          Eliminar
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

      {/* Download Modal */}
      {showDownloadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Descargar Archivo Protegido</h3>
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>
              Ingresa tu contraseña para extraer los archivos de {selectedFile?.name}
            </p>

            <input
              type="password"
              placeholder="Tu contraseña"
              value={downloadPassword}
              onChange={(e) => setDownloadPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                marginBottom: '15px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDownloadModal(false)
                  setDownloadPassword("")
                  setSelectedFile(null)
                }}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDownloadWithPassword}
                disabled={!downloadPassword}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: downloadPassword ? 'pointer' : 'not-allowed'
                }}
              >
                Descargar
              </button>
            </div>
          </div>
        </div>
      )}

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
          <strong>🔒 Almacenamiento Seguro:</strong> Todos los archivos se comprimen y protegen automáticamente
        </p>
      </div>
    </div>
  )
}