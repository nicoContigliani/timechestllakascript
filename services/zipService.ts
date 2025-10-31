// // // import JSZip, { JSZipObject } from "jszip";
// // // import { saveAs } from "file-saver";

// // // // Opciones extendidas (placeholder para cifrado futuro)
// // // interface ZipGeneratorOptionsWithPassword
// // //     extends JSZip.JSZipGeneratorOptions<"blob"> {
// // //     password?: string;
// // //     encrypt?: boolean;
// // // }

// // // export class ZipService {
// // //     /**
// // //      * Comprimir archivos con contraseña (placeholder, sin cifrado real)
// // //      */
// // //     static async createPasswordProtectedZip(
// // //         files: File[],
// // //         password: string,
// // //         zipName: string = "archive.zip"
// // //     ): Promise<Blob> {
// // //         if (!files?.length) throw new Error("No files provided for compression");
// // //         if (!password?.trim()) throw new Error("Password is required");

// // //         const zip = new JSZip();

// // //         for (const file of files) {
// // //             if (file?.name) zip.file(file.name, file);
// // //         }

// // //         const options: ZipGeneratorOptionsWithPassword = {
// // //             type: "blob",
// // //             compression: "DEFLATE",
// // //             compressionOptions: { level: 6 },
// // //             encrypt: true, // no-op en JSZip
// // //             password,
// // //         };

// // //         return await zip.generateAsync(options);
// // //     }

// // //     /**
// // //      * Comprimir múltiples archivos sin contraseña
// // //      */
// // //     static async createZip(files: File[]): Promise<Blob> {
// // //         if (!files?.length) throw new Error("No files provided for compression");

// // //         const zip = new JSZip();

// // //         for (const file of files) {
// // //             if (file?.name) zip.file(file.name, file);
// // //         }

// // //         const options: JSZip.JSZipGeneratorOptions<"blob"> = {
// // //             type: "blob",
// // //             compression: "DEFLATE",
// // //             compressionOptions: { level: 6 },
// // //         };

// // //         return zip.generateAsync(options);
// // //     }

// // //     /**
// // //      * Extraer archivos de un ZIP
// // //      */
// // //     static async extractZip(zipBlob: Blob): Promise<File[]> {
// // //         if (!zipBlob?.size) throw new Error("Invalid zip file");

// // //         const zip = await JSZip.loadAsync(zipBlob);
// // //         const files: File[] = [];

// // //         for (const [filename, entry] of Object.entries(zip.files)) {
// // //             if (!entry.dir) {
// // //                 const content = await entry.async("blob");
// // //                 files.push(new File([content], filename, { type: this.getMimeType(filename) }));
// // //             }
// // //         }

// // //         return files;
// // //     }

// // //     /**
// // //      * Obtener el tipo MIME basado en la extensión del archivo
// // //      */
// // //     private static getMimeType(filename: string): string {
// // //         const ext = filename.split(".").pop()?.toLowerCase() || "";
// // //         const mimeTypes: Record<string, string> = {
// // //             jpg: "image/jpeg",
// // //             jpeg: "image/jpeg",
// // //             png: "image/png",
// // //             gif: "image/gif",
// // //             webp: "image/webp",
// // //             bmp: "image/bmp",
// // //             svg: "image/svg+xml",
// // //             pdf: "application/pdf",
// // //             doc: "application/msword",
// // //             docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// // //             xls: "application/vnd.ms-excel",
// // //             xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
// // //             ppt: "application/vnd.ms-powerpoint",
// // //             pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
// // //             txt: "text/plain",
// // //             csv: "text/csv",
// // //             html: "text/html",
// // //             json: "application/json",
// // //             zip: "application/zip",
// // //             mp3: "audio/mpeg",
// // //             mp4: "video/mp4",
// // //         };
// // //         return mimeTypes[ext] || "application/octet-stream";
// // //     }

