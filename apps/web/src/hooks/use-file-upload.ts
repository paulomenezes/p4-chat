'use client';

import { api } from '@p4-chat/backend/convex/_generated/api';
import type { Id } from '@p4-chat/backend/convex/_generated/dataModel';
import type { SessionId } from 'convex-helpers/server/sessions';
import { useMutation } from 'convex/react';
import type React from 'react';
import { useCallback, useRef, useState, type ChangeEvent, type DragEvent, type InputHTMLAttributes } from 'react';
import { toast } from 'sonner';

export type FileMetadata = {
  name: string;
  size: number;
  type: string;
  url: string;
  id: string;
};

export type FileWithPreview = {
  file: File | FileMetadata;
  id: string;
  preview?: string;
  storageId?: Id<'_storage'>;
  isLoading?: boolean;
};

export type FileUploadOptions = {
  maxFiles?: number; // Only used when multiple is true, defaults to Infinity
  maxSize?: number; // in bytes
  accept?: string;
  multiple?: boolean; // Defaults to false
  initialFiles?: FileMetadata[];
  onFilesChange?: (files: FileWithPreview[]) => void; // Callback when files change
  onFilesAdded?: (addedFiles: FileWithPreview[]) => void; // Callback when new files are added
  sessionId?: SessionId;
};

export type FileUploadState = {
  files: FileWithPreview[];
  isDragging: boolean;
};

export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  handleDragEnter: (e: DragEvent<HTMLElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLElement>) => void;
  handleDragOver: (e: DragEvent<HTMLElement>) => void;
  handleDrop: (e: DragEvent<HTMLElement>) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  openFileDialog: () => void;
  getInputProps: (props?: InputHTMLAttributes<HTMLInputElement>) => InputHTMLAttributes<HTMLInputElement> & {
    ref: React.Ref<HTMLInputElement>;
  };
};

