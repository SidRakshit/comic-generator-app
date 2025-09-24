// File utility functions

/**
 * Converts a file to a data URL
 * 
 * @param file - File object to convert
 * @returns Promise that resolves to data URL string
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const dataUrl = await fileToDataUrl(file);
 * console.log(dataUrl); // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 * ```
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a file to an ArrayBuffer
 * 
 * @param file - File object to convert
 * @returns Promise that resolves to ArrayBuffer
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const buffer = await fileToArrayBuffer(file);
 * console.log(buffer.byteLength); // File size in bytes
 * ```
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Converts a file to text
 * 
 * @param file - File object to convert
 * @returns Promise that resolves to text string
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const text = await fileToText(file);
 * console.log(text); // File contents as string
 * ```
 */
export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Gets file size in human-readable format
 * 
 * @param bytes - File size in bytes
 * @returns Human-readable file size string
 * 
 * @example
 * ```typescript
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 * formatFileSize(1073741824) // "1 GB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gets file extension from filename
 * 
 * @param filename - Filename to extract extension from
 * @returns File extension (without dot) or empty string
 * 
 * @example
 * ```typescript
 * getFileExtension("image.png") // "png"
 * getFileExtension("document.pdf") // "pdf"
 * getFileExtension("noextension") // ""
 * ```
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot + 1).toLowerCase();
}

/**
 * Checks if a file type is an image
 * 
 * @param file - File object to check
 * @returns True if file is an image
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * if (isImageFile(file)) {
 *   // Handle image file
 * }
 * ```
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Checks if a file type is a video
 * 
 * @param file - File object to check
 * @returns True if file is a video
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * if (isVideoFile(file)) {
 *   // Handle video file
 * }
 * ```
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * Validates file size against a maximum limit
 * 
 * @param file - File object to validate
 * @param maxSizeBytes - Maximum size in bytes
 * @returns True if file size is within limit
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const maxSize = 5 * 1024 * 1024; // 5MB
 * if (validateFileSize(file, maxSize)) {
 *   // File is within size limit
 * }
 * ```
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}
