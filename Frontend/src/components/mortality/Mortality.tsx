import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Button, Table, Modal, Form, Input, InputNumber, notification, Select, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

interface MortalityRecord {
  _id: string;
  flock: string;
  date: string;
  numberOfDeaths: number;
  cause: string;
  createdAt: string;
}

interface FlockOption {
  _id: string;
  name: string;
}

const Mortality = () => {
  const [data, setData] = useState<MortalityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFlock, setSelectedFlock] = useState<string | null>(null);
  const [flocks, setFlocks] = useState<FlockOption[]>([]);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch all flocks
  const fetchFlocks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/flock', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      setFlocks(result?.data || result); // handles both array or { data: array }
      if ((result?.data || result).length > 0) {
        setSelectedFlock((result?.data || result)[0]._id);
      }
    } catch {
      notification.error({ message: 'Error', description: 'Failed to fetch flocks' });
    }
  };

  // ✅ Fetch mortality for a selected flock
  const fetchMortalityData = async () => {
    if (!selectedFlock) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/mortality/${selectedFlock}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      setData(result.data || []);
    } catch {
      notification.error({ message: 'Error', description: 'Failed to fetch mortality data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlocks();
  }, []);

  useEffect(() => {
    if (selectedFlock) fetchMortalityData();
  }, [selectedFlock]);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ date: moment() });
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    if (!selectedFlock) return;
    setSubmitting(true);
    try {
      if (values.date.isAfter(moment())) throw new Error('Date cannot be in the future');

      const payload = {
        flockId: selectedFlock,
        date: values.date.format('YYYY-MM-DD'),
        numberOfDeaths: values.numberOfDeaths,
        cause: values.cause
      };

      await fetch('http://localhost:5000/api/mortality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      notification.success({ message: 'Success', description: 'Mortality record saved' });
      setIsModalVisible(false);
      fetchMortalityData();
    } catch (err: any) {
      notification.error({ message: 'Error', description: err.message || 'Failed to save record' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
      sorter: (a: MortalityRecord, b: MortalityRecord) =>
        moment(a.date).unix() - moment(b.date).unix()
    },
    {
      title: 'Number of Deaths',
      dataIndex: 'numberOfDeaths',
      key: 'numberOfDeaths',
      sorter: (a: MortalityRecord, b: MortalityRecord) => a.numberOfDeaths - b.numberOfDeaths
    },
    {
      title: 'Cause',
      dataIndex: 'cause',
      key: 'cause'
    }
  ];

  return (
    <MainLayout>
      <div className="mortality-container">
        <div className="mortality-header">
          <h1>Mortality Tracking</h1>
          <div className="mortality-controls">
            <Select
              className="flock-selector"
              value={selectedFlock}
              onChange={setSelectedFlock}
              placeholder="Select Flock"
            >
              {flocks.map(flock => (
                <Select.Option key={flock._id} value={flock._id}>
                  {flock.name}
                </Select.Option>
              ))}
            </Select>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={!selectedFlock}
            >
              Add Record
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="Add Mortality Record"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          confirmLoading={submitting}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={current => current && current > moment().endOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="numberOfDeaths"
              label="Number of Deaths"
              rules={[{ required: true, message: 'Please input number of deaths!' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="cause" label="Cause">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Mortality;
