import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import RenderBoxes from '../renderBox';
// @ts-ignore
import RTCMultiConnection from 'rtcmulticonnection';

type UseObjectDetectionProps = {
	controlCenterSocket: React.MutableRefObject<Socket | undefined>;
	canvasRef: React.RefObject<HTMLCanvasElement>;
	roomID: string;
	isShowObjectDetection: boolean;
	isStream: boolean;
};

const useObjectDetection = ({
	controlCenterSocket,
	canvasRef,
	roomID,
	isShowObjectDetection,
	isStream,
}: UseObjectDetectionProps) => {
	useEffect(() => {
		if (
			controlCenterSocket.current &&
			canvasRef.current &&
			roomID &&
			isShowObjectDetection &&
			isStream
		) {
			controlCenterSocket?.current?.emit('control center connecting', {
				roomID: roomID,
			});
			controlCenterSocket?.current?.on(
				'send object detection',
				(boxes: Array<any>) => {
					if (canvasRef.current) {
						RenderBoxes({ canvas: canvasRef.current, boxes: boxes });
					}
				}
			);
		}
	}, [
		canvasRef.current,
		controlCenterSocket.current,
		roomID,
		isShowObjectDetection,
		isStream,
	]);
};

export default useObjectDetection;
