'use client';
import React, { useState } from 'react';
import { IoMdCar } from "react-icons/io";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import './loginPage.css'

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const handleLogin = async() => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          username: username,
          password: password
        });
    
        const data = response.data.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('car_id', data.car_id);
        console.log('Login Success');
        router.push('/dashboard');
      } catch (error) {
        setIsError(true);
        console.log('Login Failed');
      }
  };

  return (
    <div>
        <div className='background'/>
            <div className='login-card'>
                <div className='card-container'>
                    <div className='welcome-container'>
                        <div className='welcome-text'>Welcome to</div>
                        <div className='v2x-text'><IoMdCar style={{ width: 50, height: 50, verticalAlign: 'bottom' }}/>5G-V2X</div>
                    </div>
                    <div className='login-container'>
                        <div className='signin-text'>Sign in</div>
                        <div style={{ marginTop: 81}}>
                            <div className='label-text'>Username</div>
                            <input
                                className={isError ? 'input-field-error' : 'input-field'}
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div style={{ marginTop: 48}}>
                            <div className='label-text'>Password</div>
                            <input
                                className={isError ? 'input-field-error' : 'input-field'}
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div style={{ height: 18, marginTop: 11}}>
                            {isError && (
                                <div className="error-message" id="error-message">Incorrect Username or Password !!</div>
							)}
                        </div>
                        <div style={{ marginTop: 46.5}}>
                            <button className='login-button' onClick={handleLogin}>Login</button>
                        </div>
                    </div>
            </div>
        </div>
    </div>
    );
}