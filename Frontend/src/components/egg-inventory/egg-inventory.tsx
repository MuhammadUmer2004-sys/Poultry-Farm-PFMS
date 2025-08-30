import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import {
    Button,
    Table,
    Modal,
    Form,
    Input,
    InputNumber,
    notification,
    Card,
    Statistic,
    DatePicker
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './egg-inventory.css';
import moment from 'moment';

interface EggInventoryRecord {
    _id: string;
    soldEggs: Array<{
        buyer: {
            name: string;
            contact: string;
        };
        quantity: number;
        saleDate: string;
    }>;
    remainingEggs: number;
    updatedAt: string;
}

const EggInventory = () => {
    const [data, setData] = useState<EggInventoryRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/egg-inventory', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to fetch inventory data'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values: any) => {
        const eggInventoryData = {
            buyer: values.buyer,
            quantity: values.quantity,
            saleDate: values.saleDate ? values.saleDate.toISOString() : new Date().toISOString()
        };

        try {
            const response = await fetch('http://localhost:5000/api/egg-inventory/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(eggInventoryData)
            });

            const result = await response.json();

            if (result.success) {
                notification.success({
                    message: 'Success',
                    description: result.message || 'Inventory updated successfully'
                });
                setIsModalVisible(false);
                form.resetFields();
                fetchInventory();
            } else {
                notification.error({
                    message: 'Error',
                    description: result.message || 'Failed to update inventory'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to update inventory'
            });
        }
    };

    const columns = [
        {
            title: 'Remaining Eggs',
            dataIndex: 'remainingEggs',
            key: 'remainingEggs',
            sorter: (a: EggInventoryRecord, b: EggInventoryRecord) => a.remainingEggs - b.remainingEggs
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm'),
            sorter: (a: EggInventoryRecord, b: EggInventoryRecord) =>
                moment(a.updatedAt).unix() - moment(b.updatedAt).unix()
        }
    ];

    return (
        <MainLayout>
            <div className="inventory-title-primary">
                <h1 className="inventory-title">Egg Inventory</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                >
                    Add Sale Record
                </Button>
            </div>

            <div className="statistics-cards">
                <Card>
                    <Statistic
                        title="Available Eggs"
                        value={data.length > 0 ? data[0].remainingEggs : 0} // ✅ Show only latest remainingEggs
                    />
                </Card>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
            />

            <Modal
                title="Add Sale Record"
                open={isModalVisible}
                onOk={() => form.validateFields().then(handleSave).catch(() => {})}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name={['buyer', 'name']}
                        label="Buyer Name"
                        rules={[{ required: true, message: 'Please enter buyer name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name={['buyer', 'contact']}
                        label="Buyer Contact"
                        rules={[{ required: true, message: 'Please enter contact' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="quantity"
                        label="Quantity Sold"
                        rules={[{ required: true, message: 'Please enter quantity sold' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="saleDate"
                        label="Sale Date (optional)"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default EggInventory;
