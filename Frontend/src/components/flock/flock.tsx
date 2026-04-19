import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, notification, Popconfirm, Card, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import './flock.css';
import { api, BASE_URL } from '../../services/api';
import MainLayout from '../mainfile/main';

const { Option } = Select;

const Flock = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<string | null>(null);

    // Fetch flocks
    const fetchFlocks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/flock');
            setData(response.data || []);
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to fetch flocks' });
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlocks();
    }, []);

    // Handlers
    const handleAddOrUpdate = async (values: any) => {
        try {
            // Map frontend fields to backend schema
            const payload = {
                name: values.name,
                breed: values.breed,
                numberOfHens: values.numberOfHens,
                healthStatus: values.healthStatus,
                acquisitionDate: values.acquisitionDate
            };

            if (editingId) {
                await api.put(`/flock/${editingId}`, payload);
                notification.success({ message: 'Success', description: 'Flock updated' });
            } else {
                await api.post('/flock', payload);
                notification.success({ message: 'Success', description: 'Flock added' });
            }
            setIsModalVisible(false);
            setEditingId(null);
            form.resetFields();
            fetchFlocks();
        } catch (err: any) {
            notification.error({ 
                message: 'Error', 
                description: err.message || 'Operation failed' 
            });
        }
    };

    const handleEdit = (record: any) => {
        setEditingId(record._id);
        form.setFieldsValue({
            name: record.name,
            breed: record.breed,
            numberOfHens: record.numberOfHens,
            healthStatus: record.healthStatus,
            acquisitionDate: record.acquisitionDate ? record.acquisitionDate.split('T')[0] : ''
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${BASE_URL}/flock/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                notification.success({ message: 'Deleted', description: 'Flock removed' });
                fetchFlocks();
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to delete' });
        }
    };

    const columns = [
        {
            title: 'Flock ID',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: any, b: any) => (a.name || '').localeCompare(b.name || '')
        },
        {
            title: 'Breed',
            dataIndex: 'breed',
            key: 'breed',
            sorter: (a: any, b: any) => (a.breed || '').localeCompare(b.breed || '')
        },
        { title: 'Birds', dataIndex: 'numberOfHens', key: 'numberOfHens' },
        {
            title: 'Status',
            dataIndex: 'healthStatus',
            key: 'healthStatus',
            render: (status: string) => (
                <Tag color={status === 'Healthy' ? 'green' : (status === 'Sick' ? 'red' : 'orange')}>
                    {(status || 'Unknown').toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Remove this flock?" onConfirm={() => handleDelete(record._id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="flock-container">
                <Card title="🐣 Flock Management" extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setIsModalVisible(true); }}>
                        New Flock
                    </Button>
                }>
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 8 }}
                    />

                    <Modal
                        title={editingId ? 'Edit Flock' : 'Add New Flock'}
                        open={isModalVisible}
                        onCancel={() => { setIsModalVisible(false); setEditingId(null); form.resetFields(); }}
                        footer={null}
                    >
                        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
                            <Form.Item name="name" label="Flock ID" rules={[{ required: true }]}>
                                <Input placeholder="e.g. 1" />
                            </Form.Item>
                            <Form.Item name="breed" label="Breed" rules={[{ required: true }]}>
                                <Input placeholder="e.g. white" />
                            </Form.Item>
                            <Form.Item name="numberOfHens" label="Quantity" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                            <Form.Item name="acquisitionDate" label="Acquisition Date" rules={[{ required: true }]}>
                                <Input type="date" />
                            </Form.Item>
                            <Form.Item name="healthStatus" label="Status" initialValue="Active">
                                <Select>
                                    <Option value="Active">Active</Option>
                                    <Option value="Healthy">Healthy</Option>
                                    <Option value="Sick">Sick</Option>
                                    <Option value="Inactive">Inactive</Option>
                                </Select>
                            </Form.Item>
                            <Button type="primary" htmlType="submit" block>Save Flock</Button>
                        </Form>
                    </Modal>
                </Card>
            </div>
        </MainLayout>
    );
};

export default Flock;
