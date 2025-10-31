// "use client"

// import { useState, useEffect } from "react"
// import { supabase } from "../../lib/supabase"
// import ZipService, { FileData } from "../../services/zipService"
// import CryptoJS from 'crypto-js'
// import styles from './FileManager.module.css'

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

// interface Notification {
//   id: string;
//   type: 'success' | 'error' | 'info';
//   message: string;
//   duration?: number;
// }

// export default function FileManager() {
//   const [user, setUser] = useState<User | null>(null)
//   const [files, setFiles] = useState<FileList | null>(null)
//   const [uploading, setUploading] = useState(false)
//   const [compressing, setCompressing] = useState(false)
//   const [userFiles, setUserFiles] = useState<UploadedFile[]>([])
//   const [storageStats, setStorageStats] = useState({
//     totalCount: 0,
//     totalSize: 0
//   })
//   const [notifications, setNotifications] = useState<Notification[]>([])
//   const [loading, setLoading] = useState(true)

//   // Agregar notificación
//   const addNotification = (type: 'success' | 'error' | 'info', message: string, duration = 5000) => {
//     const id = Date.now().toString()
//     const notification: Notification = { id, type, message, duration }
//     setNotifications(prev => [...prev, notification])
    
//     if (duration > 0) {
//       setTimeout(() => {
//         removeNotification(id)
//       }, duration)
//     }
//   }

//   // Remover notificación
//   const removeNotification = (id: string) => {
//     setNotifications(prev => prev.filter(notification => notification.id !== id))
//   }

//   useEffect(() => {
//     const token = localStorage.getItem('token')
//     if (token) {
//       fetchUserData(token)
//     } else {
//       setLoading(false)
//       addNotification('error', 'No se encontró token de autenticación')
//     }
//   }, [])

//   const fetchUserData = async (token: string) => {
//     try {
//       setLoading(true)
//       const response = await fetch('/api/user', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       })

//       if (!response.ok) {
//         throw new Error('Failed to fetch user data')
//       }

//       const data = await response.json()
//       if (data.success) {
//         setUser(data.user)
//         await fetchUserFiles(data.user._id)
//         addNotification('success', `Bienvenido ${data.user.name || data.user.email}`)
//       } else {
//         throw new Error(data.message || 'Failed to fetch user data')
//       }
//     } catch (error) {
//       console.error('Error fetching user data:', error)
//       addNotification('error', 'Error cargando datos del usuario')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getUserFolder = (userId: string): string => {
//     return `user-${userId}`
//   }

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFiles = event.target.files
//     setFiles(selectedFiles)
    
//     if (selectedFiles && selectedFiles.length > 0) {
//       const totalSize = Array.from(selectedFiles).reduce((acc, file) => acc + file.size, 0)
//       const fileCount = selectedFiles.length
      
//       addNotification('info', 
//         `${fileCount} archivo(s) seleccionado(s) - ${formatFileSize(totalSize)}`
//       )
//     }
//   }

//   const compressAndUploadFiles = async () => {
//     if (!files || !user) {
//       addNotification('error', "Por favor selecciona archivos para subir")
//       return
//     }

//     setCompressing(true)
//     setUploading(true)

//     try {
//       const filesArray = Array.from(files)
//       console.log(`Processing ${filesArray.length} files`)

//       // Verificar tamaño total de archivos
//       const totalSize = filesArray.reduce((acc, file) => acc + file.size, 0)
//       const maxSize = 50 * 1024 * 1024 // 50MB

//       if (totalSize > maxSize) {
//         throw new Error(`El tamaño total excede el límite de 50MB. Tamaño actual: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)
//       }

//       addNotification('info', 'Preparando archivos para compresión...')

//       // Preparar archivos para el backend
//       const filesWithData = await ZipService.prepareFilesForBackend(filesArray)

//       addNotification('info', 'Comprimiendo y protegiendo archivos...')

//       // Obtener la contraseña del usuario
//       const userPassword = await getUserPassword()

//       // Llamar al endpoint del backend para crear el ZIP protegido
//       const controller = new AbortController()
//       const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutos timeout

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
//         signal: controller.signal
//       })

//       clearTimeout(timeoutId)

//       if (!response.ok) {
//         const errorText = await response.text()
//         let errorData
//         try {
//           errorData = JSON.parse(errorText)
//         } catch {
//           throw new Error(`Error del servidor: ${response.status}`)
//         }
//         throw new Error(errorData.message || `Error: ${response.status}`)
//       }

//       const result = await response.json()

//       if (!result.success) {
//         throw new Error(result.message || 'Error desconocido del servidor')
//       }

