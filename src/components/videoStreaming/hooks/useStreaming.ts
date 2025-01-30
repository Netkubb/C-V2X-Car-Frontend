import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
// @ts-ignore
import RTCMultiConnection from 'rtcmulticonnection';

type UseStreamingProps = {
	connection: React.MutableRefObject<RTCMultiConnection | undefined>;
	setStream: React.Dispatch<React.SetStateAction<MediaStream | undefined>>;
	socket: React.MutableRefObject<Socket | undefined>;
	carID: string;
	camNumber: string;
	sourceNumber: number;
	isStream: boolean;
	setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
	isOnlineRef: React.MutableRefObject<boolean>;
	setRoomID: React.Dispatch<React.SetStateAction<string | null>>;
};

const useStreaming = ({
	connection,
	setStream,
	socket,
	carID,
	camNumber,
	sourceNumber,
	isStream,
	setIsOnline,
	isOnlineRef,
	setRoomID,
}: UseStreamingProps) => {
	useEffect(() => {
		if (!connection.current) {
			connection.current = new RTCMultiConnection();

			connection.current.socketURL = process.env.NEXT_PUBLIC_API_CAM_URI + '/';
			console.log(process.env.NEXT_PUBLIC_API_CAM_URI + '/');

			socket.current = io(
				process.env.NEXT_PUBLIC_API_CAM_URI || '<API-CAM-URL>'
			) as Socket;
			socket.current.emit('car connecting', {
				carID: carID,
				camNumber: camNumber,
			});

			connection.current.socketMessageEvent = 'video-broadcast-demo';

			connection.current.session = {
				audio: false,
				video: true,
				oneway: true,
			};

			connection.current.dontCaptureUserMedia = true;

			navigator.mediaDevices
				.enumerateDevices()
				.then((devices) => selectDevice(devices))
				.then((video) => {
					setStream(video);
					socket.current?.on('start detecting', () => {
						console.log('start detect');
					});

					socket.current?.on('stop detecting', () => {
						console.log('stop detect');
					});
					connection.current.videosContainer = document.getElementById(
						`videos-container${camNumber}`
					);

					connection.current.attachStreams = [video];
					if (isStream) {
						startStreaming();
						setInterval(() => {
							startStreaming();
						}, 60000);
						console.log('start rec', sourceNumber);
					}
				});
		}
	}, []);

	const selectDevice = (devices: MediaDeviceInfo[]) => {
		const videoDevices = devices.filter(
			(device) => device.kind === 'videoinput'
		);
		if (videoDevices.length === 0) {
			console.error('No video input devices found');
			return;
		}
		console.log(videoDevices);
		const selectedDevice = videoDevices[Number(sourceNumber)].deviceId;

		const constraints = {
			video: {
				deviceId: { exact: selectedDevice },
			},
			audio: false,
		};

		return navigator.mediaDevices.getUserMedia(constraints);
	};

	const startStreaming = () => {
		connection.current.sdpConstraints.mandatory = {
			OfferToReceiveAudio: false,
			OfferToReceiveVideo: false,
		};
		connection.current.open(
			`Room${carID}${camNumber}`,
			function (isRoomOpened: boolean) {
				isOnlineRef.current = isRoomOpened;
				setIsOnline(isRoomOpened);
				console.log(connection.current.sessionid);
				setRoomID(connection.current.sessionid);
				if (!isRoomOpened) {
					window.location.reload();
				}
			}
		);
	};
};

export default useStreaming;
