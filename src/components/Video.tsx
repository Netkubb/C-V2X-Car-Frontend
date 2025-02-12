import React, { useEffect, useRef, useState } from 'react';

interface VideoProps {
	stream: MediaStream;
	onVideoClick: (id: string) => void;
	userId: string;
	muted?: boolean;
}

const Video = ({ stream, onVideoClick, userId, muted }: VideoProps) => {
	const ref = useRef<HTMLVideoElement>(null);
	const [isMuted, setIsMuted] = useState<boolean>(false);

	useEffect(() => {
		if (ref.current) ref.current.srcObject = stream;
		if (muted) setIsMuted(muted);
	}, [stream, muted]);

	return (
		<div className="relative w-28 h-20" onClick={() => onVideoClick(userId)}>
			<video ref={ref} muted={isMuted} autoPlay />
		</div>
	);
};

export default Video;
