import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { supabase } from '../../../lib/supabase';
import { getUserFolder } from '../../../lib/storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    let userId: string|any;

    // Obtener userId del token o del body
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (jwtError) {
        console.log('JWT verification failed, trying body userId');
      }
    }

    // Si no hay token válido, usar userId del body
    if (!userId) {
      userId = req.body.userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User ID is required' });
    }

    const { fileData, fileName, fileType, filePath = '' } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'File data and file name are required',
      });
    }

    const userFolder = getUserFolder(userId);
    const fullFilePath = filePath ? `${userFolder}/${filePath}/${fileName}` : `${userFolder}/${fileName}`;

    // Validar tamaño del archivo
    const fileSize = Buffer.from(fileData, 'base64').length;
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (fileSize > maxSize) {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size is 10MB.`,
      });
    }

    // Convertir base64 a blob
    const buffer = Buffer.from(fileData, 'base64');
    const file = new Blob([buffer], { type: fileType });

    console.log('Uploading to:', fullFilePath);
    
    const { data, error } = await supabase.storage
      .from('llakaScriptBucket') // Cambiado a llakaScriptBucket
      .upload(fullFilePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      
      if (error.message.includes('bucket') || error.message.includes('not found')) {
        return res.status(500).json({
          success: false,
          message: 'Storage bucket "llakaScriptBucket" not found.',
        });
      }
      
      if (error.message.includes('exists')) {
        return res.status(409).json({
          success: false,
          message: 'File already exists',
        });
      }
      
      throw error;
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('llakaScriptBucket') // Cambiado a llakaScriptBucket
      .getPublicUrl(fullFilePath);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: data,
      fileUrl: urlData.publicUrl,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}