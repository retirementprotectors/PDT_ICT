import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  ListItemSecondaryAction,
} from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  border: '2px dashed',
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

interface ProcessedFile {
  original_filename: string;
  new_filename: string;
  document_type: string;
  policy_number: string;
  client_name: string;
  carrier: string;
  year?: string;
  drive_link?: string;
}

export const PDFUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out non-PDF files
    const pdfFiles = acceptedFiles.filter(
      file => file.type === 'application/pdf'
    );
    
    if (pdfFiles.length !== acceptedFiles.length) {
      setError('Some files were rejected. Only PDF files are allowed.');
    }

    setFiles(prev => [...prev, ...pdfFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setError(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/documents/process', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to process files');
      }

      const data = await response.json();
      setProcessedFiles(data.files);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing files');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <UploadBox {...getRootProps()}>
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Drop the PDF files here'
            : 'Drag and drop PDF files here, or click to select files'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Only PDF files are accepted
        </Typography>
      </UploadBox>

      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          <List>
            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => removeFile(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <UploadIcon />}
            sx={{ mt: 2 }}
          >
            {processing ? 'Processing...' : 'Process Files'}
          </Button>
        </Box>
      )}

      {processedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Processed Files
          </Typography>
          <List>
            {processedFiles.map((file, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={file.new_filename}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" display="block">
                        Original: {file.original_filename}
                      </Typography>
                      <Typography component="span" variant="body2" display="block">
                        Type: {file.document_type} | Policy: {file.policy_number}
                      </Typography>
                      <Typography component="span" variant="body2" display="block">
                        Client: {file.client_name} | Carrier: {file.carrier}
                      </Typography>
                      {file.drive_link && (
                        <Button
                          href={file.drive_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          View in Drive
                        </Button>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}; 