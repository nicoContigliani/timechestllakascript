// pages/api/files/create-protected-zip.ts
import { NextApiRequest, NextApiResponse } from 'next';
import JSZip from 'jszip';
import CryptoJS from 'crypto-js';
import { supabase } from '@/lib/supabase';

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

    console.log(`Creating encrypted ZIP for user ${userId} with ${files.length} files`);

    const bucketName = "llakaScriptBucket";
    const userFolder = `user-${userId}`;
    const timestamp = Date.now();
    const zipFileName = `protected-${timestamp}.zip`;
    const filePath = `${userFolder}/${zipFileName}`;

    // Paso 1: Crear ZIP normal
    const zip = new JSZip();

    // Agregar archivos al ZIP
    for (const file of files) {
      if (file?.name && file?.data) {
        try {
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
      protection: "TimeChest AES-256 Protected",
      note: "Este archivo está encriptado con AES-256"
    };
    zip.file('_metadata.json', JSON.stringify(metadata, null, 2));

    // Generar ZIP como ArrayBuffer
    console.log('Generating ZIP file...');
    const zipArrayBuffer = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    console.log(`ZIP created: ${zipArrayBuffer.byteLength} bytes`);

    // Paso 2: Encriptar el ZIP con AES
    console.log('Encrypting ZIP with AES-256...');
    
    // Convertir ArrayBuffer a WordArray
    const zipWordArray = CryptoJS.lib.WordArray.create(zipArrayBuffer);
    
    // Encriptar con AES
    const encrypted = CryptoJS.AES.encrypt(zipWordArray, password, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Obtener el resultado encriptado como Base64
    const encryptedBase64 = encrypted.toString();
    
    // Convertir Base64 a Buffer
    const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');

    console.log(`ZIP encrypted: ${encryptedBuffer.length} bytes`);

    // Verificar/Crear carpeta del usuario
    try {
      await supabase.storage
        .from(bucketName)
        .upload(`${userFolder}/.keep`, new Blob([]), { upsert: true });
    } catch (folderError) {
      console.log('Folder check completed');
    }

    // Subir a Supabase (ENCRIPTADO)
    console.log(`Uploading encrypted ZIP to: ${filePath}`);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, encryptedBuffer, {
        upsert: false,
        cacheControl: '3600',
        contentType: 'application/octet-stream'
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('Encrypted ZIP upload successful!');

    res.status(200).json({
      success: true,
      message: 'Files encrypted and compressed successfully',
      file: {
        name: zipFileName,
        url: urlData.publicUrl,
        path: filePath,
        size: encryptedBuffer.length,
        originalSize: zipArrayBuffer.byteLength,
        fileCount: files.length,
        encrypted: true,
        encryptionMethod: 'AES-256'
      }
    });

  } catch (error: any) {
    console.error('Error creating encrypted zip:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create encrypted zip'
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