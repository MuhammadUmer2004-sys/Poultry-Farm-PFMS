import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, notification, Popconfirm, Card, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import './flock.css';
import { api, BASE_URL } from '../../services/api';

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
            setData(response.data);
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to fetch flocks' });
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
            if (editingId) {
                await api.put(`/flock/${editingId}`, values);
                notification.success({ message: 'Success', description: 'Flock updated' });
            } else {
                await api.post('/flock', values);
                notification.success({ message: 'Success', description: 'Flock added' });
            }
            setIsModalVisible(false);
            setEditingId(null);
            form.resetFields();
            fetchFlocks();
        } catch (err) {
            notification.error({ message: 'Error', description: 'Operation failed' });
        }
    };

    const handleEdit = (record: any) => {
        setEditingId(record._id);
        form.setFieldsValue(record);
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
            dataIndex: 'flockId',
            key: 'flockId',
            sorter: (a: any, b: any) => a.flockId.localeCompare(b.flockId)
        },
        {
            title: 'Breed',
            dataIndex: 'breed',
            key: 'breed',
            sorter: (a: any, b: any) => a.breed.localeCompare(b.breed)
        },
        { title: 'Quantity', dataIndex: 'initialQuantity', key: 'initialQuantity' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>
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
        <div className="flock-container">
            <Card title="🐣 Flock Management" extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
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
                        <Form.Item name="flockId" label="Flock ID" rules={[{ required: true }]}>
                            <Input placeholder="e.g. FLK-001" />
                        </Form.Item>
                        <Form.Item name="breed" label="Breed" rules={[{ required: true }]}>
                            <Input placeholder="e.g. White Leghorn" />
                        </Form.Item>
                        <Form.Item name="initialQuantity" label="Quantity" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={1} />
                        </Form.Item>
                        <Form.Item name="acquisitionDate" label="Acquisition Date" rules={[{ required: true }]}>
                            <Input type="date" />
                        </Form.Item>
                        <Form.Item name="status" label="Status" initialValue="Active">
                            <Select>
                                <Option value="Active">Active</Option>
                                <Option value="Sold">Sold</Option>
                                <Option value="Dead">Inactive</Option>
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block>Save Flock</Button>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default Flock;
