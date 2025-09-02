'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { lyzrAPI } from '@/services/api';
import { FileUploadResult, DocumentStatus } from '@/types';

interface FileUploadProps {
  onUploadSuccess: (result: FileUploadResult) => void;
  onUploadError: (error: string) => void;
  isProcessing?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  isProcessing = false,
}) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      onUploadError('Please upload a PDF file only.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError('File size must be less than 10MB.');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await lyzrAPI.uploadIEPDocument(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.data) {
        setUploadStatus('success');
        onUploadSuccess(result.data);
      } else {
        setUploadStatus('error');
        onUploadError(result.error || 'Upload failed');
      }
    } catch (error: any) {
      setUploadStatus('error');
      onUploadError(error.message || 'Upload failed');
    }
  }, [onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    disabled: isProcessing || uploadStatus === 'uploading',
  });

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Upload className="w-8 h-8 text-primary-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-success-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-error-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading...';
      case 'success':
        return 'Upload successful!';
      case 'error':
        return 'Upload failed';
      default:
        return isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF file here, or click to select';
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'border-primary-500 bg-primary-50';
      case 'success':
        return 'border-success-500 bg-success-50';
      case 'error':
        return 'border-error-500 bg-error-50';
      default:
        return isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 hover:border-primary-500 hover:bg-primary-50
          ${getStatusColor()}
          ${(isProcessing || uploadStatus === 'uploading') ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {getStatusText()}
            </p>
            
            {uploadStatus === 'uploading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            <p className="text-sm text-gray-500">
              Supports PDF files up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* File Requirements */}
      <div className="mt-4 text-sm text-gray-600">
        <h4 className="font-medium mb-2">File Requirements:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>PDF format only</li>
          <li>Maximum file size: 10MB</li>
          <li>Single file upload (multi-page support coming soon)</li>
          <li>IEP documents with standard formatting preferred</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;

