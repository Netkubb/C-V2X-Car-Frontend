import React from 'react';

interface Box {
	label: number;
	probability: number;
	label_number: number;
	bounding: [number, number, number, number];
}

interface RenderBoxesProps {
	canvas: HTMLCanvasElement;
	boxes: Array<Box>;
}

/**
 * Render prediction boxes
 * @param {HTMLCanvasElement} canvas canvas tag reference
 * @param {Array[Object]} boxes boxes array
 */
const RenderBoxes: React.FC<RenderBoxesProps> = ({ canvas, boxes }) => {
	const ctx = canvas?.getContext('2d');
	ctx?.clearRect(
		0,
		0,
		canvas?.parentElement?.clientWidth || 0,
		canvas?.parentElement?.clientHeight || 0
	); // clean canvas

	const colors = new Colors();

	if (!ctx) {
		console.error('Canvas context is null.');
		return null;
	}

	const canvasWidth = canvas?.parentElement?.clientWidth || 0;
	const canvasHeight = canvas?.parentElement?.clientHeight || 0;

	// font configs
	const font = `${Math.max(
		Math.round(Math.max(canvasWidth, canvasHeight) / 40),
		14
	)}px Arial`;
	ctx.font = font;
	ctx.textBaseline = 'top';

	boxes.forEach((box) => {
		// console.log(box)
		// const klass = labels[box.label];
		const klass = box.label;
		const color = colors.get(box.label_number);
		const score = (box.probability * 100).toFixed(1);
		// console.log(klass, score, color)

		const [x1Norm, y1Norm, widthNorm, heightNorm] = box.bounding;
		const [x1, y1, width, height] = [
			x1Norm * canvasWidth,
			y1Norm * canvasHeight,
			widthNorm * canvasWidth,
			heightNorm * canvasHeight,
		];

		// draw box.
		ctx.fillStyle = Colors.hexToRgba(color, 0.2);
		ctx.fillRect(x1, y1, width, height);
		// draw border box
		ctx.strokeStyle = color;
		ctx.lineWidth = Math.max(Math.min(canvasWidth, canvasHeight) / 200, 2.5);
		ctx.strokeRect(x1, y1, width, height);

		// draw the label background.
		ctx.fillStyle = color;
		const textWidth = ctx.measureText(klass + ' - ' + score + '%').width;
		const textHeight = parseInt(font, 10); // base 10
		const yText = y1 - (textHeight + ctx.lineWidth);
		ctx.fillRect(
			x1 - 1,
			yText < 0 ? 0 : yText,
			textWidth + ctx.lineWidth,
			textHeight + ctx.lineWidth
		);

		// Draw labels
		ctx.fillStyle = '#ffffff';
		ctx.fillText(
			klass + ' - ' + score + '%',
			x1 - 1,
			yText < 0 ? 1 : yText + 1
		);
	});

	return null;
};

class Colors {
	palette: string[];
	n: number;

	// ultralytics color palette https://ultralytics.com/
	constructor() {
		this.palette = [
			'#FF3838',
			'#FF9D97',
			'#FF701F',
			'#FFB21D',
			'#CFD231',
			'#48F90A',
			'#92CC17',
			'#3DDB86',
			'#1A9334',
			'#00D4BB',
			'#2C99A8',
			'#00C2FF',
			'#344593',
			'#6473FF',
			'#0018EC',
			'#8438FF',
			'#520085',
			'#CB38FF',
			'#FF95C8',
			'#FF37C7',
		];
		this.n = this.palette.length;
	}

	get = (i: number) => this.palette[Math.floor(i) % this.n];

	static hexToRgba = (hex: string, alpha: number): string => {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? `rgba(${[
					parseInt(result[1], 16),
					parseInt(result[2], 16),
					parseInt(result[3], 16),
			  ].join(', ')}, ${alpha})`
			: 'rgba(0, 0, 0, 0)'; // Default to transparent black if hex conversion fails
	};
}

export default RenderBoxes;
