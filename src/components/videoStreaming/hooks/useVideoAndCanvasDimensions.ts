import { useEffect, RefObject } from 'react';

type UseUpdateVideoAndCanvasDimensionsProps = {
	stream: MediaStream | undefined;
	userVideo: RefObject<HTMLVideoElement>;
	canvasRef: RefObject<HTMLCanvasElement>;
};

const useUpdateVideoAndCanvasDimensions = ({
	stream,
	userVideo,
	canvasRef,
}: UseUpdateVideoAndCanvasDimensionsProps) => {
	useEffect(() => {
		const updateVideoAndCanvasDimensions = () => {
			if (userVideo.current && userVideo.current.parentElement) {
				const container = userVideo.current.parentElement;
				const containerWidth = container.clientWidth;
				const containerHeight = container.clientHeight;

				userVideo.current.width = containerWidth;
				userVideo.current.height = containerHeight;

				if (canvasRef.current) {
					canvasRef.current.width = containerWidth;
					canvasRef.current.height = containerHeight;
				}
			}
		};

		if (stream && userVideo.current) {
			userVideo.current.srcObject = stream;
			userVideo.current.onloadedmetadata = updateVideoAndCanvasDimensions;
		}
	}, [stream, userVideo, canvasRef]);
};

export default useUpdateVideoAndCanvasDimensions;