// // //     /**
// // //      * Descargar archivo ZIP
// // //      */
// // //     static downloadZip(blob: Blob, filename: string = "download.zip"): void {
// // //         if (!blob?.size) throw new Error("Invalid blob");
// // //         if (!filename.endsWith(".zip")) filename += ".zip";
// // //         saveAs(blob, filename);
// // //     }

// // //     /**
// // //      * Obtener información del archivo ZIP
// // //      */
// // //     static async getZipInfo(zipBlob: Blob): Promise<{
// // //         fileCount: number;
// // //         totalSize: number;
// // //         filenames: string[];
// // //     }> {
// // //         if (!zipBlob?.size) throw new Error("Invalid zip file");

// // //         const zip = await JSZip.loadAsync(zipBlob);
// // //         const files = Object.values(zip.files).filter((f) => !f.dir);

// // //         return {
// // //             fileCount: files.length,
// // //             totalSize: zipBlob.size,
// // //             filenames: files.map((f) => f.name),
// // //         };
// // //     }

// // //     /**
// // //      * Crear ZIP desde URLs
// // //      */
// // //     static async createZipFromUrls(
// // //         urls: Array<{ url: string; filename: string }>
// // //     ): Promise<Blob> {
// // //         if (!urls?.length) throw new Error("No URLs provided");

// // //         const zip = new JSZip();
// // //         const fetches = urls.map(async ({ url, filename }) => {
// // //             const response = await fetch(url);
// // //             if (!response.ok) throw new Error(`Failed to fetch ${url}`);
// // //             const blob = await response.blob();
// // //             zip.file(filename, blob);
// // //         });

// // //         await Promise.all(fetches);

// // //         return zip.generateAsync({
// // //             type: "blob",
// // //             compression: "DEFLATE",
// // //             compressionOptions: { level: 6 },
// // //         });
// // //     }

// // //     /**
// // //      * Listar contenido del ZIP sin extraerlo
// // //      */
// // //     static async listZipContents(zipBlob: Blob): Promise<
// // //         Array<{
// // //             name: string;
// // //             size: number;
// // //             compressedSize: number;
// // //             isDirectory: boolean;
// // //             date: Date;
// // //         }>
// // //     > {
// // //         if (!zipBlob?.size) throw new Error("Invalid zip file");
// // //         const zip = await JSZip.loadAsync(zipBlob);

// // //         return Object.entries(zip.files).map(([name, entry]: [any, any]) => ({
// // //             name,
// // //             size: entry.uncompressedSize || 0,
// // //             compressedSize: entry.compressedSize || 0,
// // //             isDirectory: entry.dir,
// // //             date: entry.date,
// // //         }));
// // //     }

// // //     /**
// // //      * Método simplificado para crear ZIPs
// // //      */
// // //     static async simpleCreateZip(files: File[]): Promise<Blob> {
// // //         if (!files?.length) throw new Error("No files provided");

// // //         const zip = new JSZip();
// // //         files.forEach((file) => file?.name && zip.file(file.name, file));

// // //         return zip.generateAsync({
// // //             type: "blob",
// // //             compression: "DEFLATE",
// // //             compressionOptions: { level: 6 },
// // //         });
// // //     }

// // //     /**
// // //      * Método simplificado para extraer ZIPs
// // //      */
// // //     static async simpleExtractZip(zipBlob: Blob, downloadPassword: string): Promise<File[]> {
// // //         if (!zipBlob?.size) throw new Error("Invalid zip file");
// // //         const zip = await JSZip.loadAsync(zipBlob);
// // //         const files: File[] = [];

// // //         for (const [filename, entry] of Object.entries(zip.files)) {
// // //             if (!entry.dir) {
// // //                 const content = await entry.async("blob");
// // //                 files.push(new File([content], filename, { type: this.getMimeType(filename) }));
// // //             }
// // //         }

// // //         return files;
// // //     }
// // // }



// // import JSZip from "jszip";

