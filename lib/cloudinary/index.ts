const uploadSingleFile = async (file: File) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Upload failed");
  }

  return data.url as string;
};

export const uploadFileToCloudinary = async (file: File | File[] | null) => {
  if (!file) {
    throw new Error("Missing file");
  }

  if (Array.isArray(file)) {
    return Promise.all(file.map(uploadSingleFile));
  }

  return uploadSingleFile(file);
};
