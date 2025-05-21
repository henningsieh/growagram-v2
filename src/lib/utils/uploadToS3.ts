export const uploadToS3 = (
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void, // Add onProgress callback
): Promise<{
  url: string;
  eTag: string;
}> => {
  // Use XMLHttpRequest instead of fetch for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);

    // Track progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    // Handle successful upload
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Ensure progress reaches 100% on completion
        if (onProgress) {
          onProgress(100);
        }
        resolve({
          // Return the URL without query parameters
          url: uploadUrl.split("?")[0],
          // Extract ETag from response headers (and remove any single or double quotes)
          eTag: xhr.getResponseHeader("ETag")?.replace(/['"]/g, "") || "",
        });
      } else {
        reject(new Error(`Failed to upload file: ${xhr.statusText}`));
      }
    };

    // Handle errors
    xhr.onerror = () => {
      reject(new Error("Network error during file upload"));
    };

    xhr.send(file);
  });
};