// // export interface FileData {
// //   name: string;
// //   type: string;
// //   data: string; // base64
// // }

// // export class ZipService {
// //   /**
// //    * Crear un ZIP simple (sin contraseña en el frontend)
// //    */
// //   static async createSimpleZip(files: File[]): Promise<Blob> {
// //     if (!files?.length) throw new Error("No files provided for compression");

// //     const zip = new JSZip();

// //     for (const file of files) {
// //       if (file?.name) {
// //         const arrayBuffer = await file.arrayBuffer();
// //         zip.file(file.name, arrayBuffer);
// //       }
// //     }

// //     return await zip.generateAsync({
// //       type: "blob",
// //       compression: "DEFLATE",
// //       compressionOptions: { level: 2 },
// //     });
// //   }

// //   /**
// //    * Extraer archivos de un ZIP
// //    */
// //   static async extractZip(zipBlob: Blob): Promise<File[]> {
// //     if (!zipBlob?.size) throw new Error("Invalid zip file");

// //     try {
// //       const zip = await JSZip.loadAsync(zipBlob);
// //       const files: File[] = [];

// //       for (const [filename, entry] of Object.entries(zip.files)) {
// //         if (!entry.dir) {
// //           const content = await entry.async("blob");
// //           files.push(new File([content], filename, { 
// //             type: this.getMimeType(filename) 
// //           }));
// //         }
// //       }

// //       return files;
// //     } catch (error) {
// //       throw new Error(`Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
// //     }
// //   }

// //   /**
// //    * Obtener el tipo MIME basado en la extensión del archivo
// //    */
// //   private static getMimeType(filename: string): string {
// //     const ext = filename.split('.').pop()?.toLowerCase() || '';
// //     const mimeTypes: Record<string, string> = {
// //       jpg: "image/jpeg",
// //       jpeg: "image/jpeg",
// //       png: "image/png",
// //       gif: "image/gif",
// //       webp: "image/webp",
// //       pdf: "application/pdf",
// //       doc: "application/msword",
// //       docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// //       xls: "application/vnd.ms-excel",
// //       xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
// //       txt: "text/plain",
// //       csv: "text/csv",
// //       zip: "application/zip",
// //       mp3: "audio/mpeg",
// //       mp4: "video/mp4",
// //     };
// //     return mimeTypes[ext] || "application/octet-stream";
// //   }

// //   /**
// //    * Convertir File a base64 para enviar al backend
// //    */
// //   static async fileToBase64(file: File): Promise<string> {
// //     return new Promise((resolve, reject) => {
// //       const reader = new FileReader();
// //       reader.onload = () => {
// //         const result = reader.result as string;
// //         // Remover el prefijo data:image/png;base64, para obtener solo base64
// //         const base64 = result.split(',')[1];
// //         resolve(base64);
// //       };
// //       reader.onerror = reject;
// //       reader.readAsDataURL(file);
// //     });
// //   }

// //   /**
// //    * Convertir múltiples archivos a formato para el backend
// //    */
// //   static async prepareFilesForBackend(files: File[]): Promise<FileData[]> {
// //     const preparedFiles: FileData[] = [];

// //     for (const file of files) {
// //       try {
// //         const base64Data = await this.fileToBase64(file);
// //         preparedFiles.push({
// //           name: file.name,
// //           type: file.type,
// //           data: base64Data
// //         });
// //       } catch (error) {
// //         console.error(`Error preparing file ${file.name}:`, error);
// //         throw new Error(`Failed to process file ${file.name}`);
// //       }
// //     }

// //     return preparedFiles;
// //   }

// //   /**
// //    * Validar tamaño total de archivos
// //    */
// //   static validateTotalSize(files: File[], maxSizeMB: number = 50): boolean {
// //     const totalSize = files.reduce((acc, file) => acc + file.size, 0);
// //     return totalSize <= maxSizeMB * 1024 * 1024;
// //   }
// // }



