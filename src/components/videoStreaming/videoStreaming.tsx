import React, { useRef } from 'react';
import { Socket } from 'socket.io-client';
import { TailSpin } from 'react-loader-spinner';
import { BlackWindow, Status, VideoContainer } from './videoStreaming.styled';
import useObjectDetection from './hooks/useObjectDetection';
import useUpdateVideoAndCanvasDimensions from './hooks/useVideoAndCanvasDimensions';
import useVideoStream from './hooks/useVideoStream';
import useRegisterCam from './hooks/useRegisterCam';

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

const StreamVideo: React.FC<StreamVideoProps> = ({
	camSUUID,
	isShow,
	carID,
	camNumber,
	isShowObjectDetection,
	isStream,
	isInitDetection,
}) => {
	const userVideo = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const controlCenterSocket = useRef<Socket>();

	const streamServerUrl = 'http://localhost:3426';
	const isStreamServerInSameNetwork = true;

	const { stream, connection, isOnline } = useVideoStream({
		streamServerUrl,
		suuid: camSUUID,
		isStreamServerInSameNetwork,
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
			isShow={isShow}
			isInitDetection={isInitDetection}
			id={`videos-container${camNumber}`}
		>
			{isStream ? <Status online={isOnline} /> : null}
			<>
				{stream ? (
					<div className="w-full h-full flex items-center justify-center">
						<video ref={userVideo} autoPlay muted playsInline />
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
