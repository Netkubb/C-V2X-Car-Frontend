import React, { memo, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { TailSpin } from 'react-loader-spinner';
import { BlackWindow, Status, VideoContainer } from './videoStreaming.styled';
import useObjectDetection from './hooks/useObjectDetection';
import useUpdateVideoAndCanvasDimensions from './hooks/useVideoAndCanvasDimensions';
import useVideoStream from './hooks/useVideoStream';
import useRegisterCam from './hooks/useRegisterCam';
import useUploadToSFU from './hooks/useUploadToSFU';
import { StreamConfig } from '@/configs/StreamConfig';

type StreamVideoProps = {
	camSUUID: string;
	isShow: boolean;
	carID: string;
	camNumber: string;
	isShowObjectDetection: boolean;
	isStream: boolean;
	isInitDetection: boolean;
};

const LoadingSpinner: React.FC = () => (
	<TailSpin color="white" height={50} width={50} />
);

const StreamVideo = ({
	camSUUID,
	isShow,
	carID,
	camNumber,
	isShowObjectDetection,
	isStream,
	isInitDetection,
}: StreamVideoProps) => {
	const userVideo = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const pcRef = useRef<RTCPeerConnection | null>(null);

	const controlCenterSocket = useRef<Socket>();

	const sfuServerUrl = StreamConfig.sfuServerUrl;
	const streamServerUrl = StreamConfig.converterServerUrl;
	const isStreamServerInSameNetwork = false;

	const { stream, connection, isOnline } = useVideoStream({
		streamServerUrl,
		suuid: camSUUID,
		isStreamServerInSameNetwork,
	});

	useUploadToSFU({
		sfuServerUrl,
		stream,
		isOnline,
	});

	useRegisterCam({
		controlCenterSocket,
		carID,
		camNumber,
	});

	useObjectDetection({
		controlCenterSocket,
		canvasRef,
		roomID: camSUUID,
		isShowObjectDetection,
		isStream,
	});

	useUpdateVideoAndCanvasDimensions({ stream, userVideo, canvasRef });

	return (
		<VideoContainer
			isshow={isShow ? 'true' : 'false'}
			isinitdetection={isInitDetection ? 'true' : 'false'}
			id={`videos-container${camNumber}`}
		>
			{isStream ? <Status isonline={isOnline ? 'true' : 'false'} /> : null}
			<>
				{stream ? (
					<div className="w-full h-full flex items-center justify-center">
						<video
							ref={userVideo}
							autoPlay
							muted
							controls
							className="w-full h-full object-contain"
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

export default memo(StreamVideo);
