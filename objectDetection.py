from ultralytics import YOLO
import socketio
import requests
import threading
import torch
import os
from dotenv import dotenv_values
# Load environment variable from .env.local
config = dotenv_values(".env.local")

device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f'Using device: {device}')

# Create Socket.IO client
sio = socketio.Client()

carID = config.get('NEXT_PUBLIC_CAR_ID')
cam_front_rtsp = config.get('NEXT_PUBLIC_CAM_FRONT_RTSP')
cam_back_rtsp = config.get('NEXT_PUBLIC_CAM_BACK_RTSP')
cam_left_rtsp = config.get('NEXT_PUBLIC_CAM_LEFT_RTSP')
cam_right_rtsp = config.get('NEXT_PUBLIC_CAM_RIGHT_RTSP')

# Set the Socket.IO server URL
cam_url = config.get('NEXT_PUBLIC_API_CAM_URI')
server_url = config.get('NEXT_PUBLIC_API_SERVER_URI')


response = requests.get(f"{server_url}api/cars/{carID}")

if (response.status_code != 200):
    print("can not connect to server")
    exit()

cameras =  response.json()["data"]["cameras"]

@sio.event
def connect():
    print("Connected to server")

@sio.event
def disconnect():
    print("Disconnected from server")

# Process results and send to the server
def process_and_send_results(boxes, roomID):
   
    sio.emit("send object detection", {
        "boxes": boxes,
        "roomID": roomID,
    })
    print("Object detection results sent to server")


# Connect to the Socket.IO server
sio.connect(cam_url)

def thread_callback(roomID, camSource):
    # Load YOLOv8 model
    model = YOLO("yolov8n.pt")  # Replace with the correct path or configuration
    model.to(device)
    
    results = model(source=camSource, conf=0.6, stream=True, imgsz=(480, 640))

    # Process results list
    for i, result in enumerate(results):
        # Access bounding boxes, labels, and confidence scores
        boxes = result.boxes
        orig_shape = result.orig_shape  # Get the original shape of the image
        confident_boxes = boxes.conf
        boundary = boxes.xywh
        boxes_normalized = []
        for j,box in enumerate(boxes):
            # boundary = box.xyxy[0]  # get box coordinates in (left, top, right, bottom) format
            # x, y, w, h = box.xywhn
            # w = right-x
            # h = y-bottom
            c = box.cls
            # print("XYWH:",(boundary).tolist()[j])
            x,y,w,h = (boundary).tolist()[j]
            x_normalized = (x - 0.5 * w) / orig_shape[1]
            y_normalized = (y - 0.5 * h) / orig_shape[0]
            w_normalized = w / orig_shape[1]
            h_normalized = h / orig_shape[0]
            score = confident_boxes.tolist()[j]
            label = model.names[int(c)]
            bounding_normalized = [x_normalized, y_normalized, w_normalized, h_normalized]
            payload = {
            "label": label,
            "probability": score,
            "label_number": int(c),
            "bounding": bounding_normalized,
            }
            boxes_normalized.append(payload)
        process_and_send_results(boxes_normalized,roomID)






# camSource = 4
# camID = cameras[camSource-2]["id"]
# # Define the roomID (replace with the actual roomID)
# roomID = f"Room{carID}{camID}"
# thread_callback(roomID,camSource)

# camSource = 2
rtsp_sources = [
    cam_front_rtsp,
    cam_back_rtsp,
    cam_left_rtsp,
    cam_right_rtsp
]
# thr = threading.Thread(target=thread_callback, args=[camSource,camSource+2])
# thr.start()

for (i, camera) in enumerate(cameras):
    camID = camera["id"]
    rtsp_source = rtsp_sources[i]
    # Define the roomID (replace with the actual roomID)
    roomID = f"Room{carID}{camID}"
    thr = threading.Thread(target=thread_callback, args=[roomID,rtsp_source])
    thr.start()
    # camSource+=1

sio.wait()