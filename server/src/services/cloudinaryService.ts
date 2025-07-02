import { cloudinary } from "../configs/cloudinary"
import { sanitizeFilename } from '../helpers/utils';
import { IDocument } from '../models/Submission';

class CloudinaryService {
  private getFolderPath(submissionId: string): string {
    return `learners_license/${submissionId}`;
  }

  private getResourceType(mimeType: string): 'image' | 'raw' {
    return mimeType.startsWith('image/') ? 'image' : 'raw';
  }

  async uploadFile(
    file: Express.Multer.File,
    documentType: string,
    submissionId: string
  ): Promise<IDocument> {
    try {
      const folder = this.getFolderPath(submissionId);
      const filename = sanitizeFilename(file.originalname);
      const publicId = `${folder}/${documentType}_${Date.now()}_${filename}`;
      
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: this.getResourceType(file.mimetype),
            folder: folder,
            // Add transformations for images
            ...(file.mimetype.startsWith('image/') && {
              transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
              ]
            })
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(new Error('Failed to upload file to cloud storage'));
              return;
            }

            if (!result) {
              reject(new Error('Upload result is undefined'));
              return;
            }

            const document: IDocument = {
              url: result.secure_url,
              publicId: result.public_id,
              originalName: file.originalname,
              size: file.size,
              mimeType: file.mimetype,
              uploadedAt: new Date()
            };

            resolve(document);
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result !== 'ok') {
        console.warn(`Failed to delete file with public_id: ${publicId}`, result);
      }
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      // Don't throw error as this shouldn't block other operations
    }
  }

  async deleteFolder(submissionId: string): Promise<void> {
    try {
      const folder = this.getFolderPath(submissionId);
      
      // List all resources in the folder
      const resources = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 100
      });

      // Delete all resources in the folder
      if (resources.resources.length > 0) {
        const publicIds = resources.resources.map((resource: any) => resource.public_id);
        await cloudinary.api.delete_resources(publicIds);
      }

      // Delete the folder itself
      await cloudinary.api.delete_folder(folder);
    } catch (error) {
      console.error('Error deleting folder from Cloudinary:', error);
      // Don't throw error as this shouldn't block other operations
    }
  }

  async getFileUrl(publicId: string): Promise<string> {
    try {
      return cloudinary.url(publicId, {
        secure: true,
        sign_url: true,
        type: 'authenticated'
      });
    } catch (error) {
      console.error('Error generating file URL:', error);
      throw new Error('Failed to generate file URL');
    }
  }

  async optimizeImage(publicId: string, options: any = {}): Promise<string> {
    try {
      return cloudinary.url(publicId, {
        secure: true,
        quality: 'auto:good',
        fetch_format: 'auto',
        ...options
      });
    } catch (error) {
      console.error('Error optimizing image:', error);
      throw new Error('Failed to optimize image');
    }
  }

  async generateThumbnail(publicId: string): Promise<string> {
    try {
      return cloudinary.url(publicId, {
        secure: true,
        width: 150,
        height: 150,
        crop: 'fill',
        quality: 'auto:low',
        fetch_format: 'auto'
      });
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }
}

export const cloudinaryService = new CloudinaryService();