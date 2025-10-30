import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { supabase } from '../../../lib/supabase';
import { getUserFolder } from '../../../lib/storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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

    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'File name is required',
      });
    }

    const userFolder = getUserFolder(userId);
    const filePath = `${userFolder}/${fileName}`;

    const { error } = await supabase.storage
      .from('llakaScriptBucket') // Cambiado a llakaScriptBucket
      .remove([filePath]);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}