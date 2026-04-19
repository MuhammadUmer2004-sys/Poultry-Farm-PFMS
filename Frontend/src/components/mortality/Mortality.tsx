import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, notification, Popconfirm, Card, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './mortality.css';
import { BASE_URL } from '../../services/api';

const { Title } = Typography;

const Mortality = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Fetch mortality records
    const fetchMortality = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/mortality`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const result = await response.json();
            setData(result);
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to fetch mortality data' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMortality();
    }, []);

    // Add mortality record
    const handleAdd = async (values: any) => {
        try {
            const response = await fetch(`${BASE_URL}/mortality`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                notification.success({ message: 'Success', description: 'Mortality record added' });
                setIsModalVisible(false);
                form.resetFields();
                fetchMortality();
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to add record' });
        }
    };

    // Delete record
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${BASE_URL}/mortality/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                notification.success({ message: 'Deleted', description: 'Record removed successfully' });
                fetchMortality();
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to delete record' });
        }
    };

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date', render: (text: string) => new Date(text).toLocaleDateString() },
        { title: 'Flock ID', dataIndex: 'flockId', key: 'flockId' },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Cause', dataIndex: 'cause', key: 'cause' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDelete(record._id)}>
                    <Button type="link" danger>Delete</Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="mortality-container">
            <Card title={<Title level={4}>☠️ Mortality Records</Title>} extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Record Death
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
                    title="Add Mortality Record"
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Form form={form} layout="vertical" onFinish={handleAdd}>
                        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                            <Input type="date" />
                        </Form.Item>
                        <Form.Item name="flockId" label="Flock ID" rules={[{ required: true }]}>
                            <Input placeholder="Enter Flock ID" />
                        </Form.Item>
                        <Form.Item name="quantity" label="Number of Birds" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={1} />
                        </Form.Item>
                        <Form.Item name="cause" label="Cause of Death" rules={[{ required: true }]}>
                            <Input placeholder="e.g. Heat stress, Disease" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block>Submit Record</Button>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default Mortality;
