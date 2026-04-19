import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, notification, Popconfirm, Card, Typography, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import MainLayout from '../mainfile/main';
import './mortality.css';
import { BASE_URL } from '../../services/api';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const Mortality = () => {
    const [data, setData] = useState<any[]>([]);
    const [flocks, setFlocks] = useState<any[]>([]);
    const [selectedFlock, setSelectedFlock] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchFlocks = async () => {
        try {
            const response = await fetch(`${BASE_URL}/flock`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });
            const result = await response.json();
            const flockData = result.data || [];
            setFlocks(flockData);
            if (flockData.length > 0 && !selectedFlock) {
                setSelectedFlock(flockData[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch flocks');
        }
    };

    const fetchMortality = async () => {
        if (!selectedFlock) return;
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/mortality/${selectedFlock}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });
            const result = await response.json();
            setData(result.data || []);
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to fetch mortality data' });
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlocks();
    }, []);

    useEffect(() => {
        if (selectedFlock) {
            fetchMortality();
        }
    }, [selectedFlock]);

    const handleAdd = async (values: any) => {
        try {
            const payload = {
                flockId: values.flock,
                date: values.date,
                numberOfDeaths: values.numberOfDeaths,
                cause: values.cause
            };

            const response = await fetch(`${BASE_URL}/mortality`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                notification.success({ message: 'Success', description: 'Mortality record added' });
                setIsModalVisible(false);
                form.resetFields();
                fetchMortality();
            } else {
                const errData = await response.json();
                notification.error({ message: 'Error', description: errData.message || 'Failed to add record' });
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to connect to server' });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${BASE_URL}/mortality/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });

            if (response.ok) {
                notification.success({ message: 'Deleted', description: 'Record removed' });
                fetchMortality();
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to delete record' });
        }
    };

    const columns = [
        { 
            title: 'Date', 
            dataIndex: 'date', 
            key: 'date', 
            render: (text: string) => text ? moment(text).format('YYYY-MM-DD') : 'N/A' 
        },
        { title: 'Deaths', dataIndex: 'numberOfDeaths', key: 'numberOfDeaths' },
        { title: 'Cause', dataIndex: 'cause', key: 'cause' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Popconfirm title="Delete this record?" onConfirm={() => handleDelete(record._id)}>
                    <Button type="link" danger>Delete</Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="mortality-container">
                <Card 
                    title={<Title level={4}>☠️ Mortality Records</Title>} 
                    extra={
                        <Space>
                            <Select 
                                style={{ width: 200 }} 
                                placeholder="Select Flock" 
                                value={selectedFlock}
                                onChange={setSelectedFlock}
                            >
                                {flocks.map(f => (
                                    <Option key={f._id} value={f._id}>{f.name} ({f.breed})</Option>
                                ))}
                            </Select>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                                Record Death
                            </Button>
                        </Space>
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={Array.isArray(data) ? data : []}
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
                            <Form.Item name="flock" label="Select Flock" rules={[{ required: true }]}>
                                <Select placeholder="Choose a flock">
                                    {flocks.map(f => (
                                        <Option key={f._id} value={f._id}>{f.name} ({f.breed})</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="numberOfDeaths" label="Number of Birds" rules={[{ required: true }]}>
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
        </MainLayout>
    );
};

export default Mortality;
