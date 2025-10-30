import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { supabase } from '../../../lib/supabase';
import { getUserFolder } from '../../../lib/storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
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

    // Crear carpeta subiendo un archivo .keep
    const { error } = await supabase.storage
      .from('timechest-files')
      .upload(`${userFolder}/.keep`, new Blob([]), { 
        upsert: true,
        contentType: 'text/plain'
      });

    if (error && !error.message.includes('already exists')) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'User folder created successfully',
      userFolder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}