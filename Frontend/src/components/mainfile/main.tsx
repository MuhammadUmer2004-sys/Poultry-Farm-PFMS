import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Alert, Space, notification } from 'antd';
import {
  FundOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  SmileOutlined, BellOutlined, DatabaseOutlined, InboxOutlined,
  TeamOutlined, DollarOutlined, MedicineBoxOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './main.css';
import logo from '../../assets/logo.png';
import image1 from '../../assets/avatar.png';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [displayName, setDisplayName] = useState('Guest');
  const [notifications, setNotifications] = useState([]);
  const [shownMessages, setShownMessages] = useState<string[]>([]);
  const [api, contextHolder] = notification.useNotification();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const name = localStorage.getItem('displayName');
    setDisplayName(name || 'Guest');
  }, [location.pathname]);

  // ✅ Fetch notifications on load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();

        const unique = Array.from(new Map(data.map(n => [n._id, n])).values());
        setNotifications(unique);

        // ✅ Auto popup alerts for new unread (no duplicates)
        unique.slice(0, 3).forEach(notif => {
          if (!shownMessages.includes(notif._id)) {
            api.open({
              message: notif.title,
              description: (
                <div>
                  {notif.message}
                  <Button
                    size="small"
                    type="link"
                    onClick={() => handleMarkAsRead(notif._id)}
                    style={{ paddingLeft: 10 }}
                  >
                    Mark as done
                  </Button>
                </div>
              ),
              icon: <SmileOutlined style={{ color: 'lightblue' }} />,
              placement: 'topRight',
              duration: 5
            });

            setShownMessages(prev => [...prev, notif._id]);
          }
        });
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
  }, []);

const handleMarkAsRead = async (id: string) => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });

    setNotifications(prev => prev.filter(n => n._id !== id));
  } catch (err) {
    console.error('Failed to mark notification as read');
  }
};

const openNotification = () => {
  if (!notifications.length) {
    api.info({
      message: 'No Notifications',
      description: 'You are all caught up!',
      placement: 'topRight'
    });
    return;
  }

  notifications.slice(0, 3).forEach(notif => {
    api.open({
      message: notif.title,
      description: (
        <div>
          {notif.message}
          <Button
            size="small"
            type="link"
            onClick={() => handleMarkAsRead(notif._id)}
            style={{ paddingLeft: 10 }}
          >
            Mark as Done
          </Button>
        </div>
      ),
      icon: <SmileOutlined style={{ color: 'lightblue' }} />,
      placement: 'topRight',
      duration: 6
    });
  });
};


  const toggleCollapsed = () => setCollapsed(!collapsed);

  const handleLogoutClick = () => setShowAlert(true);
  const handleAccept = () => {
    localStorage.clear();
    setShowAlert(false);
    navigate('/login');
  };
  const handleDecline = () => setShowAlert(false);

  const items = [
    {
      key: 'adminDashboard',
      icon: <FundOutlined />,
      label: <Link to="/admin/dashboard">Admin Dashboard</Link>,
    },
    {
      key: 'dashboard',
      icon: <FundOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '1',
      icon: <DatabaseOutlined />,
      label: <Link to="/egg-production">Egg Production</Link>,
    },
    {
      key: '2',
      icon: <InboxOutlined />,
      label: <Link to="/egg-inventory">Egg Inventory</Link>,
    },
    {
      key: '3',
      icon: <DatabaseOutlined />,
      label: <Link to="/feed">Feed</Link>,
    },
    {
      key: '4',
      icon: <TeamOutlined />,
      label: <Link to="/flock">Flock</Link>,
    },
    {
      key: '5',
      icon: <DollarOutlined />,
      label: <Link to="/revenue">Revenue</Link>,
    },
    {
      key: '6',
      icon: <DatabaseOutlined />,
      label: <Link to="/mortality">Mortality</Link>,
    },
    {
      key: '7',
      icon: <MedicineBoxOutlined />,
      label: <Link to="/vaccination">Vaccination</Link>,
    },
    {
      key: 'expenses',
      icon: <DollarOutlined />,
      label: 'Expenses',
      onClick: () => navigate('/expenses')
    },
    {
      key: '8',
      icon: <LogoutOutlined />,
      label: <p onClick={handleLogoutClick}>Logout</p>
    }
  ];

  return (
    <Layout className="layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <img className="sider-logo" src={logo} alt="Logo" />
        <Menu
          className="menu-layout"
          theme="light"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={items}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            className="toggle-button"
          />
          <div className='notification-profile'>
            {contextHolder}
            <Button type="text" icon={<BellOutlined />} onClick={openNotification} />
            <div className="profile-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 500 }}>{displayName}</span>
              <Button type="text" icon={<img className='profile-image' src={image1} />} />
            </div>
          </div>
        </Header>
        <Content className="content">
          {showAlert && (
            <Alert className='alert-for-logout'
              message="Logout Confirmation"
              description="Are you sure you want to log out?"
              type="info"
              action={
                <Space direction="vertical">
                  <Button size="small" type="primary" onClick={handleAccept}>
                    Accept
                  </Button>
                  <Button size="small" danger ghost onClick={handleDecline}>
                    Decline
                  </Button>
                </Space>
              }
              closable
              onClose={handleDecline}
            />
          )}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
