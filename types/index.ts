export interface User {
    _id?: string;
    email: string;
    password: string;
    name: string;
    resetToken?: string;
    resetTokenExpiry?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    user?: Omit<User, 'password'>;
    token?: string;
  }


  export interface UserFile {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: {
      size: number;
      mimetype: string;
      cacheControl: string;
    };
    userFolder?: string;
  }
  
  export interface FileUploadResponse {
    success: boolean;
    message: string;
    file?: UserFile;
    error?: string;
  }
  
  export interface FileListResponse {
    success: boolean;
    files: UserFile[];
    totalCount: number;
    totalSize: number;
    userFolder: string;
    error?: string;
  }