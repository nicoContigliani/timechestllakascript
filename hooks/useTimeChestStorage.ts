import { useState, useCallback } from "react";

type FileObject = {
  name: string;
  url: string;
  type: string;
  size: number;
  updated_at: string;
}

type UploadOptions = {
  upsert?: boolean;
  cacheControl?: string;
  contentType?: string;
}

export const useTimeChestStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const BUCKET_NAME = "llakaScriptBucket"; // Cambiado a userDocuments

  // Función para verificar y crear el bucket si es necesario
  const ensureBucketExists = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/files/create-bucket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error ensuring bucket exists:', err);
      return false;
    }
  }, []);

  const uploadFiles = useCallback(
    async (
      filesToUpload: File[],
      userId: string,
      folderPath: string = "",
      options: UploadOptions = { upsert: true }
    ): Promise<FileObject[] | null> => {
      if (!filesToUpload || filesToUpload.length === 0) {
        const errorMessage = "No files selected for upload";
        setError(errorMessage);
        return null;
      }

      setUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Primero asegurarnos de que el bucket existe
        const bucketReady = await ensureBucketExists();
        if (!bucketReady) {
          throw new Error('Failed to create or verify storage bucket');
        }

        const totalFiles = filesToUpload.length;
        const uploaded: FileObject[] = [];

        for (let i = 0; i < totalFiles; i++) {
          const file = filesToUpload[i];
          
          try {
            // Convertir archivo a base64 para enviar via API
            const fileData = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });

            const base64Data = fileData.split(',')[1];

            const response = await fetch('/api/files/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                fileData: base64Data,
                fileName: file.name,
                fileType: file.type,
                filePath: folderPath,
                userId: userId,
              }),
            });

            const result = await response.json();

            if (!result.success) {
              throw new Error(result.message);
            }

            uploaded.push({
              name: file.name,
              url: result.fileUrl || '',
              type: file.type,
              size: file.size,
              updated_at: new Date().toISOString(),
            });

            const currentProgress = Math.round(((i + 1) / totalFiles) * 100);
            setUploadProgress(currentProgress);
          } catch (err) {
            console.error("Error uploading file:", err);
            const errorMessage = `Error uploading ${file.name}: ${err instanceof Error ? err.message : String(err)}`;
            setError(errorMessage);
            break;
          }
        }

        return uploaded;
      } catch (err) {
        const errorMessage = `Upload failed: ${err instanceof Error ? err.message : String(err)}`;
        setError(errorMessage);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [ensureBucketExists]
  );

  const listFiles = useCallback(async (userId: string): Promise<FileObject[]> => {
    try {
      const response = await fetch('/api/files/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        return data.files.map((file: any) => ({
          name: file.name,
          url: file.url || '',
          type: file.metadata?.mimetype || 'unknown',
          size: file.metadata?.size || 0,
          updated_at: file.updated_at,
        }));
      }
      return [];
    } catch (err) {
      console.error('Error listing files:', err);
      return [];
    }
  }, []);

  const deleteFile = useCallback(async (userId: string, fileName: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ fileName, userId }),
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error deleting file:', err);
      return false;
    }
  }, []);

  return {
    uploading,
    error,
    uploadProgress,
    uploadFiles,
    listFiles,
    deleteFile,
    resetError: () => setError(null),
    ensureBucketExists,
  };
};