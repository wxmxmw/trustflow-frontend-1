/* eslint-disable @typescript-eslint/no-explicit-any -- The verification API has no published response schema yet. */
import React, { useState } from 'react';
import {
  Layout, Card, Tabs, Input, Button, Upload, Typography, Tag, Progress,
  Descriptions, message, Timeline, Empty, Divider, Tooltip
} from 'antd';
import {
  FileTextOutlined, PictureOutlined, LinkOutlined, SafetyCertificateOutlined,
  CheckCircleOutlined, CloseCircleOutlined, InboxOutlined,
  ReadOutlined, KeyOutlined,
  ClockCircleOutlined, SearchOutlined, ArrowRightOutlined,
  FileOutlined, EyeOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import api from '../../services/api';
import { API_BASE_URL, resolveBackendUrl } from '../../services/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const PRIMARY_COLOR = '#10a37f';

const VerificationPage: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'image' | 'hash'>('text');
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
  const [resultData, setResultData] = useState<any>(null);

  const handleModeChange = (newMode: string) => {
    setMode(newMode as any);
    setResultData(null);
  };

  const handleCheck = async (type: 'text' | 'image') => {
    if (type === 'text' && !textInput.trim()) {
      message.warning('Enter content to verify');
      return;
    }
    if (type === 'image' && !uploadedFile) {
      message.warning('Upload an image');
      return;
    }

    setLoading(true);
    setResultData(null);

    const formData = new FormData();
    formData.append('type', type);
    if (type === 'text') formData.append('text', textInput);
    if (type === 'image') formData.append('file', uploadedFile as any);

    try {
      const data = await api.post<unknown, any>('/verify/check', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data && data.status) {
        setResultData(data);
        message.success(data.status === 'success' ? 'Verification passed!' : 'Verification complete');
      } else {
        message.error('Unexpected response data');
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      message.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHashLookup = async () => {
    if (!hashInput.trim() || !hashInput.startsWith('0x')) {
      message.warning('Enter a valid transaction hash starting with 0x');
      return;
    }
    setLoading(true);
    setResultData(null);
    try {
      const data = await api.get<unknown, any>(`/verify/tx/${hashInput}`);
      if (data && data.tx_hash) {
        setResultData({
          status: 'success',
          verification_type: 'hash_lookup',
          matched_record: data,
          citations: data.citations || [],
          dialog_chain: data.dialog_chain || [],
          blockchain_explorer_url: data.blockchain_explorer_url
        });
        message.success('Lookup complete');
      } else {
        message.error('No record found');
      }
    } catch {
      message.error('Lookup failed. Check the transaction hash.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitationClick = (cit: any) => {
    if (cit.url) {
      const targetUrl = resolveBackendUrl(cit.url);
      if (targetUrl) window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (cit.download_url) {
        const targetUrl = resolveBackendUrl(cit.download_url);
        if (targetUrl) window.open(`${targetUrl}#page=${cit.page || 1}`, '_blank', 'noopener,noreferrer');
        return;
    }
    if (cit.doc_id) {
        const fallbackUrl = `${API_BASE_URL}/api/v1/documents/${cit.doc_id}/preview#page=${cit.page || 1}`;
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    } else {
        message.warning('Unable to open this cited document');
    }
  };

  const handleViewOriginalContent = (content: string) => {
    if (!content) return;
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.opener = null;
        newWindow.document.title = 'Original Content - TrustFlow';
        const heading = newWindow.document.createElement('h2');
        heading.textContent = 'Original Content Viewer';
        const preview = newWindow.document.createElement('pre');
        preview.textContent = content;
        preview.style.whiteSpace = 'pre-wrap';
        newWindow.document.body.append(heading, preview);
    }
  };

  const renderVerificationResult = () => {
    if (!resultData) return null;

    const { status, verification_type, check_result } = resultData;
    const matched_record = resultData.matched_record;
    const original_record = resultData.original_record;
    
    const record = matched_record || original_record || resultData;
    
    const citations = resultData.citations || matched_record?.citations || [];
    const dialog_chain = resultData.dialog_chain || matched_record?.dialog_chain || [];
    const blockchain_explorer_url = resultData.blockchain_explorer_url;

    const timelineItems = (dialog_chain || []).map((item: any, i: number) => ({
      color: 'gray',
      dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
      children: (
        <div style={{ paddingBottom: 10 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>History entry #{i + 1}</Text>
          <div style={{ 
            fontFamily: 'monospace', 
            background: '#f5f5f5', 
            padding: '4px 8px', 
            borderRadius: 4, 
            fontSize: 12, 
            marginTop: 4,
            color: '#666'
          }}>
            {item.tx_hash}
          </div>
        </div>
      )
    }));

    if (record && record.tx_hash) {
      timelineItems.push({
        color: PRIMARY_COLOR,
        dot: <SafetyCertificateOutlined style={{ fontSize: '20px', color: PRIMARY_COLOR }} />,
        children: (
          <div style={{ paddingBottom: 10 }}>
             <Tag color={PRIMARY_COLOR} style={{ marginBottom: 8 }}>Latest verification entry</Tag>
             <div style={{ 
                fontFamily: 'monospace', 
                background: '#e6fffa', 
                border: `1px solid ${PRIMARY_COLOR}`,
                padding: '8px 12px', 
                borderRadius: 6, 
                fontSize: 13, 
                fontWeight: 600,
                color: '#333'
             }}>
               <KeyOutlined style={{ marginRight: 6 }}/>
               {record.tx_hash}
             </div>
             <div style={{ marginTop: 4, fontSize: 12, color: PRIMARY_COLOR }}>
               Created at: {record.created_at ? new Date(record.created_at).toLocaleString() : 'Just now'}
             </div>
          </div>
        )
      });
    }

    return (
      <div style={{ marginTop: 32, animation: 'fadeIn 0.5s ease' }}>
        <Divider style={{ color: '#999', fontSize: 14 }}>Verification report</Divider>

        <div style={{ 
          background: status === 'success' ? '#f6ffed' : (status === 'risky' ? '#fffbe6' : '#fff2f0'),
          border: `1px solid ${status === 'success' ? '#b7eb8f' : (status === 'risky' ? '#ffe58f' : '#ffccc7')}`,
          borderRadius: 12,
          padding: '24px',
          textAlign: 'center',
          marginBottom: 24
        }}>
           {status === 'success' ? (
              <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 12 }} />
            ) : status === 'risky' ? (
              <CheckCircleOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 12 }} />
            ) : (
              <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 12 }} />
            )}
            <Title level={4} style={{ margin: 0 }}>
              {status === 'success' ? 'Provenance verified' : (status === 'risky' ? 'Potential risk' : 'Verification failed')}
            </Title>
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
               {status === 'success' 
                 ? `Original record found on-chain (${verification_type === 'invisible_watermark' ? 'invisible watermark' : 'content hash'})`
                 : 'No exact on-chain match was found. The content may have changed.'}
            </Text>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <Card size="small" title="Confidence analysis" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
                {check_result && verification_type === 'semantic_similarity' ? (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <Progress 
                          type="dashboard" 
                          percent={Math.round((check_result.similarity_score || 0) * 100)} 
                          strokeColor={PRIMARY_COLOR}
                          width={100}
                        />
                        <div style={{ marginTop: 8 }}>Semantic similarity</div>
                    </div>
                ) : check_result && verification_type === 'invisible_watermark' ? (
                    <Descriptions column={1} size="small" layout="vertical">
                      <Descriptions.Item label="Watermark status">
                        {check_result.has_watermark ? <Tag color="success">Verified</Tag> : <Tag color="default">Not Found</Tag>}
                      </Descriptions.Item>
                      {check_result.extracted_data && (
                        <Descriptions.Item label="Extracted payload">
                          <Text code copyable>{check_result.extracted_data}</Text>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No analysis data" />
                )}
            </Card>

            <Card size="small" title="On-chain metadata" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
                {status === 'success' && record ? (
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Record ID">{record.record_id}</Descriptions.Item>
                      <Descriptions.Item label="AI Model">
                          <Tag color="geekblue">{record.model_name || 'Unknown'}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Timestamp">{record.created_at ? new Date(record.created_at).toLocaleDateString() : '-'}</Descriptions.Item>
                      {blockchain_explorer_url && resolveBackendUrl(blockchain_explorer_url) && (
                        <Descriptions.Item label="Explorer">
                          <Button type="link" size="small" href={resolveBackendUrl(blockchain_explorer_url) || undefined} target="_blank" rel="noopener noreferrer" style={{ padding: 0, height: 'auto' }}>
                            View on Etherscan <ArrowRightOutlined />
                          </Button>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </Card>
        </div>
        
        {record && (verification_type === 'semantic_similarity' || record.original_content || record.content_preview) && (
            <Card size="small" title="Content verification details" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12, marginBottom: 24 }}>
                <Descriptions column={1} layout="vertical" bordered>
                    <Descriptions.Item label="Content preview">
                        <div style={{ maxHeight: 100, overflowY: 'auto', color: '#555', fontSize: 13 }}>
                            {record.content_preview || "No preview available"}
                        </div>
                    </Descriptions.Item>
                    {record.original_content && (
                        <Descriptions.Item label="Original content">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text type="secondary">View the complete original on-chain record</Text>
                                <Button 
                                    type="primary" 
                                    ghost 
                                    size="small" 
                                    icon={<EyeOutlined />} 
                                    onClick={() => handleViewOriginalContent(record.original_content)}
                                >
                                    View Full Content
                                </Button>
                            </div>
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Card>
        )}

        {(citations.length > 0 || timelineItems.length > 0) && (
           <Card bordered={false} style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: 12 }}>
              <Tabs items={[
                  citations.length > 0 ? {
                      key: 'cite',
                      label: <span><ReadOutlined /> Evidence sources ({citations.length})</span>,
                      children: (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
                            {citations.map((cit: any, cIdx: number) => (
                                <div 
                                    key={cIdx} 
                                    onClick={() => handleCitationClick(cit)}
                                    style={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        cursor: 'pointer',
                                        border: '1px solid #e6e6e6',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = PRIMARY_COLOR; e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 163, 127, 0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e6e6e6'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                                            <FileTextOutlined style={{ color: '#1677ff', fontSize: 14 }} />
                                            <Text ellipsis style={{ fontWeight: 500, fontSize: 13, color: '#333', maxWidth: 220 }}>
                                                {cit.file_name}
                                            </Text>
                                        </div>
                                        {cit.score && (
                                            <Tag color="cyan" style={{ margin: 0, fontSize: 10, lineHeight: '16px', border: 'none' }}>
                                                Match: {(cit.score * 100).toFixed(0)}%
                                            </Tag>
                                        )}
                                    </div>
                                    
                                    <div style={{ 
                                        fontSize: 12, 
                                        color: '#666', 
                                        lineHeight: '1.5',
                                        marginBottom: 8,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        background: '#fafafa',
                                        padding: '4px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        {cit.content_snippet || cit.text_snippet || "No excerpt available..."}
                                    </div>

                                    {(cit.file_hash || cit.chunk_hash) && (
                                        <div style={{ 
                                            marginBottom: 8, 
                                            paddingTop: 8,
                                            borderTop: '1px dashed #eee',
                                            fontSize: 10, 
                                            fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
                                            color: '#888'
                                        }}>
                                            {cit.file_hash && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <KeyOutlined style={{ fontSize: 10 }}/> File Hash:
                                                    </span>
                                                    <Tooltip title={cit.file_hash} overlayStyle={{ maxWidth: 400 }}>
                                                        <span style={{ color: '#aaa', cursor: 'text' }}>
                                                            {cit.file_hash.substring(0, 8)}...{cit.file_hash.substring(cit.file_hash.length - 6)}
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                            )}
                                            {cit.chunk_hash && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <SafetyCertificateOutlined style={{ fontSize: 10 }}/> Chunk Hash:
                                                    </span>
                                                    <Tooltip title={cit.chunk_hash} overlayStyle={{ maxWidth: 400 }}>
                                                        <span style={{ color: '#aaa', cursor: 'text' }}>
                                                            {cit.chunk_hash.substring(0, 8)}...{cit.chunk_hash.substring(cit.chunk_hash.length - 6)}
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#999' }}>
                                        <span>P.{cit.page || 'N/A'}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', color: PRIMARY_COLOR, gap: 2 }}>
                                            View details <LinkOutlined />
                                        </span>
                                    </div>
                                </div>
                            ))}
                          </div>
                      )
                  } : null,
                  timelineItems.length > 0 ? {
                      key: 'chain',
                      label: <span><FileOutlined /> Full provenance trail</span>,
                      children: (
                          <div style={{ padding: '20px 10px' }}>
                             <Timeline items={timelineItems} />
                          </div>
                      )
                  } : null
              ].filter(Boolean) as any} />
           </Card>
        )}
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
             <div style={{ 
               width: 64, height: 64, margin: '0 auto 16px', 
               background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #1a7f5a 100%)`, 
               borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
               boxShadow: '0 8px 20px rgba(16, 163, 127, 0.3)'
             }}>
                <SafetyCertificateOutlined style={{ fontSize: 32, color: '#fff' }} />
             </div>
             <Title level={2} style={{ marginBottom: 8 }}>TrustFlow Verification</Title>
             <Text type="secondary" style={{ fontSize: 16 }}>Decentralized content verification and provenance</Text>
          </div>

          <Card 
            bordered={false} 
            style={{ 
              borderRadius: 24, 
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <Tabs
              activeKey={mode}
              onChange={handleModeChange}
              centered
              size="large"
              tabBarStyle={{ marginBottom: 32 }}
              items={[
                {
                  key: 'text',
                  label: <span style={{ padding: '0 10px' }}><FileTextOutlined /> Verify text</span>,
                  children: (
                    <div style={{ maxWidth: 600, margin: '0 auto' }}>
                      <TextArea 
                        rows={6} 
                        value={textInput} 
                        onChange={e => setTextInput(e.target.value)} 
                        placeholder="Paste the text to verify..."
                        style={{ 
                          marginBottom: 20, borderRadius: 12, padding: 16, fontSize: 15,
                          border: '1px solid #e0e0e0', background: '#fafafa'
                        }}
                      />
                      <Button 
                        type="primary" block size="large" 
                        onClick={() => handleCheck('text')} 
                        loading={loading}
                        style={{ background: PRIMARY_COLOR, height: 48, fontSize: 16, borderRadius: 12 }}
                      >
                        Verify text
                      </Button>
                    </div>
                  )
                },
                {
                  key: 'image',
                  label: <span style={{ padding: '0 10px' }}><PictureOutlined /> Verify image</span>,
                  children: (
                    <div style={{ maxWidth: 600, margin: '0 auto' }}>
                      <Dragger 
                        maxCount={1}
                        beforeUpload={(f) => { setUploadedFile(f as any); return false; }}
                        onRemove={() => setUploadedFile(null)}
                        style={{ background: '#fafafa', border: '2px dashed #d9d9d9', borderRadius: 16, padding: '20px 0' }}
                      >
                        <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: PRIMARY_COLOR }} /></p>
                        <p className="ant-upload-text" style={{ fontSize: 16 }}>Click or drag an image to upload</p>
                        <p className="ant-upload-hint">Supports JPG and PNG; extracts invisible watermarks</p>
                      </Dragger>
                      <Button 
                        type="primary" block size="large" 
                        style={{ marginTop: 24, background: PRIMARY_COLOR, height: 48, fontSize: 16, borderRadius: 12 }} 
                        disabled={!uploadedFile} 
                        onClick={() => handleCheck('image')} 
                        loading={loading}
                      >
                        Verify watermark and source
                      </Button>
                    </div>
                  )
                },
                {
                  key: 'hash',
                  label: <span style={{ padding: '0 10px' }}><LinkOutlined /> Hash lookup</span>,
                  children: (
                    <div style={{ maxWidth: 600, margin: '0 auto' }}>
                      <Input 
                        size="large" 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="Enter a transaction hash starting with 0x"
                        value={hashInput} 
                        onChange={e => setHashInput(e.target.value)} 
                        style={{ marginBottom: 20, borderRadius: 12, padding: '10px 16px', background: '#fafafa' }}
                      />
                      <Button 
                        type="primary" block size="large" 
                        onClick={handleHashLookup} 
                        loading={loading}
                        style={{ background: PRIMARY_COLOR, height: 48, fontSize: 16, borderRadius: 12 }}
                      >
                        Search on-chain
                      </Button>
                    </div>
                  )
                }
              ]}
            />
            
            {renderVerificationResult()}
          </Card>
          
          <div style={{ textAlign: 'center', marginTop: 40, color: '#bbb' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Powered by TrustFlow Blockchain · Immutable & Verifiable</Text>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default VerificationPage;
