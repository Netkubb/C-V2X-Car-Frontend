import cv from "@techstark/opencv-js";
import { Tensor } from "onnxruntime-web";
import { renderBoxes } from "./renderBox";

/**
 * Detect Video
 * @param {HTMLVideoElement} video Video element for detection
 * @param {ort.InferenceSession} session YOLOv8 onnxruntime session
 * @param {Number} topk Integer representing the maximum number of boxes to be selected per class
 * @param {Number} iouThreshold Float representing the threshold for deciding whether boxes overlap too much with respect to IOU
 * @param {Number} scoreThreshold Float representing the threshold for deciding when to remove boxes based on score
 * @param {Number[]} inputShape Model input shape. Normally in YOLO model [batch, channels, width, height]
 */
export const detectVideo = async (
  video,
  canvas,
  session,
  topk,
  iouThreshold,
  scoreThreshold,
  inputShape,
  socket,
  roomID
) => {
  // Ensure that inputShape is an array
  const isArray = Array.isArray(inputShape);
  if (!isArray) {
    console.error("inputShape is not an array");
    return;
  }

  const [modelWidth, modelHeight] = inputShape.slice(2);
  let isProcessing = false;

  // Remove the event listener and use a manual invocation
  //   const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const processFrame = async () => {
    if (!isProcessing) {
      isProcessing = true;

      // Check if the video element has valid width and height
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        isProcessing = false;
        requestAnimationFrame(processFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const [input, xRatio, yRatio] = preprocessing(
        canvas,
        modelWidth,
        modelHeight
      );

      const tensor = new Tensor("float32", input.data32F, inputShape);
      const config = new Tensor(
        "float32",
        new Float32Array([
          topk, // topk per class
          iouThreshold, // iou threshold
          scoreThreshold, // score threshold
        ])
      );
      const { output0 } = await session.net.run({ images: tensor });
      const { selected } = await session.nms.run({
        detection: output0,
        config: config,
      });

      const boxes = [];
      const boxesNormalized = [];

      for (let idx = 0; idx < selected.dims[1]; idx++) {
        const data = selected.data.slice(
          idx * selected.dims[2],
          (idx + 1) * selected.dims[2]
        );
        const box = data.slice(0, 4);
        const scores = data.slice(4);
        const score = Math.max(...scores);
        const label = scores.indexOf(score);

        const [x, y, w, h] = [
          box[0] - 0.5 * box[2],
          box[1] - 0.5 * box[3],
          box[2],
          box[3],
        ];

        boxes.push({
          label: label,
          probability: score,
          bounding: [x, y, w, h],
        });

        boxesNormalized.push({
          label: label,
          probability: score,
          bounding: [
            x / canvas.width,
            y / canvas.height,
            w / canvas.width,
            h / canvas.height,
          ],
        });
      }
      socket.emit("send object detection", {
        boxes: boxesNormalized,
        roomID: roomID,
      });

      renderBoxes(canvas, boxes);

      input.delete();
      isProcessing = false;

      // Continue processing frames
      requestAnimationFrame(processFrame);
    }
  };

  // Start processing frames
  processFrame();
};

/**
 * Preprocessing canvas
 * @param {HTMLCanvasElement} canvas Canvas element
 * @param {Number} modelWidth Model input width
 * @param {Number} modelHeight Model input height
 * @return Preprocessed image and configs
 */
const preprocessing = (canvas, modelWidth, modelHeight) => {
  const mat = cv.imread(canvas);
  const matC3 = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC3);
  cv.cvtColor(mat, matC3, cv.COLOR_RGBA2BGR);

  const maxSize = Math.max(matC3.rows, matC3.cols);
  const xPad = maxSize - matC3.cols,
    xRatio = maxSize / matC3.cols;
  const yPad = maxSize - matC3.rows,
    yRatio = maxSize / matC3.rows;
  const matPad = new cv.Mat();
  cv.copyMakeBorder(matC3, matPad, 0, yPad, 0, xPad, cv.BORDER_CONSTANT);

  const input = cv.blobFromImage(
    matPad,
    1 / 255.0,
    new cv.Size(modelWidth, modelHeight),
    new cv.Scalar(0, 0, 0),
    true,
    false
  );

  mat.delete();
  matC3.delete();
  matPad.delete();

  return [input, xRatio, yRatio];
};
