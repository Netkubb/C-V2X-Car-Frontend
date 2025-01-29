import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import RTCMultiConnection from 'rtcmulticonnection';
import { io, Socket } from 'socket.io-client';
import { TailSpin } from 'react-loader-spinner';
import RenderBoxes from './renderBox';
import NewVideoStream from './newVideoStream';
import { BlackWindow, Status, VideoContainer } from './videoStreaming.styled';

type StreamVideoProps = {
	isShow: boolean;
	carID: string;
	camNumber: string;
	key: string;
	sourceNumber: number;
	isShowObjectDetection: boolean;
	isStream: boolean;
	isInitDetection: boolean;
};

const LoadingSpinner: React.FC = () => (
	<TailSpin color="white" height={50} width={50} />
);

const StreamVideo: React.FC<StreamVideoProps> = ({
	isShow,
	carID,
	camNumber,
	sourceNumber,
	key,
	isShowObjectDetection,
	isStream,
	isInitDetection,
}) => {
	const connection = useRef<RTCMultiConnection>();
	const [stream, setStream] = useState<MediaStream | undefined>();
	const socket = useRef<Socket>();
	const userVideo = useRef<HTMLVideoElement>(null);
	const [isOnline, setIsOnline] = useState<boolean>(false);
	const isOnlineRef = useRef<boolean>(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [roomID, setRoomID] = useState<string | null>(null);
	let mediaRecorder: any = useRef();
	let recordedChunks: any = useRef([]);
	const videoDownloadRef: any = useRef();

	useEffect(() => {
		const initUserVideo = async () => {
			try {
				const devices = await navigator.mediaDevices.enumerateDevices();
				const stream = await selectDevice(devices);
				if (stream) {
					setStream(stream);
				}
				while (!userVideo.current) {
					await new Promise((resolve) => setTimeout(resolve, 300)); // Wait for 100ms
				}
				if (userVideo.current) {
					userVideo.current.srcObject = stream || null;
				}
			} catch (error) {
				console.error('Error accessing webcam:', error);
			}
		};

		initUserVideo();
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

	useEffect(() => {
		if (
			socket.current &&
			canvasRef.current &&
			connection.current &&
			isShowObjectDetection &&
			isStream
		) {
			socket?.current?.emit('control center connecting', {
				roomID: connection.current.sessionid,
			});
			socket?.current?.on('send object detection', (boxes: Array<any>) => {
				if (canvasRef.current) {
					RenderBoxes({ canvas: canvasRef.current, boxes: boxes });
				}
			});
		}
	}, [
		canvasRef.current,
		socket.current,
		connection.current,
		isShowObjectDetection,
	]);

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

	function readFile(file: any) {
		console.log('readFile()=>', file);
		return new Promise(function (resolve, reject) {
			let fr = new FileReader();

			fr.onload = function () {
				resolve(fr.result);
			};

			fr.onerror = function () {
				reject(fr);
			};

			fr.readAsDataURL(file);
		});
	}

	const uploadVideo = async (base64: any) => {
		console.log('uploading to backend...');
		try {
			fetch(`${process.env.NEXT_PUBLIC_API_URL}/videos/upload`, {
				method: 'POST',
				body: JSON.stringify({
					data: base64,
					fileName: `${carID}-${camNumber}-${new Date().getTime()}`,
				}),
				headers: { 'Content-Type': 'application/json' },
			}).then((response) => {
				console.log('successfull session', response.status);
			});
		} catch (error) {
			console.error(error);
		}
	};

	const stopCamHandler = () => {
		console.log('Hanging up the call ...');
		mediaRecorder.current.onstop = async (event: any) => {
			let blob = new Blob(recordedChunks.current, {
				type: 'video/mp4',
			});
			recordedChunks.current = [];

			// Create a FileReader to read the blob as base64
			let reader = new FileReader();
			reader.readAsDataURL(blob);

			// Define a callback function when reading is complete
			reader.onloadend = async () => {
				// Convert the base64 string to a format suitable for uploading
				let base64Data = reader.result?.toString().split(',')[1];

				// Save original video to cloudinary
				await uploadVideo(base64Data);

				// Optionally, provide a download link for the user
				videoDownloadRef.current.href = URL.createObjectURL(blob);
				videoDownloadRef.current.download =
					`${carID}-${camNumber}-` + new Date().getTime() + '.webm';
				videoDownloadRef.current.target = '_blank';
			};
		};

		mediaRecorder.current.stop();
	};

	useEffect(() => {
		if (stream) {
			if (userVideo.current) {
				userVideo.current.srcObject = stream;
				userVideo.current.onloadedmetadata = () => {
					if (userVideo.current) {
						const container = userVideo.current.parentElement;
						if (container) {
							const containerWidth = container.clientWidth;
							const containerHeight = container.clientHeight;

							userVideo.current.width = containerWidth;
							userVideo.current.height = containerHeight;

							if (canvasRef.current) {
								canvasRef.current.width = containerWidth;
								canvasRef.current.height = containerHeight;
							}
						}
					}
				};
			}
		}
	}, [stream]);

	return (
		<VideoContainer
			isShow={isShow}
			isInitDetection={isInitDetection}
			id={`videos-container${camNumber}`}
		>
			<button className="button" style={{ display: 'none' }}>
				<a ref={videoDownloadRef}></a>
			</button>
			{isStream ? <Status online={isOnline} /> : null}
			<>
				{stream ? (
					<div className="w-full h-full flex items-center justify-center">
						<NewVideoStream
							stream_server="http://localhost:8083"
							suuid="my_suuid"
						/>
						<canvas
							id="canvas"
							ref={canvasRef}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								zIndex: 0,
								display: isShowObjectDetection ? 'flex' : 'none',
							}}
						/>
					</div>
				) : (
					<BlackWindow>
						<LoadingSpinner />
					</BlackWindow>
				)}
			</>
		</VideoContainer>
	);
};

export default StreamVideo;
