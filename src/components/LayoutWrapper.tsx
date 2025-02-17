'use client';

import Script from 'next/script';
import {
	Dispatch,
	SetStateAction,
	createContext,
	useEffect,
	useState,
} from 'react';
import { io } from 'socket.io-client';
import Modal from './Modal';

export interface AuthData {
	token: string;
	role: string;
	car_id: string;
}
interface CarData {
	speed: number;
	unit: string;
	latitude: number;
	longitude: number;
	driveMode: string;
}
interface RSUData {
	rec_speed: number;
	unit: string;
	latitude: number;
	longitude: number;
	lane_changing: number;
}
interface ReportData {
	type: 'ACCIDENT' | 'CLOSED ROAD' | 'CONSTRUCTION' | 'TRAFFIC CONGESTION';
	rsu_id: string;
	latitude: number;
	longitude: number;
}

export const AuthContext = createContext<
	[AuthData, Dispatch<SetStateAction<AuthData>>]
>([{} as AuthData, () => {}]);
export const CarContext = createContext<CarData>({} as CarData);
export const RSUContext = createContext<RSUData>({} as RSUData);
export const ReportContext = createContext<ReportData[]>([]);

export default function LayoutWrapper(props: { children: React.ReactNode }) {
	const [auth, setAuth] = useState<AuthData>({
		token: '',
		role: '',
		car_id: '',
	});
	const [car, setCar] = useState<CarData>({
		speed: 0.0,
		unit: 'km/h',
		latitude: 0.0,
		longitude: 0.0,
		driveMode: 'manual',
	});
	const [rsu, setRSU] = useState<RSUData>({
		rec_speed: 0.0,
		unit: 'km/h',
		latitude: 0.0,
		longitude: 0.0,
		lane_changing: 1,
	});
	const [rsuId, setRsuId] = useState<string>('');
	const [reports, setReports] = useState<ReportData[]>([]);
	const [notiMessage, setNotiMessage] = useState<string>('');
	const [isPopupVisible, setIsPopupVisible] = useState(false);
	let timeoutId: NodeJS.Timeout;
	let isCount = false;

	useEffect(() => {
		const socket = io(`${process.env.NEXT_PUBLIC_OBU_SOCKET_WS_URL}`, {
			transports: ['websocket', 'polling'],
		});
		socket.on('connect', () => {
			console.log('Connect to OBU backend');
		});
		socket.on('car info', (message) => {
			if (message['id']?.toString() === auth.car_id.toString()) {
				setCar({
					speed: message['velocity'],
					unit: message['unit'],
					latitude: Number(message['latitude']),
					longitude: Number(message['longitude']),
					driveMode: message['mode'],
				});
			}
		});
		socket.on('rsu info', (message) => {
			console.log('rsu info', message);
			if (message['rsu_id']) {
				// console.log("Resetting the RSUID", message['rsu_id'])
				setRsuId(message['rsu_id']);
				// }else{
				// 	console.log("RSUID = " + rsuId);
			}
			setRSU({
				rec_speed: message['recommend_speed'],
				unit: message['unit'],
				latitude: Number(message['latitude']),
				longitude: Number(message['longitude']),
				lane_changing: message['lane_changing'],
			});
		});
		socket.on('incident report', (messages) => {
			// console.log("incident report", messages);
			// console.log("rsu id", rsuId);

			const rawReports = (messages as ReportData[])
				.filter((message) => message['rsu_id'] === rsuId)
				.map((message) => {
					return {
						type: message['type'],
						rsu_id: message['rsu_id'],
						latitude: Number(message['latitude']),
						longitude: Number(message['longitude']),
					};
				});
			if (rawReports.length === 0) {
				// console.log("empty rawReports");

				if (!isCount) {
					timeoutId = setTimeout(() => {
						if (rsuId) {
							setReports([]);
						}
					}, 1000);
				}
				isCount = true;
			} else {
				// console.log("not empty rawReports");

				isCount = false;
				clearTimeout(timeoutId);
				setReports(rawReports);
			}
		});
		socket.on('new report notification', (message) => {
			const reportNotiMessage =
				message.type === 'CLOSED ROAD'
					? 'Road closed report received .'
					: message.type === 'ACCIDENT'
					? 'Accident report received .'
					: message.type === 'CONSTRUCTION'
					? 'Roadwork report received .'
					: message.type === 'TRAFFIC CONGESTION'
					? 'Traffic slowdowns report received .'
					: '';

			setReports([
				{
					type: message['type'],
					rsu_id: message['rsu_id'],
					latitude: Number(message['latitude']),
					longitude: Number(message['longitude']),
				},
			]);

			setNotiMessage(reportNotiMessage);
			const audio = new Audio('/noti.mp3');
			audio.play();
			setIsPopupVisible(true);
			setTimeout(() => {
				setIsPopupVisible(false);
			}, 3000);
		});

		socket.on('disconnect', () => {
			console.log('Disconnected from OBU backend');
		});
	}, [auth, rsuId]);

	return (
		<>
			<Script
				type="text/javascript"
				src="/scripts/RTCMultiConnection.min.js"
				strategy="beforeInteractive"
			/>
			<Script
				type="text/javascript"
				src="/scripts/socket.io.js"
				strategy="beforeInteractive"
			/>
			{/* <Script
				src="https://muazkhan.com:9001/dist/RTCMultiConnection.min.js"
				strategy="beforeInteractive"
			/>
			<Script
				src="https://muazkhan.com:9001/socket.io/socket.io.js"
				strategy="beforeInteractive"
			/> 
			<Script
				src="https://www.webrtc-experiment.com/RecordRTC.js"
				strategy="beforeInteractive"
			/> */}
			<AuthContext.Provider value={[auth, setAuth]}>
				<CarContext.Provider value={car}>
					<RSUContext.Provider value={rsu}>
						<ReportContext.Provider value={reports}>
							<Modal
								isOpen={isPopupVisible}
								header="Notification"
								content={notiMessage}
								remote={false}
							/>
							{props.children}
						</ReportContext.Provider>
					</RSUContext.Provider>
				</CarContext.Provider>
			</AuthContext.Provider>
		</>
	);
}
