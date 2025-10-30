import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { supabase } from '../../../lib/supabase';
import { getUserFolder } from '../../../lib/storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Verificar token JWT para obtener el usuario
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const userFolder = getUserFolder(userId);

    // Listar archivos de la carpeta del usuario
    const { data, error } = await supabase.storage
      .from('llakaScriptBucket') // Cambiado a llakaScriptBucket
      .list(userFolder);

    if (error) {
      // Si la carpeta no existe, devolver lista vacía
      if (error.message.includes('not found')) {
        return res.status(200).json({
          success: true,
          files: [],
          totalCount: 0,
          totalSize: 0,
          userFolder,
        });
      }
      throw error;
    }

    // Calcular estadísticas
    const totalCount = data.length;
    const totalSize = data.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);

    // Obtener URLs públicas para cada archivo
    const filesWithUrls = await Promise.all(
      data.map(async (file) => {
        const filePath = `${userFolder}/${file.name}`;
        const { data: urlData } = supabase.storage
          .from('llakaScriptBucket') // Cambiado a llakaScriptBucket
          .getPublicUrl(filePath);

        return {
          ...file,
          url: urlData.publicUrl,
          userFolder,
        };
      })
    );

    res.status(200).json({
      success: true,
      files: filesWithUrls,
      totalCount,
      totalSize,
      userFolder,
    });
  } catch (error: any) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      files: [],
      totalCount: 0,
      totalSize: 0,
      userFolder: '',
    });
  }
}