'use client';
import React, { useState } from 'react';
import { IoMdCar } from "react-icons/io";
import { useRouter } from 'next/navigation';
import './loginPage.css'

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    console.log('Login successful');
    router.push('/dashboard');
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
                                className='input-field'
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div style={{ marginTop: 48}}>
                            <div className='label-text'>Password</div>
                            <input
                                className='input-field'
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div style={{ marginTop: 75.5}}>
                            <button className='login-button' onClick={handleLogin}>Login</button>
                        </div>
                    </div>
            </div>
        </div>
    </div>
    );
}