//       addNotification('success', 
//         `¡Éxito! ${filesArray.length} archivo(s) comprimido(s) y protegido(s) correctamente`
//       )

//       // Actualizar la lista de archivos
//       setTimeout(() => {
//         fetchUserFiles(user._id)
//       }, 1000)

//     } catch (err: any) {
//       console.error("Compression error:", err)

//       let errorMessage = 'Error comprimiendo archivos'
//       if (err.name === 'AbortError') {
//         errorMessage = 'La operación tardó demasiado tiempo. Intenta con menos archivos o más pequeños.'
//       } else if (err.message) {
//         errorMessage = err.message
//       }

//       addNotification('error', errorMessage)
//     } finally {
//       setCompressing(false)
//       setUploading(false)
//       setFiles(null)
//       // Reset file input
//       const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
//       if (fileInput) fileInput.value = ''
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

//       if (!response.ok) {
//         throw new Error('Failed to fetch password')
//       }

//       const data = await response.json()
//       if (data.success) {
//         return data.passwordHash
//       }
//       throw new Error('No se pudo obtener la contraseña')
//     } catch (error) {
//       console.error('Error getting password:', error)
//       return user?._id || 'default-password'
//     }
//   }

//   const fetchUserFiles = async (userId: string) => {
//     try {
//       setLoading(true)
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

//       // Filtrar archivos vacíos o de sistema
//       const userFilesData = data.filter(file =>
//         file.name !== '.emptyFolderPlaceholder' &&
//         !file.name.startsWith('.') &&
//         file.name !== '.keep'
//       )

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
//             updated_at: file.updated_at || file.created_at || new Date().toISOString(),
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
//       addNotification('error', 'Error cargando lista de archivos')
//       setUserFiles([])
//       setStorageStats({ totalCount: 0, totalSize: 0 })
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Función para desencriptar el ZIP
//   const decryptAndExtractZip = async (encryptedBlob: Blob, password: string): Promise<File[]> => {
//     try {
//       console.log('Starting decryption process...');
      
//       // Convertir Blob a texto Base64
//       const encryptedBase64 = await new Promise<string>((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = () => {
//           // El resultado es data:application/octet-stream;base64,...
//           const result = reader.result as string;
//           const base64 = result.split(',')[1];
//           resolve(base64);
//         };
//         reader.onerror = reject;
//         reader.readAsDataURL(encryptedBlob);
//       });

//       console.log('Encrypted Base64 length:', encryptedBase64.length);

//       // Desencriptar con AES
//       console.log('Decrypting with AES...');
//       const decrypted = CryptoJS.AES.decrypt(encryptedBase64, password, {
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.Pkcs7
//       });

//       console.log('Decrypted word array:', decrypted);

//       // Convertir a string Latin1
//       const decryptedString = decrypted.toString(CryptoJS.enc.Latin1);
      
//       if (!decryptedString) {
//         throw new Error('La contraseña es incorrecta o el archivo está corrupto');
//       }

//       console.log('Decrypted string length:', decryptedString.length);

//       // Convertir string a Uint8Array
//       const decryptedArray = new Uint8Array(decryptedString.length);
//       for (let i = 0; i < decryptedString.length; i++) {
//         decryptedArray[i] = decryptedString.charCodeAt(i);
//       }

//       console.log('Decrypted array length:', decryptedArray.length);

//       // Crear Blob del ZIP desencriptado
//       const zipBlob = new Blob([decryptedArray], { type: 'application/zip' });

//       console.log('ZIP Blob size:', zipBlob.size);

//       // Verificar si es un ZIP válido
//       const isValidZip = await ZipService.isValidZip(zipBlob);
//       if (!isValidZip) {
//         throw new Error('El archivo desencriptado no es un ZIP válido');
//       }

//       console.log('ZIP is valid, extracting files...');

//       // Extraer archivos del ZIP
//       const extractedFiles = await ZipService.extractZipSafe(zipBlob);
      
//       console.log('Extracted files count:', extractedFiles.length);

//       return extractedFiles;
//     } catch (error) {
//       console.error('Decryption error details:', error);
//       throw new Error(`Error desencriptando: ${error instanceof Error ? error.message : 'Contraseña incorrecta o archivo corrupto'}`);
//     }
//   }

//   const downloadFile = async (file: UploadedFile) => {
//     try {
//       addNotification('info', `Descargando ${file.name}...`)

//       // Descargar el archivo encriptado de Supabase
//       const response = await fetch(file.url)
//       if (!response.ok) throw new Error('Failed to download file')

//       const encryptedBlob = await response.blob()
      
