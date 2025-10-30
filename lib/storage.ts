import { supabase } from './supabase';

export function getUserFolder(userId: string): string {
  return `user-${userId}`;
}

export async function ensureUserFolder(userId: string): Promise<void> {
  const userFolder = getUserFolder(userId);
  
  // En Supabase Storage, las "carpetas" se crean automáticamente al subir archivos
  // Pero podemos verificar si existe intentando listar su contenido
  try {
    await supabase.storage
      .from('timechest-files')
      .list(userFolder);
  } catch (error) {
    console.log('User folder will be created on first file upload');
  }
}