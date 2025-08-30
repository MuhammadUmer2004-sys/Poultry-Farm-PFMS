// ✅ Vaccination.tsx (Full Updated with Future Date Support)

import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import {
  Button, Table, Modal, Form, Input, notification,
  Select, DatePicker
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import './vaccination.css';

interface VaccinationRecord {
  _id: string;
  flock: string;
  vaccineType: string;
  administrationDate: string;
  notes: string;
  createdAt: string;
}

interface FlockOption {
  _id: string;
  name: string;
}

const Vaccination = () => {
  const [data, setData] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFlock, setSelectedFlock] = useState<string | null>(null);
  const [flocks, setFlocks] = useState<FlockOption[]>([]);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchFlocks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/flock', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const result = await response.json();
      const flockList = result.data || result;
      setFlocks(flockList);
      if (flockList.length > 0) {
        setSelectedFlock(flockList[0]._id);
      }
    } catch {
      notification.error({ message: 'Error', description: 'Failed to fetch flocks' });
    }
  };

  const fetchVaccinationData = async () => {
    if (!selectedFlock) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/vaccinations/${selectedFlock}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const result = await response.json();
      setData(result.vaccinations || []);
    } catch {
      notification.error({ message: 'Error', description: 'Failed to fetch vaccination data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlocks();
  }, []);

  useEffect(() => {
    if (selectedFlock) fetchVaccinationData();
  }, [selectedFlock]);

  const columns = [
    {
      title: 'Administration Date',
      dataIndex: 'administrationDate',
      key: 'administrationDate',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
      sorter: (a: VaccinationRecord, b: VaccinationRecord) =>
        moment(a.administrationDate).unix() - moment(b.administrationDate).unix()
    },
    {
      title: 'Vaccine Type',
      dataIndex: 'vaccineType',
      key: 'vaccineType',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: VaccinationRecord) => (
        <div className="action-buttons">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
        </div>
      )
    }
  ];

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      administrationDate: moment()
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: VaccinationRecord) => {
    form.setFieldsValue({
      ...record,
      administrationDate: moment(record.administrationDate)
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/vaccinations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      notification.success({ message: 'Success', description: 'Vaccination record deleted' });
      fetchVaccinationData();
    } catch {
      notification.error({ message: 'Error', description: 'Failed to delete record' });
    }
  };

  const handleSave = async (values: any) => {
    if (!selectedFlock) return;
    setSubmitting(true);
    try {
      const payload = {
        flockId: selectedFlock,
        vaccineType: values.vaccineType.trim(),
        administrationDate: values.administrationDate.format('YYYY-MM-DD'),
        notes: values.notes?.trim()
      };

      await fetch('http://localhost:5000/api/vaccinations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      notification.success({ message: 'Success', description: 'Vaccination record added' });
      setIsModalVisible(false);
      form.resetFields();
      fetchVaccinationData();
    } catch (err: any) {
      notification.error({ message: 'Error', description: err.message || 'Failed to save record' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="vaccination-container">
        <div className="vaccination-header">
          <h1>Vaccination Records</h1>
          <div className="vaccination-controls">
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
              Add Vaccination
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
          title="Add Vaccination Record"
          open={isModalVisible}
          onCancel={() => {
            Modal.confirm({
              title: 'Cancel changes?',
              content: 'Any unsaved changes will be lost.',
              onOk: () => {
                form.resetFields();
                setIsModalVisible(false);
              }
            });
          }}
          onOk={() => form.submit()}
          confirmLoading={submitting}
          maskClosable={false}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item
              name="administrationDate"
              label="Administration Date"
              rules={[{ required: true, message: 'Please select a date!' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={() => false} // ✅ Allow all dates (future too)
              />
            </Form.Item>

            <Form.Item
              name="vaccineType"
              label="Vaccine Type"
              rules={[{ required: true, message: 'Please input vaccine type!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Vaccination;
