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
	isshow: 'true' | 'false';
	isinitdetection: 'true' | 'false';
}>`
	width: 100%;
	height: 60%;
	position: relative;
	${(props) =>
		!props.isinitdetection
			? `display:flex;visibility :hidden;`
			: `display:none;`}
	${(props) =>
		props.isinitdetection
			? props.isshow
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

export const Status = styled.div<{ isonline: 'true' | 'false' }>`
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	z-index: 99;
	width: 15px;
	height: 15px;
	border-radius: 50%;
	margin: 10px;
	background-color: ${(props) => (props.isonline ? 'green' : 'red')};
`;
