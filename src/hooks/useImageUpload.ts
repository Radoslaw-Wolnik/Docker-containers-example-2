
export function useImageUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
  
    const upload = useCallback(async (file: File) => {
      setUploading(true);
      setProgress(0);
      setError(null);
  
      const formData = new FormData();
      formData.append('image', file);
  
      try {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(Math.round(percentComplete));
          }
        });
  
        const response = await new Promise<any>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.response));
            } else {
              reject(new Error('Upload failed'));
            }
          };
          xhr.onerror = () => reject(new Error('Upload failed'));
          
          xhr.open('POST', '/api/images/upload');
          xhr.send(formData);
        });
  
        return response.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        throw err;
      } finally {
        setUploading(false);
        setProgress(0);
      }
    }, []);
  
    return {
      upload,
      uploading,
      progress,
      error,
    };
  }