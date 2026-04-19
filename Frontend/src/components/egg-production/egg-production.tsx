import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, notification, Popconfirm, Card, Row, Col, Space } from 'antd';
import { EditOutlined, DeleteOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import './egg-production.css';
import moment from 'moment';
import { api, BASE_URL } from '../../services/api';

const EggProduction = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<string | null>(null);

    // Fetch data
    const fetchEggProduction = async () => {
        setLoading(true);
        try {
            const response = await api.get('/egg-production');
            setData(response.data);
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to fetch egg production data' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEggProduction();
    }, []);

    // Add or Update handler
    const handleAddOrUpdate = async (values: any) => {
        try {
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
            };

            if (editingId) {
                await api.put(`/egg-production/${editingId}`, payload);
                notification.success({ message: 'Success', description: 'Egg production record updated' });
            } else {
                await api.post('/egg-production', payload);
                notification.success({ message: 'Success', description: 'Egg production record added' });
            }

            setIsModalVisible(false);
            form.resetFields();
            setEditingId(null);
            fetchEggProduction();
        } catch (err) {
            notification.error({ message: 'Error', description: 'Operation failed' });
        }
    };

    const handleFormSubmit = async (values: any) => {
        try {
            // ❌ REMOVE the redundant fetch check here and use `api` if preferred, 
            // but for now let's just use the BASE_URL logic consistently as requested.
            
            const dateStr = values.date ? values.date.format('YYYY-MM-DD') : null;
            if (!dateStr) {
                notification.error({ message: 'Date Missing', description: 'Please select a date' });
                return;
            }

            const payload = {
                ...values,
                date: dateStr
            };

            const response = await fetch(`${BASE_URL}/egg-production`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                notification.success({ message: 'Success', description: 'Record added successfully' });
                setIsModalVisible(false);
                form.resetFields();
                fetchEggProduction();
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to save record' });
        }
    };

    // Edit handler
    const handleEdit = (record: any) => {
        setEditingId(record._id);
        form.setFieldsValue({
            ...record,
            date: moment(record.date),
        });
        setIsModalVisible(true);
    };

    // Delete handler
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${BASE_URL}/egg-production/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                notification.success({ message: 'Deleted', description: 'Record removed' });
                fetchEggProduction();
            }
        } catch (err) {
            notification.error({ message: 'Error', description: 'Failed to delete record' });
        }
    };

    // Export handler
    const handleExport = async () => {
        try {
            const response = await fetch(`${BASE_URL}/egg-production/export`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `egg_production_${moment().format('YYYY-MM-DD')}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            notification.error({ message: 'Export Failed', description: 'Could not export data' });
        }
    };

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date', render: (text: string) => text ? moment(text).format('DD/MM/YYYY') : 'N/A' },
        { title: 'Flock Name', dataIndex: 'flockName', key: 'flockName' },
        { title: 'Total Eggs', dataIndex: 'totalEggs', key: 'totalEggs' },
        { title: 'Crack Eggs', dataIndex: 'crackEggs', key: 'crackEggs', render: (val: number) => val ?? 0 },
        { title: 'Good Eggs', dataIndex: 'goodEggs', key: 'goodEggs', render: (val: number) => val ?? 0 },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record._id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="egg-production-container">
                <Card title="🥚 Egg Production Tracking" extra={
                    <Space>
                        <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Record</Button>
                    </Space>
                }>
                    <Row gutter={16} className="stats-row">
                        <Col span={8}>
                            <Card small-card="true">
                                <h3>Total Produced (Today)</h3>
                                <p className="stat-val">{data && data.length > 0 ? data[0].totalEggs : 0}</p>
                            </Card>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 7 }}
                    />

                    <Modal
                        title={editingId ? 'Edit Record' : 'Add Production Record'}
                        open={isModalVisible}
                        onCancel={() => { setIsModalVisible(false); setEditingId(null); form.resetFields(); }}
                        footer={null}
                    >
                        <Form form={form} layout="vertical" onFinish={editingId ? handleAddOrUpdate : handleFormSubmit}>
                            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="flockName" label="Flock Name" rules={[{ required: true }]}>
                                <Input placeholder="Enter Flock ID or Name" />
                            </Form.Item>
                            <Form.Item name="totalEggs" label="Total Eggs" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="crackEggs" label="Cracked Eggs" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="goodEggs" label="Good Eggs" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" block>Save Record</Button>
                        </Form>
                    </Modal>
                </Card>
            </div>
        </MainLayout>
    );
};

export default EggProduction;