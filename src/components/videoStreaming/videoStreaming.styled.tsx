import styled from 'styled-components';

export const BlackWindow = styled.div`
	width: 100%;
	height: 100%;
	background-color: black;
	display: flex;
	justify-content: center;
	align-items: center;
`;

export const VideoContainer = styled.div<{
	isShow: boolean;
	isInitDetection: boolean;
}>`
	width: 100%;
	height: 100%;
	position: relative;
	${(props) =>
		!props.isInitDetection
			? `display:flex;visibility :hidden;`
			: `display:none;`}
	${(props) =>
		props.isInitDetection
			? props.isShow
				? `
    display: flex !important;
    visibility :visible;
    `
				: `
    display: none;
    visibility :hidden;
  `
			: ''}
`;

export const Status = styled.div<{ online: boolean }>`
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	z-index: 99;
	width: 15px;
	height: 15px;
	border-radius: 50%;
	margin: 10px;
	background-color: ${(props) => (props.online ? 'green' : 'red')};
`;
