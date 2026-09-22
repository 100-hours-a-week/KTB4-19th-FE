import { apiRequest } from "@/shared/api";

export type FilePurpose = "CONVERSATION" | "RULE_DOCUMENT";

export type FileUploadRequest = {
  originalName: string;
  fileType: string;
  fileSize: number;
  purpose: FilePurpose;
};

export type FileUploadResponse = {
  attachmentId: number;
  uploadUrl: string;
  expiresIn: number;
  requiredHeaders: Record<string, string>;
};

export type FileCompleteResponse = {
  attachmentId: number;
  fileKey: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  fileStatus: "UPLOADED";
};

export type RuleDocumentResponse = {
  documentId: number;
  attachmentId: number;
  title: string;
  version: number;
  updatedAt: string;
};

const extensionOf = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension === "jpeg" ? "jpg" : extension ?? "";
};

export const fileApi = {
  createUpload: (file: File, purpose: FilePurpose) =>
    apiRequest<FileUploadResponse>("/files", {
      method: "POST",
      body: {
        originalName: file.name,
        fileType: extensionOf(file),
        fileSize: file.size,
        purpose,
      } satisfies FileUploadRequest,
    }),

  uploadToS3: async (upload: FileUploadResponse, file: File) => {
    const response = await fetch(upload.uploadUrl, {
      method: "PUT",
      headers: upload.requiredHeaders,
      body: file,
    });
    if (!response.ok) throw new Error("S3 파일 업로드에 실패했습니다.");
  },

  complete: (attachmentId: number) =>
    apiRequest<FileCompleteResponse>(`/files/${attachmentId}`, {
      method: "PATCH",
      body: { fileStatus: "UPLOADED" },
    }),

  createDocument: (attachmentId: number, title: string) =>
    apiRequest<RuleDocumentResponse>("/managers/me/documents", {
      method: "POST",
      body: { attachmentId, title },
    }),

  listDocuments: () =>
    apiRequest<RuleDocumentResponse[]>("/managers/me/documents"),
};
