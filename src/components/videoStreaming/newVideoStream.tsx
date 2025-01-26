import { useEffect, useMemo, useRef } from 'react';
import $ from 'jquery';
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
			let offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			getRemoteSdp();
		};

		const getCodecInfo = () => {
			$.get(`${stream_server}/stream/codec/${suuid}`, function (data) {
				try {
					data = JSON.parse(data);
				} catch (e) {
					console.log(e);
				} finally {
					$.each(data, function (index, value) {
						pc.addTransceiver(value.Type, {
							direction: 'sendrecv',
						});
					});
				}
			});
		};

		const getRemoteSdp = () => {
			$.post(
				`${stream_server}/stream/receiver/${suuid}`,
				{
					suuid: suuid,
					data: btoa(pc.localDescription?.sdp ?? ''),
				},
				function (data) {
					try {
						pc.setRemoteDescription(
							new RTCSessionDescription({
								type: 'answer',
								sdp: atob(data),
							})
						);
					} catch (e) {
						console.warn(e);
					}
				}
			);
		};

		getCodecInfo();

		pc.onnegotiationneeded = handleNegotiationNeededEvent;

		pc.ontrack = function (event) {
			stream.addTrack(event.track);
			if (videoElem.current != null) {
				videoElem.current.srcObject = stream;
			}
			log(event.streams.length + ' track is delivered');
		};

		pc.oniceconnectionstatechange = (e) => log(pc.iceConnectionState);
	}, [suuid, stream, stream_server]);

	return <Video id="videoElem" ref={videoElem} autoPlay muted controls></Video>;
};

export default NewVideoStream;