export function useFileUpload(options: FileUploadOptions = {}): [FileUploadState, FileUploadActions] {
  const {
    maxFiles = Infinity,
    maxSize = Infinity,
    accept = '*',
    multiple = false,
    initialFiles = [],
    onFilesChange,
    onFilesAdded,
    sessionId,
  } = options;

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const addAttachment = useMutation(api.files.addAttachment);
  const deleteAttachment = useMutation(api.files.deleteById);

  const [state, setState] = useState<FileUploadState>({
    files: initialFiles.map((file) => ({
      file,
      id: file.id,
      preview: file.url,
    })),
    isDragging: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File | FileMetadata): string | null => {
      if (file instanceof File) {
        if (file.size > maxSize) {
          return `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`;
        }
      } else {
        if (file.size > maxSize) {
          return `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`;
        }
      }

      if (accept !== '*') {
        const acceptedTypes = accept.split(',').map((type) => type.trim());
        const fileType = file instanceof File ? file.type || '' : file.type;
        const fileExtension = `.${file instanceof File ? file.name.split('.').pop() : file.name.split('.').pop()}`;

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith('.')) {
            return fileExtension.toLowerCase() === type.toLowerCase();
          }
          if (type.endsWith('/*')) {
            const baseType = type.split('/')[0];
            return fileType.startsWith(`${baseType}/`);
          }
          return fileType === type;
        });

        if (!isAccepted) {
          return `File "${file instanceof File ? file.name : file.name}" is not an accepted file type.`;
        }
      }

      return null;
    },
    [accept, maxSize],
  );

  const createPreview = useCallback((file: File | FileMetadata): string | undefined => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return file.url;
  }, []);

  const generateUniqueId = useCallback((file: File | FileMetadata): string => {
    if (file instanceof File) {
      return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    return file.id;
  }, []);

  const clearFiles = useCallback(() => {
    setState((prev) => {
      // Clean up object URLs
      prev.files.forEach((file) => {
        if (file.preview && file.file instanceof File && file.file.type.startsWith('image/')) {
          URL.revokeObjectURL(file.preview);
        }
      });

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      const newState = {
        ...prev,
        files: [],
      };

      onFilesChange?.(newState.files);
      return newState;
    });
  }, [onFilesChange]);

  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      if (!newFiles || newFiles.length === 0) return;

      const newFilesArray = Array.from(newFiles);

      // In single file mode, clear existing files first
      if (!multiple) {
        clearFiles();
      }

      // Check if adding these files would exceed maxFiles (only in multiple mode)
      if (multiple && maxFiles !== Infinity && state.files.length + newFilesArray.length > maxFiles) {
        toast.error(`You can only upload a maximum of ${maxFiles} files.`);
        return;
      }

      const validFiles: FileWithPreview[] = [];

      newFilesArray.forEach((file) => {
        // Only check for duplicates if multiple files are allowed
        if (multiple) {
          const isDuplicate = state.files.some(
            (existingFile) => existingFile.file.name === file.name && existingFile.file.size === file.size,
          );

          // Skip duplicate files silently
          if (isDuplicate) {
            return;
          }
        }

        // Check file size
        if (file.size > maxSize) {
          toast.error(
            multiple
              ? `Some files exceed the maximum size of ${formatBytes(maxSize)}.`
              : `File exceeds the maximum size of ${formatBytes(maxSize)}.`,
          );
          return;
        }

        const error = validateFile(file);
        if (error) {
          toast.error(error);
        } else {
          validFiles.push({
            file,
            id: generateUniqueId(file),
            preview: createPreview(file),
            isLoading: true,
            storageId: undefined,
          });
        }
      });

      // Only update state if we have valid files to add
      if (validFiles.length > 0) {
        // First update state with loading files
        setState((prev) => {
          const newFiles = !multiple ? validFiles : [...prev.files, ...validFiles];
          onFilesChange?.(newFiles);
          return {
            ...prev,
            files: newFiles,
          };
        });

        // Call the onFilesAdded callback with the newly added valid files
        onFilesAdded?.(validFiles);

        toast.promise(
          Promise.all(
            validFiles.map(async (file) => {
              try {
                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': file.file.type },
                  // @ts-ignore
                  body: file.file,
                });

                const { storageId } = await result.json();

                if (!sessionId) {
                  return;
                }

                await addAttachment({
                  storageId,
                  name: file.file.name,
                  size: file.file.size,
                  type: file.file.type,
                  sessionId,
                });

                // Update state with storage ID and set loading to false
                setState((prev) => {
                  const updatedFiles = prev.files.map((f) =>
                    f.id === file.id
                      ? {
                          ...f,
                          storageId,
                          isLoading: false,
                        }
                      : f,
                  );
                  onFilesChange?.(updatedFiles);
                  return {
                    ...prev,
                    files: updatedFiles,
                  };
                });
              } catch (error) {
                // Handle upload error
                setState((prev) => {
                  const updatedFiles = prev.files.filter((f) => f.id !== file.id);
                  onFilesChange?.(updatedFiles);
                  toast.error(`Failed to upload ${file.file.name}`);
                  return {
                    ...prev,
                    files: updatedFiles,
                  };
                });
              }
            }),
          ),
          {
            loading: 'Uploading files...',
            success: 'Files uploaded successfully',
            error: 'Failed to upload files',
          },
        );
      }

      // Reset input value after handling files
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [
      state.files,
      maxFiles,
      multiple,
      maxSize,
      sessionId,
      validateFile,
      createPreview,
      generateUniqueId,
      clearFiles,
      onFilesChange,
      onFilesAdded,
    ],
  );

  const removeFile = useCallback(
    async (id: string) => {
      setState((prev) => {
        const fileToRemove = prev.files.find((file) => file.id === id);

        // Clean up preview URL if it exists
        if (fileToRemove?.preview && fileToRemove.file instanceof File && fileToRemove.file.type.startsWith('image/')) {
          URL.revokeObjectURL(fileToRemove.preview);
        }

        // Remove file from state immediately
        const newFiles = prev.files.filter((file) => file.id !== id);
        onFilesChange?.(newFiles);

        return {
          ...prev,
          files: newFiles,
        };
      });

      // Find the file to remove to check if it has a storage ID
      const fileToRemove = state.files.find((file) => file.id === id);

      // If the file was uploaded (has a storage ID), delete it from storage
      if (fileToRemove?.storageId) {
        try {
          await deleteAttachment({ storageId: fileToRemove.storageId });
        } catch (error) {
          // If deletion fails, add an error message but don't restore the file
          toast.error(`Failed to delete file "${fileToRemove.file.name}" from storage.`);
        }
      }
    },
    [state.files, onFilesChange, deleteAttachment],
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }

    setState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setState((prev) => ({ ...prev, isDragging: false }));

      // Don't process files if the input is disabled
      if (inputRef.current?.disabled) {
        return;
      }

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // In single file mode, only use the first file
        if (!multiple) {
          const file = e.dataTransfer.files[0];
          addFiles([file]);
        } else {
          addFiles(e.dataTransfer.files);
        }
      }
    },
    [addFiles, multiple],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
    },
    [addFiles],
  );

  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, []);

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => {
      return {
        ...props,
        type: 'file' as const,
        onChange: handleFileChange,
        accept: props.accept || accept,
        multiple: props.multiple !== undefined ? props.multiple : multiple,
        ref: inputRef,
      };
    },
    [accept, multiple, handleFileChange],
  );

  return [
    state,
    {
      addFiles,
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      getInputProps,
    },
  ];
}

// Helper function to format bytes to human-readable format
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}
