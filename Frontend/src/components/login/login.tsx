import { MailOutlined } from '@ant-design/icons';
import { Input, Button, Checkbox, message } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import img from '../../assets/logo.png';
import img2 from '../../assets/Illustration.png';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('/auth/login', formData);

      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('email', user.email);
        localStorage.setItem('user', JSON.stringify(user));

        // ✅ Set display name by role
        if (user.role === 'admin') {
          localStorage.setItem('displayName', 'Admin');
          message.success('Welcome Admin');
          navigate('/admin/dashboard');
        } else {
          localStorage.setItem('displayName', 'User');
          message.success('Login successful');
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      message.error(errorMsg);
    }
  };

  return (
    <>
      <div className="navbar-logo-and-name">
        <img className="logo" src={img} alt="Logo" />
        <h1>Poultry Farm Management System</h1>
      </div>

      <div className="login-and-image">
        <div className="login-page">
          <h1 className="welcome-message1">Welcome Back!</h1>
          <p className="welcome-message2">Sign in to continue to PFMS</p>

          <div className="email-password">
            <div>
              <p>Email</p>
              <Input
                className="input-box"
                name="email"
                value={formData.email}
                onChange={changeHandler}
                placeholder="test@gmail.com"
                suffix={<MailOutlined />}
              />
            </div>
            <div>
              <p>Password</p>
              <Input.Password
                className="input-box"
                name="password"
                value={formData.password}
                onChange={changeHandler}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="remember-forget">
            <Checkbox>Remember me</Checkbox>
            <Link className="links" to="/forgetPassword">Forget password</Link>
          </div>

          <Button className="login-button" onClick={handleLogin}>Login</Button>

          <div className="signup-acc">
            <p className="dont-have-acc">Don't have an account?</p>
            <Link className="links" to="/signup">Sign up</Link>
          </div>
        </div>

        <div>
          <img src={img2} alt="Illustration" />
        </div>
      </div>
    </>
  );
};

export default Login;