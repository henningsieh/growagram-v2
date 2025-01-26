export const uploadToS3 = async (
  file: File,
  uploadUrl: string,
): Promise<{
  url: string;
  eTag: string;
}> => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  return {
    // Return the URL without query parameters
    url: uploadUrl.split("?")[0],
    // Extract ETag from response headers (and remove any single or double quotes)
    eTag: response.headers.get("ETag")?.replace(/['"]/g, "") || "",
  };
};
