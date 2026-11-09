import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Upload, Button, Table, Tag, Space,
  Typography, Tooltip, message, Modal, Empty,
} from 'antd';
import {
  InboxOutlined, FileTextOutlined, FilePdfOutlined, DeleteOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SyncOutlined,
  SafetyCertificateOutlined, EyeOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload';
import type { ColumnsType } from 'antd/es/table';
import { knowledgeService } from '../../services/knowledgeService';
import { type KnowledgeFile } from '../../services/knowledgeService';
import MainLayout from '../../components/MainLayout';

const { Content } = Layout;
const { Dragger } = Upload;
const { Title, Text } = Typography;

const MOCK_SESSIONS = [
  { session_id: 1, title: "How TrustFlow works", last_active: "Today" },
  { session_id: 2, title: "RAG provenance test", last_active: "Yesterday" },
];

const KnowledgePage: React.FC = () => {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState<{ open: boolean; file: KnowledgeFile | null }>({
    open: false,
    file: null,
  });

const fetchFiles = async () => {
  setLoading(true);
  try {
    const data = await knowledgeService.getDocuments();
    setFiles(data);
  } catch (error: unknown) {
    console.error('Failed to load documents:', error);
    message.error(`Failed to load documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchFiles();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.toLowerCase() === 'pdf') return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />;
    return <FileTextOutlined style={{ color: '#1890ff', fontSize: 20 }} />;
  };

  const getStatusTag = (status: KnowledgeFile['status']) => {
    switch (status) {
      case 'ready':
        return <Tag icon={<CheckCircleOutlined />} color="success">Ready</Tag>;
      case 'processing':
        return <Tag icon={<SyncOutlined spin />} color="processing">Processing</Tag>;
      case 'uploading':
        return <Tag icon={<SyncOutlined spin />} color="default">Uploading</Tag>;
      case 'failed':
        return <Tag icon={<CloseCircleOutlined />} color="error">Failed</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.txt',
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      const fileObj = file as File;
      
      const tempId = Date.now();
      const placeholder: KnowledgeFile = {
        id: tempId,
        filename: fileObj.name,
        file_type: fileObj.name.split('.').pop() || '',
        file_size: fileObj.size,
        status: 'uploading',
        created_at: new Date().toISOString(),
      };
      setFiles(prev => [placeholder, ...prev]);

      try {
        await knowledgeService.uploadDocument(fileObj);
        message.success(`${fileObj.name} uploaded. Indexing is in progress.`);
        onSuccess?.(null);
        fetchFiles();
      } catch (err) {
        message.error(`${fileObj.name} upload failed`);
        setFiles(prev => prev.filter(f => f.id !== tempId));
        onError?.(err as Error);
      }
    },
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Confirm deletion',
      content: 'This document will be permanently removed from the knowledge base. Continue?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await knowledgeService.deleteDocument(id);
          message.success('Document deleted');
          setFiles(prev => prev.filter((f) => f.id !== id));
        } catch {
          message.error('Failed to delete document');
        }
      },
    });
  };

  const columns: ColumnsType<KnowledgeFile> = [
    {
      title: 'File name',
      dataIndex: 'filename',
      key: 'filename',
      render: (text, record) => (
        <Space>
          {getFileIcon(record.file_type)}
          <Text strong style={{ maxWidth: 200 }} ellipsis={{ tooltip: text }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'On-chain record',
      dataIndex: 'tx_hash',
      key: 'tx_hash',
      width: 150,
      render: (hash) => hash ? (
        <Tooltip title={hash}>
          <Tag icon={<SafetyCertificateOutlined />} color="green">
            {hash.slice(0, 10)}...
          </Tag>
        </Tooltip>
      ) : <Text type="secondary">Pending</Text>,
    },
    {
      title: 'Size',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 100,
      render: (size) => formatFileSize(size),
    },
    {
      title: 'Uploaded at',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (time) => time ? time.replace('T', ' ').slice(0, 16) : '-',
    },
    {
      title: 'Actions',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => setDetailModal({ open: true, file: record })}
            disabled={record.status !== 'ready'}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <MainLayout sessions={MOCK_SESSIONS}>
      <Content style={{ padding: '74px 24px 24px 24px', background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ marginBottom: 24 }}>
            <Title level={3}>Knowledge Base</Title>
            <Text type="secondary">Upload documents for private retrieval-augmented generation (RAG). Document hashes are recorded on-chain.</Text>
          </div>

          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <Dragger {...uploadProps} style={{ padding: '20px 0' }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#10a37f', fontSize: 48 }} />
              </p>
              <p className="ant-upload-text">Click or drag a PDF/TXT file to upload</p>
              <p className="ant-upload-hint">Maximum file size: 50 MB</p>
            </Dragger>
          </Card>

          <Card 
            title="Documents"
            extra={<Button icon={<SyncOutlined />} onClick={fetchFiles} loading={loading}>Refresh</Button>}
            style={{ borderRadius: 12 }}
          >
            <Table
              loading={loading}
              columns={columns}
              dataSource={files}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              locale={{ emptyText: <Empty description="No documents yet" /> }}
            />
          </Card>
        </div>

        <Modal
          title="Document details"
          open={detailModal.open}
          onCancel={() => setDetailModal({ open: false, file: null })}
          footer={[<Button key="ok" onClick={() => setDetailModal({ open: false, file: null })}>OK</Button>]}
        >
          {detailModal.file && (
            <div style={{ paddingTop: 10 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div><Text type="secondary">File name：</Text><Text strong>{detailModal.file.filename}</Text></div>
                
                <div><Text type="secondary">Blockchain transaction hash：</Text><br /><Text code>{detailModal.file.tx_hash || 'Recording...'}</Text></div>
                <div><Text type="secondary">System status：</Text>{getStatusTag(detailModal.file.status)}</div>
              </Space>
            </div>
          )}
        </Modal>
      </Content>
    </MainLayout>
  );
};

export default KnowledgePage;