// // services/zipService.ts
// import JSZip from "jszip";

// export interface FileData {
//   name: string;
//   type: string;
//   data: string; // base64
// }

// export class ZipService {
//   /**
//    * Crear un ZIP simple (sin contraseña en el frontend)
//    */
//   static async createSimpleZip(files: File[]): Promise<Blob> {
//     if (!files?.length) throw new Error("No files provided for compression");

//     const zip = new JSZip();

//     for (const file of files) {
//       if (file?.name) {
//         const arrayBuffer = await file.arrayBuffer();
//         zip.file(file.name, arrayBuffer);
//       }
//     }

//     return await zip.generateAsync({
//       type: "blob",
//       compression: "DEFLATE",
//       compressionOptions: { level: 2 },
//     });
//   }

//   /**
//    * Extraer archivos de un ZIP
//    */
//   static async extractZip(zipBlob: Blob): Promise<File[]> {
//     if (!zipBlob?.size) throw new Error("Invalid zip file");

//     try {
//       const zip = await JSZip.loadAsync(zipBlob);
//       const files: File[] = [];

//       for (const [filename, entry] of Object.entries(zip.files)) {
//         if (!entry.dir) {
//           const content = await entry.async("blob");
//           files.push(new File([content], filename, { 
//             type: this.getMimeType(filename) 
//           }));
//         }
//       }

//       return files;
//     } catch (error) {
//       throw new Error(`Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }

//   /**
//    * Obtener el tipo MIME basado en la extensión del archivo
//    */
//   private static getMimeType(filename: string): string {
//     const ext = filename.split('.').pop()?.toLowerCase() || '';
//     const mimeTypes: Record<string, string> = {
//       jpg: "image/jpeg",
//       jpeg: "image/jpeg",
//       png: "image/png",
//       gif: "image/gif",
//       webp: "image/webp",
//       pdf: "application/pdf",
//       doc: "application/msword",
//       docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       xls: "application/vnd.ms-excel",
//       xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       txt: "text/plain",
//       csv: "text/csv",
//       zip: "application/zip",
//       mp3: "audio/mpeg",
//       mp4: "video/mp4",
//     };
//     return mimeTypes[ext] || "application/octet-stream";
//   }

//   /**
//    * Convertir File a base64 para enviar al backend
//    */
//   static async fileToBase64(file: File): Promise<string> {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => {
//         const result = reader.result as string;
//         // Remover el prefijo data:image/png;base64, para obtener solo base64
//         const base64 = result.split(',')[1];
//         resolve(base64);
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });
//   }

//   /**
//    * Convertir múltiples archivos a formato para el backend
//    */
//   static async prepareFilesForBackend(files: File[]): Promise<FileData[]> {
//     const preparedFiles: FileData[] = [];

//     for (const file of files) {
//       try {
//         const base64Data = await this.fileToBase64(file);
//         preparedFiles.push({
//           name: file.name,
//           type: file.type,
//           data: base64Data
//         });
//       } catch (error) {
//         console.error(`Error preparing file ${file.name}:`, error);
//         throw new Error(`Failed to process file ${file.name}`);
//       }
//     }

//     return preparedFiles;
//   }

//   /**
//    * Validar tamaño total de archivos
//    */
//   static validateTotalSize(files: File[], maxSizeMB: number = 50): boolean {
//     const totalSize = files.reduce((acc, file) => acc + file.size, 0);
//     return totalSize <= maxSizeMB * 1024 * 1024;
//   }
// }

// // Exportación por defecto para compatibilidad
// export default ZipService;



// services/zipService.ts
import JSZip from "jszip";

export interface FileData {
  name: string;
  type: string;
  data: string; // base64
}