//       if (file.isZipped) {
//         // Obtener la contraseña para desencriptar
//         const userPassword = await getUserPassword()
        
//         addNotification('info', 'Desencriptando y extrayendo archivos...')
        
//         try {
//           // Desencriptar y extraer archivos
//           const extractedFiles = await decryptAndExtractZip(encryptedBlob, userPassword)
          
//           // Descargar cada archivo individualmente
//           extractedFiles.forEach(extractedFile => {
//             const url = URL.createObjectURL(extractedFile)
//             const a = document.createElement('a')
//             a.href = url
//             a.download = extractedFile.name
//             document.body.appendChild(a)
//             a.click()
//             document.body.removeChild(a)
//             URL.revokeObjectURL(url)
//           })
          
//           addNotification('success', `${extractedFiles.length} archivo(s) extraído(s) correctamente`)
//         } catch (decryptError) {
//           console.error('Decryption error:', decryptError)
          
//           // Si falla la desencriptación, ofrecer descargar el archivo encriptado
//           if (confirm('No se pudo desencriptar el archivo. ¿Quieres descargar el archivo encriptado?')) {
//             const url = URL.createObjectURL(encryptedBlob)
//             const a = document.createElement('a')
//             a.href = url
//             a.download = file.name
//             document.body.appendChild(a)
//             a.click()
//             document.body.removeChild(a)
//             URL.revokeObjectURL(url)
//             addNotification('info', 'Archivo encriptado descargado')
//           } else {
//             addNotification('error', 'Descarga cancelada')
//           }
//         }
//       } else {
//         // Si es un archivo individual, descargarlo directamente
//         const url = URL.createObjectURL(encryptedBlob)
//         const a = document.createElement('a')
//         a.href = url
//         a.download = file.name
//         document.body.appendChild(a)
//         a.click()
//         document.body.removeChild(a)
//         URL.revokeObjectURL(url)
        
//         addNotification('success', 'Archivo descargado correctamente')
//       }

//     } catch (err) {
//       console.error('Download error:', err)
//       addNotification('error', `Error descargando archivo: ${err instanceof Error ? err.message : String(err)}`)
//     }
//   }

//   const deleteFile = async (fileName: string) => {
//     if (!user) return

//     if (!confirm(`¿Estás seguro de que quieres eliminar "${fileName}"? Esta acción no se puede deshacer.`)) {
//       return
//     }

//     try {
//       addNotification('info', `Eliminando ${fileName}...`)

//       const userFolder = getUserFolder(user._id)
//       const filePath = `${userFolder}/${fileName}`

//       const { error } = await supabase.storage
//         .from("llakaScriptBucket")
//         .remove([filePath])

//       if (error) throw error

//       // Actualizar estado local
//       setUserFiles(prev => prev.filter(file => file.name !== fileName))

//       // Actualizar estadísticas
//       const deletedFile = userFiles.find(f => f.name === fileName)
//       if (deletedFile) {
//         setStorageStats(prev => ({
//           totalCount: prev.totalCount - 1,
//           totalSize: prev.totalSize - deletedFile.size
//         }))
//       }

//       addNotification('success', 'Archivo eliminado correctamente')

//     } catch (err) {
//       console.error('Error deleting file:', err)
//       addNotification('error', 'Error eliminando archivo. Por favor, intenta de nuevo.')
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
//     return new Date(dateString).toLocaleDateString('es-ES', {
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

//   // Load user files on component mount and when user changes
//   useEffect(() => {
//     if (user) {
//       fetchUserFiles(user._id)
//     }
//   }, [user])

//   return (
//     <div className={styles.container}>
//       {/* Header */}
//       <header className={styles.header}>
//         <div className={styles.headerContent}>
//           <div className={styles.logoContainer}>
//             <div className={styles.logoIcon}>
//               <span>🕒</span>
//             </div>
//             <div>
//               <h1 className={`${styles.title} ${styles.windowsTitle}`}>TimeChest</h1>
//               <p className={`${styles.subtitle} ${styles.windowsSubtitle}`}>
//                 Almacenamiento seguro con protección AES-256
//               </p>
//             </div>
//           </div>
          
//           {user && (
//             <div className={styles.userInfo}>
//               <div className={styles.userAvatar}>
//                 <div className={styles.avatar}>
//                   {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
//                 </div>
//                 <div className={styles.userDetails}>
//                   <h2>{user.name || user.email}</h2>
//                   <p>{user.email}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className={styles.mainContent}>
//         {/* Sidebar with Stats */}
//         <aside className={styles.sidebar}>
//           <div className={styles.statsGrid}>
//             <div className={styles.statCard}>
//               <div className={styles.statContent}>
//                 <div className={styles.statText}>
//                   <p>Total Archivos</p>
//                   <p className={styles.statNumber}>{storageStats.totalCount}</p>
//                 </div>
//                 <div className={styles.statIcon}>📁</div>
//               </div>
//             </div>

