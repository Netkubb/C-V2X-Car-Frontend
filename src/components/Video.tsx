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
		<video
			className="rounded-lg mt-2"
			onClick={() => onVideoClick(userId)}
			ref={ref}
			muted
			autoPlay
		/>
	);
};

export default Video;
