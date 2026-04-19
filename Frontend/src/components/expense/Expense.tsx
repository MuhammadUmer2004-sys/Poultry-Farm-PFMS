import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, notification, Popconfirm, Card, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MainLayout from '../mainfile/main';
import './expense.css';
import { BASE_URL } from '../../services/api';
import moment from 'moment';

const { Title } = Typography;

const Expense = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<string | null>(null);

    // Fetch expenses
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/expenses`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const result = await response.json();
            setData(result.data || []);
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to fetch expenses' });
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    // Handlers
    const handleAddOrUpdate = async (values: any) => {
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `${BASE_URL}/expenses/${editingId}` : `${BASE_URL}/expenses`;

            // Map frontend values to backend schema
            const payload = {
                type: values.type,
                amount: values.amount,
                date: values.date,
                description: values.description
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
                notification.success({ message: 'Success', description: editingId ? 'Expense updated' : 'Expense added' });
                setIsModalVisible(false);
                setEditingId(null);
                form.resetFields();
                fetchExpenses();
            } else {
                const errData = await response.json();
                notification.error({ message: 'Error', description: errData.error || 'Operation failed' });
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Connection failed' });
        }
    };

    const handleEdit = (record: any) => {
        setEditingId(record._id);
        form.setFieldsValue({
            ...record,
            date: record.date ? record.date.split('T')[0] : ''
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${BASE_URL}/expenses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                notification.success({ message: 'Deleted', description: 'Expense record removed' });
                fetchExpenses();
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to delete expense' });
        }
    };

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date', render: (text: string) => text ? moment(text).format('YYYY-MM-DD') : 'N/A' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        { title: 'Category', dataIndex: 'type', key: 'type' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amount: number) => `$${(amount || 0).toFixed(2)}` },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Delete this expense?" onConfirm={() => handleDelete(record._id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="expense-container">
                <Card title={<Title level={4}>💰 Expense tracking</Title>} extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                        New Expense
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
                        title={editingId ? 'Edit Expense' : 'Add New Expense'}
                        open={isModalVisible}
                        onCancel={() => { setIsModalVisible(false); setEditingId(null); form.resetFields(); }}
                        footer={null}
                    >
                        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
                            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                                <Input type="date" />
                            </Form.Item>
                            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Electricity bill" />
                            </Form.Item>
                            <Form.Item name="type" label="Category" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Utility, Medical" />
                            </Form.Item>
                            <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={0.01} />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" block>Save Expense</Button>
                        </Form>
                    </Modal>
                </Card>
            </div>
        </MainLayout>
    );
};

export default Expense;