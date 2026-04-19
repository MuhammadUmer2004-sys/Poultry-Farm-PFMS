import { useState, useEffect } from 'react';
import MainLayout from '../mainfile/main';
import { Row, Col, Card, Statistic, Alert, Table, notification } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WarningOutlined } from '@ant-design/icons';
import axios from '../../utils/axiosInstance';
import { Line } from '@ant-design/charts';

import './dashboard.css';

interface DashboardData {
  totalEggsProduced: number;
  totalMortality: number;
  totalFeedUsed: number;
  totalEggsInInventory: number;
  totalProfits: number;
  revenueTrends: any[];
  expenseTrends: any[];
  revenueBreakdown: any[];
  expenseBreakdown: any[];
  alerts: {
    lowFeed: boolean;
    highMortality: boolean;
  };
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/user-dashboard');
      setData(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch dashboard data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading Dashboard...</div>;
  if (!data || (data as any).error) return <div style={{ padding: 20 }}><Alert type="error" message="Error loading dashboard" description={(data as any)?.error || "No data available"} /></div>;

  const trendConfig = {
    data: [...(data.revenueTrends || []), ...(data.expenseTrends || [])].map(item => ({
      month: item._id ? `${item._id.year}-${item._id.month}` : 'Unknown',
      amount: item.total || 0,
      type: (data.revenueTrends || []).some(r =>
        r._id && item._id && r._id.year === item._id.year && r._id.month === item._id.month && r.total === item.total
      )
        ? 'Revenue'
        : 'Expense'
    })),
    xField: 'month',
    yField: 'amount',
    seriesField: 'type',
    smooth: true,
  };

  const alerts = data.alerts || { lowFeed: false, highMortality: false };

  return (
    <MainLayout>
      <div className="dashboard-container">
        <h1>Dashboard</h1>

        {(alerts.lowFeed || alerts.highMortality) && (
          <div className="alerts-section">
            {alerts.lowFeed && (
              <Alert
                message="Low Feed Alert"
                description="Feed stock is running low. Please restock soon."
                type="warning"
                showIcon
                icon={<WarningOutlined />}
              />
            )}
            {alerts.highMortality && (
              <Alert
                message="High Mortality Alert"
                description="Unusually high mortality rate detected."
                type="warning"
                showIcon
                icon={<WarningOutlined />}
              />
            )}
          </div>
        )}

        <div className="statistics-cards">
          <Card>
            <Statistic title="Total Eggs Produced" value={data.totalEggsProduced || 0} suffix="eggs" />
          </Card>
          <Card>
            <Statistic title="Eggs in Inventory" value={data.totalEggsInInventory || 0} suffix="eggs" />
          </Card>
          <Card>
            <Statistic title="Total Feed Used" value={data.totalFeedUsed || 0} suffix="kg" />
          </Card>
          <Card>
            <Statistic title="Mortality Rate" value={data.totalMortality || 0} suffix="birds" />
          </Card>
          <Card>
            <Statistic
              title="Total Profits"
              value={data.totalProfits || 0}
              valueStyle={{ color: (data.totalProfits || 0) >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={(data.totalProfits || 0) >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </div>

        <Card title="Revenue vs Expense Trends" className="chart-card">
          <Line {...trendConfig} />
        </Card>

        <Row gutter={16} className="breakdown-section">
          <Col span={12}>
            <Card title="Revenue Breakdown">
              <Table
                dataSource={Array.isArray(data.revenueBreakdown) ? data.revenueBreakdown : []}
                rowKey={(record) => record._id || Math.random()}
                columns={[
                  { title: 'Source', dataIndex: '_id', key: 'source' },
                  {
                    title: 'Amount',
                    dataIndex: 'total',
                    key: 'amount',
                    render: (value: number) => `$${(value || 0).toFixed(2)}`
                  }
                ]}
                pagination={false}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Expense Breakdown">
              <Table
                dataSource={Array.isArray(data.expenseBreakdown) ? data.expenseBreakdown : []}
                rowKey={(record) => record._id || Math.random()}
                columns={[
                  { title: 'Type', dataIndex: '_id', key: 'type' },
                  {
                    title: 'Amount',
                    dataIndex: 'total',
                    key: 'amount',
                    render: (value: number) => `$${(value || 0).toFixed(2)}`
                  }
                ]}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
