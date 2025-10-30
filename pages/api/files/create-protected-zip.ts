import { NextApiRequest, NextApiResponse } from 'next';
import JSZip from 'jszip';
import { supabase } from '@/lib/supabase';

interface FileData {
  name: string;
  type: string;
  data: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { files, password, userId } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files provided' 
      });
    }

    if (!password || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password and User ID are required' 
      });
    }

    console.log(`Creating ZIP for user ${userId} with ${files.length} files`);

    // Usar el mismo bucket que en tu otro proyecto
    const bucketName = "llakaScriptBucket";
    const userFolder = `user-${userId}`;
    const fullPath = userFolder;

    // Verificar/Crear la carpeta del usuario (similar a tu otro proyecto)
    try {
      await supabase.storage
        .from(bucketName)
        .upload(`${fullPath}/.keep`, new Blob([]), { upsert: true });
    } catch (folderError) {
      console.log('Folder check completed');
    }

    // Crear ZIP con JSZip
    const zip = new JSZip();

    // Agregar archivos al ZIP
    for (const file of files) {
      if (file?.name && file?.data) {
        try {
          // Convertir base64 a ArrayBuffer
          const binaryString = atob(file.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          zip.file(file.name, bytes);
          console.log(`Added file to ZIP: ${file.name}`);
        } catch (fileError) {
          console.error(`Error adding file ${file.name}:`, fileError);
        }
      }
    }

    // Agregar metadata
    const metadata = {
      userId: userId,
      fileCount: files.length,
      timestamp: new Date().toISOString(),
      protection: "TimeChest Protected"
    };
    zip.file('_metadata.json', JSON.stringify(metadata, null, 2));

    // Generar ZIP
    console.log('Generating ZIP file...');
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    console.log(`ZIP created: ${zipBlob.size} bytes`);

    // Convertir a ArrayBuffer para Supabase
    const arrayBuffer = await zipBlob.arrayBuffer();
    
    // Crear nombre único
    const timestamp = Date.now();
    const zipFileName = `protected-${timestamp}.zip`;
    const filePath = `${fullPath}/${zipFileName}`;

    console.log(`Uploading to: ${filePath}`);

    // Subir a Supabase (usando el mismo enfoque que tu otro proyecto)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        upsert: false,
        cacheControl: '3600',
        contentType: 'application/zip'
      });

    if (error) {
      console.error('Supabase upload error:', error);
      
      // Si el error es que el bucket no existe, crear uno alternativo
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        throw new Error('Storage bucket not found. Please create "llakaScriptBucket" in Supabase dashboard.');
      }
      
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('Upload successful!');

    res.status(200).json({
      success: true,
      message: 'Files compressed and uploaded successfully',
      file: {
        name: zipFileName,
        url: urlData.publicUrl,
        path: filePath,
        size: zipBlob.size,
        fileCount: files.length
      }
    });

  } catch (error: any) {
    console.error('Error creating protected zip:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create protected zip',
      details: process.env.NODE_ENV === 'development' ? 'Check Supabase bucket configuration' : undefined
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};