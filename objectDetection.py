from ultralytics import YOLO
import socketio

# Create Socket.IO client
sio = socketio.Client()

# Define the roomID (replace with the actual roomID)
roomID = "cae01"
# Set the Socket.IO server URL
server_url = "http://localhost:5002/"


@sio.event
def connect():
    print("Connected to server")

@sio.event
def disconnect():
    print("Disconnected from server")

# Process results and send to the server
def process_and_send_results(boxes):
    sio.emit("send object detection", {
        "boxes": boxes,
        "roomID": roomID,
      })
    print("Object detection results sent to server")


# Connect to the Socket.IO server
sio.connect(server_url)


# Load YOLOv8 model
model = YOLO("yolov8n.pt")  # Replace with the correct path or configuration


results = model(source=0, conf=0.8, show=True, stream=True)

# Process results list
for i, result in enumerate(results):
    # Access bounding boxes, labels, and confidence scores
    boxes = result.boxes
    orig_shape = result.orig_shape  # Get the original shape of the image


    boxes_normalized = []
    for box in boxes:
        boundary = box.xyxy[0]  # get box coordinates in (left, top, right, bottom) format
        x, bottom, right, y = box.xyxy[0].numpy()
        w = right-x
        h = y-bottom
        x_normalized = (x - 0.5 * w) / orig_shape[1]
        y_normalized = (y - 0.5 * h) / orig_shape[0]
        w_normalized = w / orig_shape[1]
        h_normalized = h / orig_shape[0]

        c = box.cls
        label = model.names[int(c)]
        bounding_normalized = [x_normalized, y_normalized, w_normalized, h_normalized]
        payload = {
          "label": label,
        #   "probability": result.probs[c],
          "bounding": bounding_normalized,
        }
        process_and_send_results(payload)



sio.wait()