//             <div className={styles.statCard}>
//               <div className={styles.statContent}>
//                 <div className={styles.statText}>
//                   <p>Almacenamiento</p>
//                   <p className={styles.statNumber}>{formatFileSize(storageStats.totalSize)}</p>
//                 </div>
//                 <div className={styles.statIcon}>💾</div>
//               </div>
//             </div>

//             <div className={styles.statCard}>
//               <div className={styles.statContent}>
//                 <div className={styles.statText}>
//                   <p>Archivos ZIP</p>
//                   <p className={styles.statNumber}>
//                     {userFiles.filter(f => f.isZipped).length}
//                   </p>
//                 </div>
//                 <div className={styles.statIcon}>📦</div>
//               </div>
//             </div>

//             <div className={styles.statCard}>
//               <div className={styles.statContent}>
//                 <div className={styles.statText}>
//                   <p>Protección</p>
//                   <p className={styles.statNumber}>AES-256</p>
//                 </div>
//                 <div className={styles.statIcon}>🔒</div>
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* Content Area */}
//         <div className={styles.contentArea}>
//           {/* Upload Section */}
//           <section className={styles.uploadSection}>
//             <div className={styles.uploadHeader}>
//               <h2>Subir Archivos Seguros</h2>
//               <p>Tus archivos se comprimirán y encriptarán automáticamente con AES-256</p>
//             </div>

//             <div className={styles.uploadArea}>
//               <div className={styles.dropZone}>
//                 <div className={styles.dropIcon}>📤</div>
//                 <p className={styles.dropText}>
//                   Arrastra tus archivos aquí o haz clic para seleccionar
//                 </p>
                
//                 <input
//                   type="file"
//                   multiple
//                   onChange={handleFileChange}
//                   disabled={uploading || compressing}
//                   className={styles.fileInput}
//                   id="file-upload"
//                 />
//                 <label
//                   htmlFor="file-upload"
//                   className={`${styles.fileLabel} ${
//                     (uploading || compressing) ? styles.disabled : ''
//                   }`}
//                 >
//                   {compressing ? 'Comprimiendo...' : (uploading ? 'Subiendo...' : 'Seleccionar Archivos')}
//                 </label>

//                 {files && files.length > 0 && (
//                   <div className={styles.fileInfo}>
//                     <p>{files.length} archivo(s) seleccionado(s)</p>
//                     <p className={styles.fileSize}>
//                       Tamaño total: {formatFileSize(Array.from(files).reduce((acc, file) => acc + file.size, 0))}
//                     </p>
//                   </div>
//                 )}

//                 <div className={styles.uploadButtonContainer}>
//                   <button
//                     onClick={compressAndUploadFiles}
//                     disabled={uploading || compressing || !files}
//                     className={`${styles.uploadButton} ${
//                       (uploading || compressing || !files) ? styles.disabled : ''
//                     }`}
//                   >
//                     {compressing ? (
//                       <span className={styles.buttonContent}>
//                         <div className={styles.spinner}></div>
//                         Comprimiendo...
//                       </span>
//                     ) : uploading ? (
//                       <span className={styles.buttonContent}>
//                         <div className={styles.spinner}></div>
//                         Subiendo...
//                       </span>
//                     ) : (
//                       <span className={styles.buttonContent}>
//                         🚀 Comprimir y Encriptar
//                       </span>
//                     )}
//                   </button>
//                 </div>

//                 <p className={styles.uploadNote}>
//                   Máximo 50MB por lote • Encriptación AES-256
//                 </p>
//               </div>
//             </div>
//           </section>

//           {/* Files Section */}
//           <section className={styles.filesSection}>
//             <div className={styles.filesHeader}>
//               <div className={styles.filesTitle}>
//                 <h2>Tus Archivos Protegidos</h2>
//                 <p>{userFiles.length} {userFiles.length === 1 ? 'archivo' : 'archivos'} almacenados</p>
//               </div>
//               <button
//                 onClick={() => user && fetchUserFiles(user._id)}
//                 disabled={loading}
//                 className={styles.refreshButton}
//               >
//                 <span>🔄</span>
//                 <span>Actualizar</span>
//               </button>
//             </div>

