'use client';

import { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

interface NewVideoStreamProps {
	stream_server: string;
	suuid: string;
}

const Video = styled.video`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const NewVideoStream = ({ stream_server, suuid }: NewVideoStreamProps) => {
	const stream = useMemo(() => new MediaStream(), []);
	const videoElem = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		// Use the below code if your peer is not in the same network

		const config = {
			iceServers: [
				{
					urls: ['stun:stun.l.google.com:19302'],
				},
			],
		};

		const pc = new RTCPeerConnection(config);

		const log = (msg: string) => {
			console.log(msg);
		};

		const handleNegotiationNeededEvent = async () => {
			try {
				const offer = await pc.createOffer();
				await pc.setLocalDescription(offer);
				getRemoteSdp();
			} catch (error) {
				console.error('Error during negotiation:', error);
			}
		};

		const getCodecInfo = async () => {
			try {
				const response = await fetch(`${stream_server}/stream/codec/${suuid}`);
				const data = await response.json();
				// data should be an array of codec objects
				data.forEach((value: { Type: string }) => {
					pc.addTransceiver(value.Type, {
						direction: 'sendrecv',
					});
				});
			} catch (error) {
				console.error('Failed to get codec info:', error);
			}
		};

		const getRemoteSdp = async () => {
			if (!pc.localDescription) return;

			try {
				const response = await fetch(
					`${stream_server}/stream/receiver/${suuid}`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							suuid,
							data: btoa(pc.localDescription.sdp),
						}),
					}
				);
				const data = await response.text();
				pc.setRemoteDescription(
					new RTCSessionDescription({
						type: 'answer',
						sdp: atob(data),
					})
				);
			} catch (error) {
				console.warn('Failed to set remote description:', error);
			}
		};

		// Kick off the process
		getCodecInfo();

		pc.onnegotiationneeded = handleNegotiationNeededEvent;

		pc.ontrack = (event) => {
			stream.addTrack(event.track);
			if (videoElem.current) {
				videoElem.current.srcObject = stream;
			}
			log(event.streams.length + ' track is delivered');
		};

		pc.oniceconnectionstatechange = () => {
			log(pc.iceConnectionState);
		};

		// Cleanup when unmounting
		return () => {
			pc.close();
		};
	}, [suuid, stream, stream_server]);

	return <Video id="videoElem" ref={videoElem} autoPlay muted controls />;
};

export default NewVideoStream;
