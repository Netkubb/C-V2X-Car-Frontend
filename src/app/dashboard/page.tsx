'use client';
import React, { useState, useEffect } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { io } from 'socket.io-client';
import { FaBell } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { MdOutlineExitToApp } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import './dashboardPage.css';

export default function Home() {
	const [date, setDate] = useState('');
	const [time, setTime] = useState('');
	const [isButtonVisible, setIsButtonVisible] = useState(true);
	const [isPopupVisible, setIsPopupVisible] = useState(false);
	const [isObjectDetectionOn, setIsObjectDetectionOn] = useState(false);
	const router = useRouter();

	// car info
	const [speed, setSpeed] = useState(0.0);
	const [latitude, setLatitude] = useState(0.0);
	const [longitude, setLongitude] = useState(0.0);

	// rsu info
	const [recSpeed, setRecSpeed] = useState(0.0);
	const [rsuLatitude, setRsuLatitude] = useState(0.0);
	const [rsuLongitude, setRsuLongitude] = useState(0.0);

	const updateDateTime = () => {
		const currentDateTime = new Date();
		const day = currentDateTime.getDate().toString().padStart(2, '0');
		const month = currentDateTime.toLocaleString('en-US', { month: 'long' });
		const year = currentDateTime.getFullYear();

		setDate(`${day} ${month} ${year}`);
		setTime(
			currentDateTime.toLocaleString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false,
			})
		);
	};

	useEffect(() => {
		updateDateTime();
		const intervalId = setInterval(updateDateTime, 1000);

		const socket = io(`http://localhost:8002`);
		socket.on('connect', () => {
			console.log('connect to backend');
		});
		socket.on('disconnect', () => {
			console.log('Disconnected from backend');
		});
		socket.on('car info', (message) => {
			console.log(message);
			setSpeed(message['velocity']);
			setLatitude(message['latitude']);
			setLongitude(message['longitude']);
		});
		socket.on('rsu info', (message) => {
			console.log(message);
			setRecSpeed(message['recommend_speed']);
			setRsuLatitude(message['latitude']);
			setRsuLongitude(message['longitude']);
		});

		return () => clearInterval(intervalId);
	}, []);

	const handleEmergency = () => {
		setIsButtonVisible(!isButtonVisible);
	};

	const handleConfirmEmergency = () => {
		setIsButtonVisible(!isButtonVisible);
		console.log('An emergency has been sent.');
		setIsPopupVisible(true);

		setTimeout(() => {
			setIsPopupVisible(false);
		}, 3000);
	};

	const handleCancleEmergency = () => {
		setIsButtonVisible(!isButtonVisible);
		console.log('An emergency has been cancle.');
	};

	const handleObjectDetection = () => {
		setIsObjectDetectionOn(!isObjectDetectionOn);
		console.log('Toggle Object Detection.');
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		console.log('Already Logout.');
		router.push('/login');
	};

	return (
		<div>
			<div className="home-background" />
			<div className="home-container">
				<div className="left-container"></div>
				<div className="right-container">
					<div className="video-container">
						<div>Video Streaming</div>
					</div>
					<div className="detail-container">
						<div className="speed-container">
							<div className="current-speed-container">
								<div className="speed-text">Current Speed</div>
								<div className="speed-speed">{speed.toFixed(1)}</div>
							</div>
							<div className="recommend-speed-container">
								<div className="speed-text">Recommend Speed</div>
								<div className="speed-speed">{recSpeed.toFixed(1)}</div>
							</div>
						</div>
						<div className="another-detail-container">
							<div className="date-container">
								<div className="date">{date}</div>
								<div className="time">{time}</div>
							</div>
							<div>
								{isButtonVisible && (
									<button className="emergency-button" onClick={handleEmergency}>
										Emergency
									</button>
								)}
								{!isButtonVisible && (
									<div className="confirm-emergency-container">
										<button className="confirm-emergency-button" onClick={handleConfirmEmergency}>
											<FaBell style={{ width: 64, height: 45, color: 'white' }} />
										</button>
										<button className="cancle-emergency-button" onClick={handleCancleEmergency}>
											<FaXmark style={{ width: 65, height: 65, color: 'white' }} />
										</button>
									</div>
								)}
								{isPopupVisible && (
									<div className="popup">
										<p>An emergency has been sent!</p>
									</div>
								)}
							</div>
							<div className="button-container">
								<div>
									{isObjectDetectionOn && (
										<button className="od-button" onClick={handleObjectDetection}>
											<img src="/objDetectOn.png" alt="objDetectOn Icon" width="50" height="50" />
										</button>
									)}
									{!isObjectDetectionOn && (
										<button className="od-button" onClick={handleObjectDetection}>
											<img src="/objDetectOff.png" alt="objDetectOff Icon" width="50" height="50" />
										</button>
									)}
								</div>
								<button className="logout-button" onClick={handleLogout}>
									<MdOutlineExitToApp style={{ width: 60, height: 60, color: 'white' }} />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
