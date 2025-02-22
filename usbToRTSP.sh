#!/bin/bash

# Detect the operating system
OS="$(uname -s)"

# Function to start streaming on Windows
start_stream_windows() {
    echo "Starting streams on Windows..."
    # Loop over each camera ID provided as argument
    for cam_id in "$@"; do
        # Start FFmpeg for each camera based on the ID passed
        start /B ffmpeg -f dshow -i video="Integrated Webcam" -f rtsp -rtsp_transport tcp rtsp://localhost:8554/cam$cam_id
    done
}

# Function to start streaming on macOS
start_stream_mac() {
    echo "Starting streams on macOS..."
    # Loop over each camera ID provided as argument
    for cam_id in "$@"; do
        # Start FFmpeg for each camera based on the ID passed
        ffmpeg -f avfoundation -framerate 30 -video_size 640x480 -i "$cam_id" -f rtsp -rtsp_transport tcp rtsp://localhost:8554/cam$cam_id &
        FFmpeg_pids[$cam_id]=$!
    done
    
    # Store the PIDs for later cleanup
    echo "FFmpeg processes started with PIDs: ${FFmpeg_pids[@]}"
}

# Function to clean up FFmpeg processes on interruption
cleanup() {
    echo "Interrupt received, cleaning up..."
    
    if [[ "$OS" == "Darwin" ]]; then
        # Terminate FFmpeg processes for macOS
        for pid in "${FFmpeg_pids[@]}"; do
            kill $pid
        done
    elif [[ "$OS" == "MINGW32_NT" || "$OS" == "MINGW64_NT" || "$OS" == "CYGWIN" ]]; then
        # Windows does not have process handling in the same way, you may need to manually kill FFmpeg processes
        echo "On Windows, use Task Manager to terminate FFmpeg processes."
    fi
    
    echo "Streaming stopped."
    exit 0
}

# Trap Ctrl+C (SIGINT) to trigger cleanup
trap cleanup SIGINT

# Check if arguments are provided
if [ "$#" -eq 0 ]; then
    echo "Please provide the camera IDs to stream."
    exit 1
fi

# Get the camera IDs from the arguments
camera_ids=("$@")

# Check the OS and execute the appropriate function
if [[ "$OS" == "Darwin" ]]; then
    start_stream_mac "${camera_ids[@]}"
elif [[ "$OS" == "MINGW32_NT" || "$OS" == "MINGW64_NT" || "$OS" == "CYGWIN" ]]; then
    start_stream_windows "${camera_ids[@]}"
else
    echo "Unsupported OS. Please run on macOS or Windows."
    exit 1
fi

# Wait indefinitely to keep the script running and listen for interrupts
while true; do
    sleep 1
done