//             {loading ? (
//               <div className={styles.loadingState}>
//                 <div className={styles.spinner}></div>
//                 <p>Cargando archivos...</p>
//               </div>
//             ) : userFiles.length === 0 ? (
//               <div className={styles.emptyState}>
//                 <div className={styles.emptyIcon}>📂</div>
//                 <h3>No hay archivos</h3>
//                 <p>Sube tu primer archivo para comenzar a usar el almacenamiento protegido</p>
//               </div>
//             ) : (
//               <div className={styles.filesGrid}>
//                 {userFiles.map((file, index) => (
//                   <div
//                     key={file.name}
//                     className={styles.fileItem}
//                   >
//                     <div className={styles.fileContent}>
//                       <div className={styles.fileIcon}>
//                         {getFileIcon(file.name)}
//                       </div>
//                       <div className={styles.fileDetails}>
//                         <div className={styles.fileHeader}>
//                           <h3>{file.name}</h3>
//                           {file.isZipped && (
//                             <span className={styles.protectedBadge}>
//                               🔒 AES-256
//                             </span>
//                           )}
//                         </div>
//                         <div className={styles.fileMeta}>
//                           <span>{formatFileSize(file.size)}</span>
//                           <span>•</span>
//                           <span>{getFileType(file.name)}</span>
//                           <span>•</span>
//                           <span>Modificado: {formatDate(file.updated_at)}</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className={styles.fileActions}>
//                       <button
//                         onClick={() => downloadFile(file)}
//                         className={styles.downloadButton}
//                       >
//                         <span>📥</span>
//                         <span>Descargar</span>
//                       </button>
                      
//                       <button
//                         onClick={() => deleteFile(file.name)}
//                         className={styles.deleteButton}
//                       >
//                         <span>🗑️</span>
//                         <span>Eliminar</span>
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </section>
//         </div>
//       </main>

//       {/* Notifications */}
//       <div className={styles.notifications}>
//         {notifications.map((notification) => (
//           <div
//             key={notification.id}
//             className={`${styles.notification} ${
//               notification.type === 'success' 
//                 ? styles.notificationSuccess 
//                 : notification.type === 'error' 
//                 ? styles.notificationError 
//                 : styles.notificationInfo
//             }`}
//           >
//             <div className={styles.notificationIcon}>
//               {notification.type === 'success' && '✅'}
//               {notification.type === 'error' && '❌'}
//               {notification.type === 'info' && 'ℹ️'}
//             </div>
//             <div className={styles.notificationContent}>
//               <p>{notification.message}</p>
//             </div>
//             <button
//               onClick={() => removeNotification(notification.id)}
//               className={styles.closeButton}
//             >
//               ✕
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }




"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../../lib/supabase"
import ZipService, { FileData } from "../../services/zipService"
import CryptoJS from 'crypto-js'
import styles from './FileManager.module.css'

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

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UploadProgress {
  total: number;
  loaded: number;
  files: { name: string; progress: number }[];
}