export class ZipService {
  /**
   * Crear un ZIP simple (sin contraseña en el frontend)
   */
  static async createSimpleZip(files: File[]): Promise<Blob> {
    if (!files?.length) throw new Error("No files provided for compression");

    const zip = new JSZip();

    for (const file of files) {
      if (file?.name) {
        const arrayBuffer = await file.arrayBuffer();
        zip.file(file.name, arrayBuffer);
      }
    }

    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 2 },
    });
  }

  /**
   * Extraer archivos de un ZIP
   */
  static async extractZip(zipBlob: Blob): Promise<File[]> {
    if (!zipBlob?.size) throw new Error("Invalid zip file");

    try {
      const zip = await JSZip.loadAsync(zipBlob);
      const files: File[] = [];

      for (const [filename, entry] of Object.entries(zip.files)) {
        if (!entry.dir) {
          const content = await entry.async("blob");
          files.push(new File([content], filename, { 
            type: this.getMimeType(filename) 
          }));
        }
      }

      return files;
    } catch (error) {
      throw new Error(`Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validar si un Blob es un ZIP válido
   */
  static async isValidZip(blob: Blob): Promise<boolean> {
    try {
      // Leer los primeros bytes para verificar la firma ZIP
      const slice = blob.slice(0, 4);
      const arrayBuffer = await slice.arrayBuffer();
      const header = new Uint8Array(arrayBuffer);
      
      // Verificar firma ZIP: PK.. (0x50 0x4B 0x03 0x04)
      return header[0] === 0x50 && header[1] === 0x4B && 
             header[2] === 0x03 && header[3] === 0x04;
    } catch {
      return false;
    }
  }

  /**
   * Extraer ZIP con mejor manejo de errores
   */
  static async extractZipSafe(zipBlob: Blob): Promise<File[]> {
    if (!zipBlob?.size) throw new Error("Invalid zip file");

    try {
      // Verificar si es un ZIP válido
      const isValid = await this.isValidZip(zipBlob);
      if (!isValid) {
        throw new Error("El archivo no es un ZIP válido o está corrupto");
      }

      const zip = await JSZip.loadAsync(zipBlob);
      
      // Verificar que el ZIP no esté vacío
      const fileCount = Object.keys(zip.files).filter(name => !zip.files[name].dir).length;
      if (fileCount === 0) {
        throw new Error("El ZIP está vacío");
      }

      const files: File[] = [];

      for (const [filename, entry] of Object.entries(zip.files)) {
        if (!entry.dir) {
          try {
            const content = await entry.async("blob");
            files.push(new File([content], filename, { 
              type: this.getMimeType(filename) 
            }));
          } catch (fileError) {
            console.warn(`No se pudo extraer el archivo ${filename}:`, fileError);
            // Continuar con los demás archivos
          }
        }
      }

      if (files.length === 0) {
        throw new Error("No se pudieron extraer archivos del ZIP");
      }

      return files;
    } catch (error) {
      throw new Error(`Failed to extract ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtener el tipo MIME basado en la extensión del archivo
   */
  private static getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      txt: "text/plain",
      csv: "text/csv",
      zip: "application/zip",
      mp3: "audio/mpeg",
      mp4: "video/mp4",
      json: "application/json",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }

  /**
   * Convertir File a base64 para enviar al backend
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo data:image/png;base64, para obtener solo base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convertir múltiples archivos a formato para el backend
   */
  static async prepareFilesForBackend(files: File[]): Promise<FileData[]> {
    const preparedFiles: FileData[] = [];

    for (const file of files) {
      try {
        const base64Data = await this.fileToBase64(file);
        preparedFiles.push({
          name: file.name,
          type: file.type,
          data: base64Data
        });
      } catch (error) {
        console.error(`Error preparing file ${file.name}:`, error);
        throw new Error(`Failed to process file ${file.name}`);
      }
    }

    return preparedFiles;
  }

  /**
   * Validar tamaño total de archivos
   */
  static validateTotalSize(files: File[], maxSizeMB: number = 50): boolean {
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    return totalSize <= maxSizeMB * 1024 * 1024;
  }
}

// Exportación por defecto para compatibilidad
export default ZipService;