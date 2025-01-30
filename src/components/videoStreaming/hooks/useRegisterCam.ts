import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

type UseRegisterCarProps = {
	controlCenterSocket: React.MutableRefObject<Socket | undefined>;
	carID: string;
	camNumber: string;
};

const useRegisterCam = ({
	controlCenterSocket,
	carID,
	camNumber,
}: UseRegisterCarProps) => {
	useEffect(() => {
		controlCenterSocket.current = io(
			process.env.NEXT_PUBLIC_API_CAM_URI || 'http://localhost:3426'
		) as Socket;
		controlCenterSocket.current.emit('car connecting', {
			carID: carID,
			camNumber: camNumber,
		});

		controlCenterSocket.current.on('start detecting', () => {
			console.log('start detect');
		});

		controlCenterSocket.current.on('stop detecting', () => {
			console.log('stop detect');
		});

		return () => {
			controlCenterSocket.current?.disconnect();
		};
	}, [controlCenterSocket, carID, camNumber]);
};

export default useRegisterCam;