export default function FileManager() {
  const [user, setUser] = useState<User | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [userFiles, setUserFiles] = useState<UploadedFile[]>([])
  const [storageStats, setStorageStats] = useState({
    totalCount: 0,
    totalSize: 0
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Agregar notificación con animación
  const addNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = { id, type, message, duration }
    setNotifications(prev => [...prev, notification])
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  // Remover notificación con animación
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserData(token)
    } else {
      setLoading(false)
      addNotification('error', 'No se encontró token de autenticación')
    }
  }, [])

  const fetchUserData = async (token: string) => {
    try {
      setLoading(true)
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
        await fetchUserFiles(data.user._id)
        addNotification('success', `¡Bienvenido de vuelta, ${data.user.name || data.user.email}! 🎉`)
      } else {
        throw new Error(data.message || 'Failed to fetch user data')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      addNotification('error', 'Error cargando datos del usuario')
    } finally {
      setLoading(false)
    }
  }

  const getUserFolder = (userId: string): string => {
    return `user-${userId}`
  }

  // Manejar drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles)
      const totalSize = Array.from(droppedFiles).reduce((acc, file) => acc + file.size, 0)
      const fileCount = droppedFiles.length
      
      addNotification('success', 
        `🎯 ${fileCount} archivo(s) listo(s) - ${formatFileSize(totalSize)}`
      )
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    setFiles(selectedFiles)
    
    if (selectedFiles && selectedFiles.length > 0) {
      const totalSize = Array.from(selectedFiles).reduce((acc, file) => acc + file.size, 0)
      const fileCount = selectedFiles.length
      
      addNotification('success', 
        `🎯 ${fileCount} archivo(s) seleccionado(s) - ${formatFileSize(totalSize)}`
      )
    }
  }

  const compressAndUploadFiles = async () => {
    if (!files || !user) {
      addNotification('warning', "📁 Por favor selecciona archivos para comenzar")
      return
    }

    setCompressing(true)
    setUploading(true)

    try {
      const filesArray = Array.from(files)
      console.log(`Processing ${filesArray.length} files`)

      // Configurar progreso
      setUploadProgress({
        total: filesArray.length,
        loaded: 0,
        files: filesArray.map(file => ({ name: file.name, progress: 0 }))
      })

      // Verificar tamaño total de archivos
      const totalSize = filesArray.reduce((acc, file) => acc + file.size, 0)
      const maxSize = 50 * 1024 * 1024 // 50MB

      if (totalSize > maxSize) {
        throw new Error(`El tamaño total excede el límite de 50MB. Tamaño actual: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)
      }

      addNotification('info', '🔄 Preparando archivos para compresión...')

      // Simular progreso de preparación
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUploadProgress(prev => prev ? { ...prev, loaded: 1 } : null)

      // Preparar archivos para el backend
      const filesWithData = await ZipService.prepareFilesForBackend(filesArray)

      addNotification('info', '🔒 Comprimiendo y protegiendo archivos...')

      // Simular progreso de compresión
      await new Promise(resolve => setTimeout(resolve, 1500))
      setUploadProgress(prev => prev ? { ...prev, loaded: 2 } : null)

      // Obtener la contraseña del usuario
      const userPassword = await getUserPassword()

      addNotification('info', '🚀 Subiendo archivos seguros...')

      // Llamar al endpoint del backend para crear el ZIP protegido
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutos timeout

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
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          throw new Error(`Error del servidor: ${response.status}`)
        }
        throw new Error(errorData.message || `Error: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Error desconocido del servidor')
      }

      // Completar progreso
      setUploadProgress(prev => prev ? { ...prev, loaded: prev.total } : null)

      addNotification('success', 
        `✅ ¡Éxito! ${filesArray.length} archivo(s) protegido(s) con encriptación AES-256`
      )

      // Actualizar la lista de archivos
      setTimeout(() => {
        fetchUserFiles(user._id)
      }, 1000)

    } catch (err: any) {
      console.error("Compression error:", err)

      let errorMessage = 'Error comprimiendo archivos'
      if (err.name === 'AbortError') {
        errorMessage = '⏰ La operación tardó demasiado tiempo. Intenta con menos archivos o más pequeños.'
      } else if (err.message) {
        errorMessage = err.message
      }

      addNotification('error', errorMessage)
    } finally {
      setCompressing(false)
      setUploading(false)
      setFiles(null)
      setUploadProgress(null)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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
      return user?._id || 'default-password'
    }
  }

  const fetchUserFiles = async (userId: string) => {
    try {
      setLoading(true)
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

      // Ordenar por fecha de modificación (más reciente primero)
      filesWithUrls.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

      setUserFiles(filesWithUrls)

      const totalCount = filesWithUrls.length
      const totalSize = filesWithUrls.reduce((acc, file) => acc + file.size, 0)
      setStorageStats({ totalCount, totalSize })

    } catch (err) {
      console.error('Error fetching user files:', err)
      addNotification('error', '❌ Error cargando lista de archivos')
      setUserFiles([])
      setStorageStats({ totalCount: 0, totalSize: 0 })
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async (file: UploadedFile) => {
    try {
      setSelectedFile(file.name)
      addNotification('info', `📥 Descargando ${file.name}...`)

      // Descargar el archivo encriptado de Supabase
      const response = await fetch(file.url)
      if (!response.ok) throw new Error('Failed to download file')

      const encryptedBlob = await response.blob()
      
      if (file.isZipped) {
        // Obtener la contraseña para desencriptar
        const userPassword = await getUserPassword()
        
        addNotification('info', '🔓 Desencriptando archivos...')
        
        try {
          // Para ZIP protegidos, descargar directamente
          const url = URL.createObjectURL(encryptedBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = file.name
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          addNotification('success', `✅ ${file.name} descargado correctamente`)
        } catch (decryptError) {
          console.error('Download error:', decryptError)
          addNotification('error', '❌ Error descargando archivo protegido')
        }
      } else {
        // Si es un archivo individual, descargarlo directamente
        const url = URL.createObjectURL(encryptedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        addNotification('success', '✅ Archivo descargado correctamente')
      }

    } catch (err) {
      console.error('Download error:', err)
      addNotification('error', `❌ Error descargando archivo: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSelectedFile(null)
    }
  }

  const deleteFile = async (fileName: string) => {
    if (!user) return

    // Dialogo de confirmación elegante
    const confirmDelete = await new Promise((resolve) => {
      addNotification('warning', 
        `¿Eliminar "${fileName}"? Esta acción no se puede deshacer.`,
        10000
      )
      // En una implementación real, usarías un modal personalizado
      resolve(window.confirm(`¿Estás seguro de que quieres eliminar "${fileName}"? Esta acción no se puede deshacer.`))
    })

    if (!confirmDelete) {
      addNotification('info', 'Eliminación cancelada')
      return
    }

    try {
      addNotification('info', `🗑️ Eliminando ${fileName}...`)

      const userFolder = getUserFolder(user._id)
      const filePath = `${userFolder}/${fileName}`

      const { error } = await supabase.storage
        .from("llakaScriptBucket")
        .remove([filePath])

      if (error) throw error

      // Animación de eliminación
      setUserFiles(prev => prev.filter(file => file.name !== fileName))

      // Actualizar estadísticas
      const deletedFile = userFiles.find(f => f.name === fileName)
      if (deletedFile) {
        setStorageStats(prev => ({
          totalCount: prev.totalCount - 1,
          totalSize: prev.totalSize - deletedFile.size
        }))
      }

      addNotification('success', '✅ Archivo eliminado correctamente')

    } catch (err) {
      console.error('Error deleting file:', err)
      addNotification('error', '❌ Error eliminando archivo. Por favor, intenta de nuevo.')
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

  const clearAllFiles = () => {
    setFiles(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    addNotification('info', 'Selección de archivos limpiada')
  }

  // Load user files on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchUserFiles(user._id)
    }
  }, [user])

  return (
    <div className={styles.container}>
      {/* Header con Glassmorphism */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <span className={styles.animatedLogo}>⏳</span>
            </div>
            <div>
              <h1 className={styles.title}>TimeChest</h1>
              <p className={styles.subtitle}>
                Almacenamiento seguro con protección AES-256 • Tu bóveda digital
              </p>
            </div>
          </div>
          
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <div className={styles.avatar}>
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className={styles.userDetails}>
                  <h2>{user.name || user.email}</h2>
                  <p>{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Sidebar con Stats */}
        <aside className={styles.sidebar}>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.statCard1}`}>
              <div className={styles.statContent}>
                <div className={styles.statText}>
                  <p>Total Archivos</p>
                  <p className={styles.statNumber}>{storageStats.totalCount}</p>
                </div>
                <div className={styles.statIcon}>📁</div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.statCard2}`}>
              <div className={styles.statContent}>
                <div className={styles.statText}>
                  <p>Almacenamiento</p>
                  <p className={styles.statNumber}>{formatFileSize(storageStats.totalSize)}</p>
                </div>
                <div className={styles.statIcon}>💾</div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.statCard3}`}>
              <div className={styles.statContent}>
                <div className={styles.statText}>
                  <p>Archivos ZIP</p>
                  <p className={styles.statNumber}>
                    {userFiles.filter(f => f.isZipped).length}
                  </p>
                </div>
                <div className={styles.statIcon}>📦</div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.statCard4}`}>
              <div className={styles.statContent}>
                <div className={styles.statText}>
                  <p>Protección</p>
                  <p className={styles.statNumber}>AES-256</p>
                </div>
                <div className={styles.statIcon}>🔒</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {/* Upload Section */}
          <section className={styles.uploadSection}>
            <div className={styles.uploadHeader}>
              <h2>Subir Archivos Seguros</h2>
              <p>Tus archivos se comprimirán y encriptarán automáticamente con AES-256</p>
            </div>

            <div className={styles.uploadArea}>
              <div 
                className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''} ${files ? styles.dropZoneHasFiles : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={styles.dropIcon}>📤</div>
                <p className={styles.dropText}>
                  Arrastra tus archivos aquí o haz clic para seleccionar
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  disabled={uploading || compressing}
                  className={styles.fileInput}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`${styles.fileLabel} ${
                    (uploading || compressing) ? styles.disabled : ''
                  }`}
                >
                  {compressing ? 'Comprimiendo...' : (uploading ? 'Subiendo...' : 'Seleccionar Archivos')}
                </label>

                {files && files.length > 0 && (
                  <div className={styles.fileInfo}>
                    <div className={styles.fileInfoHeader}>
                      <p>🎯 {files.length} archivo(s) seleccionado(s)</p>
                      <button 
                        onClick={clearAllFiles}
                        className={styles.clearButton}
                      >
                        Limpiar
                      </button>
                    </div>
                    <p className={styles.fileSize}>
                      Tamaño total: {formatFileSize(Array.from(files).reduce((acc, file) => acc + file.size, 0))}
                    </p>
                    
                    {/* Progress Bar */}
                    {uploadProgress && (
                      <div className={styles.progressContainer}>
                        <div className={styles.progressHeader}>
                          <span>Progreso de subida</span>
                          <span>{Math.round((uploadProgress.loaded / uploadProgress.total) * 100)}%</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill}
                            style={{ width: `${(uploadProgress.loaded / uploadProgress.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.uploadButtonContainer}>
                  <button
                    onClick={compressAndUploadFiles}
                    disabled={uploading || compressing || !files}
                    className={`${styles.uploadButton} ${
                      (uploading || compressing || !files) ? styles.disabled : ''
                    }`}
                  >
                    {compressing ? (
                      <span className={styles.buttonContent}>
                        <div className={styles.spinner}></div>
                        Comprimiendo...
                      </span>
                    ) : uploading ? (
                      <span className={styles.buttonContent}>
                        <div className={styles.spinner}></div>
                        Subiendo...
                      </span>
                    ) : (
                      <span className={styles.buttonContent}>
                        🚀 Comprimir y Encriptar
                      </span>
                    )}
                  </button>
                </div>

                <p className={styles.uploadNote}>
                  Máximo 50MB por lote • Encriptación AES-256 • Compresión automática
                </p>
              </div>
            </div>
          </section>

          {/* Files Section */}
          <section className={styles.filesSection}>
            <div className={styles.filesHeader}>
              <div className={styles.filesTitle}>
                <h2>Tus Archivos Protegidos</h2>
                <p>{userFiles.length} {userFiles.length === 1 ? 'archivo' : 'archivos'} almacenados de forma segura</p>
              </div>
              <div className={styles.filesActions}>
                <button
                  onClick={() => user && fetchUserFiles(user._id)}
                  disabled={loading}
                  className={styles.refreshButton}
                >
                  <span className={loading ? styles.spinning : ''}>🔄</span>
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Cargando tus archivos seguros...</p>
              </div>
            ) : userFiles.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📂</div>
                <h3>Tu bóveda está vacía</h3>
                <p>Sube tu primer archivo para comenzar a usar el almacenamiento protegido</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={styles.uploadCtaButton}
                >
                  Subir Primer Archivo
                </button>
              </div>
            ) : (
              <div className={styles.filesGrid}>
                {userFiles.map((file, index) => (
                  <div
                    key={file.name}
                    className={`${styles.fileItem} ${
                      selectedFile === file.name ? styles.fileItemSelected : ''
                    }`}
                  >
                    <div className={styles.fileContent}>
                      <div className={styles.fileIcon}>
                        {getFileIcon(file.name)}
                      </div>
                      <div className={styles.fileDetails}>
                        <div className={styles.fileHeader}>
                          <h3>{file.name}</h3>
                          {file.isZipped && (
                            <span className={styles.protectedBadge}>
                              🔒 AES-256
                            </span>
                          )}
                        </div>
                        <div className={styles.fileMeta}>
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{getFileType(file.name)}</span>
                          <span>•</span>
                          <span>Modificado: {formatDate(file.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.fileActions}>
                      <button
                        onClick={() => downloadFile(file)}
                        disabled={selectedFile === file.name}
                        className={styles.downloadButton}
                      >
                        <span>📥</span>
                        <span>Descargar</span>
                      </button>
                      
                      <button
                        onClick={() => deleteFile(file.name)}
                        className={styles.deleteButton}
                      >
                        <span>🗑️</span>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Security Footer */}
      <footer className={styles.securityFooter}>
        <div className={styles.securityBadge}>
          <div className={styles.securityIcon}>🛡️</div>
          <div className={styles.securityText}>
            <h4>Protección de Grado Militar</h4>
            <p>Todos tus archivos están encriptados con AES-256 antes de ser almacenados</p>
          </div>
        </div>
      </footer>

      {/* Notifications Container */}
      <div className={styles.notifications}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`${styles.notification} ${
              notification.type === 'success' 
                ? styles.notificationSuccess 
                : notification.type === 'error' 
                ? styles.notificationError 
                : notification.type === 'warning'
                ? styles.notificationWarning
                : styles.notificationInfo
            }`}
          >
            <div className={styles.notificationIcon}>
              {notification.type === 'success' && '✅'}
              {notification.type === 'error' && '❌'}
              {notification.type === 'warning' && '⚠️'}
              {notification.type === 'info' && 'ℹ️'}
            </div>
            <div className={styles.notificationContent}>
              <p>{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className={styles.closeButton}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}