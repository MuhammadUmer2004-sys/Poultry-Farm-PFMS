import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, notification, Popconfirm, Card, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import MainLayout from '../mainfile/main';
import './feed.css';
import { BASE_URL } from '../../services/api';
import moment from 'moment';


const Feed = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<string | null>(null);

    // Fetch feed records
    const fetchFeeds = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/feeds`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const result = await response.json();
            setData(result.data || []);
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to fetch feed data' });
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeds();
    }, []);

    // Add or Update handler
    const handleAddOrUpdate = async (values: any) => {
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `${BASE_URL}/feeds/${editingId}` : `${BASE_URL}/feeds`;

            // Map frontend values to backend schema
            const payload = {
                name: values.name,
                quantity: values.quantity,
                supplier: {
                    name: values.supplierName
                },
                orderDate: values.date || new Date()
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                notification.success({ message: 'Success', description: editingId ? 'Feed updated' : 'Feed added' });
                setIsModalVisible(false);
                setEditingId(null);
                form.resetFields();
                fetchFeeds();
            } else {
                const errData = await response.json();
                notification.error({ message: 'Error', description: errData.message || 'Action failed' });
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Connection failed' });
        }
    };

    const handleEdit = (record: any) => {
        setEditingId(record._id);
        form.setFieldsValue({
            name: record.name,
            quantity: record.quantity,
            supplierName: record.supplier?.name,
            date: record.orderDate ? record.orderDate.split('T')[0] : ''
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${BASE_URL}/feeds/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                notification.success({ message: 'Deleted', description: 'Feed record removed' });
                fetchFeeds();
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to delete' });
        }
    };

    const columns = [
        { title: 'Date', dataIndex: 'orderDate', key: 'date', render: (text: string) => text ? moment(text).format('YYYY-MM-DD') : 'N/A' },
        { title: 'Feed Name', dataIndex: 'name', key: 'name' },
        { title: 'Quantity (kg)', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Supplier', dataIndex: ['supplier', 'name'], key: 'supplier' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Delete this entry?" onConfirm={() => handleDelete(record._id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="feed-container">
                <Card title="🌾 Feed Inventory" extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                        Add Feed
                    </Button>
                }>
                    <Table
                        columns={columns}
                        dataSource={Array.isArray(data) ? data : []}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 8 }}
                    />

                    <Modal
                        title={editingId ? 'Edit Feed Entry' : 'Add Feed Entry'}
                        open={isModalVisible}
                        onCancel={() => { setIsModalVisible(false); setEditingId(null); form.resetFields(); }}
                        footer={null}
                    >
                        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
                            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                                <Input type="date" />
                            </Form.Item>
                            <Form.Item name="name" label="Feed Name" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Starter, Grower" />
                            </Form.Item>
                            <Form.Item name="quantity" label="Quantity (kg)" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                            <Form.Item name="supplierName" label="Supplier Name" rules={[{ required: true }]}>
                                <Input placeholder="Enter Supplier name" />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" block>Save Feed</Button>
                        </Form>
                    </Modal>
                </Card>
            </div>
        </MainLayout>
    );
};

export default Feed;
