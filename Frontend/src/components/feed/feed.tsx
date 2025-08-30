import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Button, Table, Modal, Form, Input, notification, Card, Statistic, InputNumber } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined, ToolOutlined } from '@ant-design/icons';
import './feed.css';
import moment from 'moment';

interface FeedRecord {
  _id: string;
  name: string;
  quantity: number;
  supplier: {
    name: string;
  };
  orderDate: string;
  usageRecords: {
    usageDate: string;
    amountUsed: number;
  }[];
}

const Feed = () => {
  const [data, setData] = useState<FeedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUsageModalVisible, setIsUsageModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FeedRecord | null>(null);
  const [usageFeedId, setUsageFeedId] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    totalFeed: 0,
    averageUsage: 0,
    lowStock: 0,
    totalTypes: 0
  });
  const [form] = Form.useForm();
  const [usageForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetch('http://localhost:5000/api/feeds', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const response = await result.json();
      setData(response.data);
      calculateStatistics(response.data);
    } catch (err) {
      setError('Failed to fetch feed data');
      notification.error({ message: 'Error', description: 'Failed to fetch feed data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateStatistics = (feedData: FeedRecord[]) => {
    const total = feedData.reduce((sum, record) => sum + record.quantity, 0);
    const totalUsage = feedData.reduce((sum, record) => sum + record.usageRecords.reduce((acc, usage) => acc + usage.amountUsed, 0), 0);
    const avgUsage = totalUsage / (feedData.length || 1);
    const lowStock = feedData.filter(record => record.quantity < 10).length;
    setStatistics({ totalFeed: total, averageUsage: Math.round(avgUsage), lowStock, totalTypes: feedData.length });
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: FeedRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleRecordUsage = (record: FeedRecord) => {
    setUsageFeedId(record._id);
    usageForm.resetFields();
    setIsUsageModalVisible(true);
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    const feedData = {
      name: values.name,
      quantity: values.quantity,
      supplier: values.supplier,
      orderDate: new Date().toISOString()
    };
    try {
      const response = await fetch('http://localhost:5000/api/feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(feedData)
      });
      const data = await response.json();
      if (data.success) {
        notification.success({ message: 'Success', description: `Feed ${editingRecord ? 'updated' : 'added'} successfully` });
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to save feed' });
    } finally {
      setLoading(false);
    }
  };

  const handleUsageSubmit = async (values: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/feeds/usage', {
        method: 'POST', // ✅ corrected method
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ feedId: usageFeedId, amountUsed: values.amountUsed })
      });

      const data = await response.json();
      if (data.success) {
        notification.success({ message: 'Usage Recorded', description: 'Feed usage recorded successfully.' });
        setIsUsageModalVisible(false);
        fetchData();
      } else {
        notification.error({ message: 'Error', description: data.message || 'Failed to record usage' });
      }
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to record usage' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feeds/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        notification.success({ message: 'Success', description: 'Feed deleted successfully' });
        fetchData();
      }
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to delete feed' });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/feeds/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'feed-inventory.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to export feed data' });
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a: FeedRecord, b: FeedRecord) => a.name.localeCompare(b.name) },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', sorter: (a: FeedRecord, b: FeedRecord) => a.quantity - b.quantity },
    { title: 'Supplier', dataIndex: ['supplier', 'name'], key: 'supplier' },
    { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate', render: (date: string) => moment(date).format('YYYY-MM-DD') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FeedRecord) => (
        <div className="action-buttons">
          <Button icon={<EditOutlined />} type="link" onClick={() => handleEdit(record)} />
          <Button icon={<ToolOutlined />} type="link" onClick={() => handleRecordUsage(record)} />
          <Button icon={<DeleteOutlined />} type="link" danger onClick={() => handleDelete(record._id)} />
        </div>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="feed-header">
        <h1>Feed Management</h1>
        <div className="action-buttons">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Feed</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
        </div>
      </div>

      <div className="statistics-cards">
        <Card><Statistic title="Total Feed" value={statistics.totalFeed} suffix="kg" /></Card>
        <Card><Statistic title="Average Usage" value={statistics.averageUsage} suffix="kg/day" /></Card>
        <Card><Statistic title="Low Stock Items" value={statistics.lowStock} /></Card>
        <Card><Statistic title="Total Feed Types" value={statistics.totalTypes} /></Card>
      </div>

      <Table columns={columns} dataSource={data} loading={loading} rowKey="_id" pagination={{ pageSize: 8 }} />

      <Modal title={editingRecord ? 'Edit Feed' : 'Add New Feed'} open={isModalVisible} onOk={() => form.validateFields().then(handleSave).catch(() => {})} onCancel={() => { setIsModalVisible(false); setEditingRecord(null); form.resetFields(); }}>
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="name" label="Feed Name" rules={[{ required: true, message: 'Please input feed name!' }]}><Input /></Form.Item>
          <Form.Item name="quantity" label="Quantity (kg)" rules={[{ required: true, message: 'Please input quantity!' }]}><Input type="number" min={0} /></Form.Item>
          <Form.Item name={['supplier', 'name']} label="Supplier" rules={[{ required: true, message: 'Please input supplier name!' }]}><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Record Feed Usage" open={isUsageModalVisible} onOk={() => usageForm.validateFields().then(handleUsageSubmit).catch(() => {})} onCancel={() => setIsUsageModalVisible(false)}>
        <Form form={usageForm} onFinish={handleUsageSubmit} layout="vertical">
          <Form.Item name="amountUsed" label="Amount Used (kg)" rules={[{ required: true, message: 'Please enter usage amount' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default Feed;
