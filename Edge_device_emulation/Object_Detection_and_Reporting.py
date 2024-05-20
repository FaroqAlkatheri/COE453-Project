import os
import cv2
import numpy as np
import json
from datetime import datetime
import base64
import time

# Constants
TEST_IMAGES_DIR = 'images'  # Directory containing images for processing
REPORT_DIR = 'reports'  # Directory where reports will be saved
MODEL_CONFIG = 'yolov4-tiny.cfg'  # Model configuration file
MODEL_WEIGHTS = 'yolov4-tiny.weights'  # Model weights file

# Ensure directories exist
if not os.path.exists(TEST_IMAGES_DIR):
    os.makedirs(TEST_IMAGES_DIR)
if not os.path.exists(REPORT_DIR):
    os.makedirs(REPORT_DIR)

# Load the model for object detection
try:
    net = cv2.dnn.readNetFromDarknet(MODEL_CONFIG, MODEL_WEIGHTS)
except Exception as e:
    print(f"Error loading model: {e}")

# Specify target classes of interest
classes = ["person", "bicycle", "car", "motorbike", "aeroplane", "bus"]

def encode_image(image):
    _, buffer = cv2.imencode('.png', image)
    return base64.b64encode(buffer).decode('utf-8')

def create_html_report(incident_report):
    """Create an HTML representation of the incident report."""
    image_html = f'<img src="data:image/png;base64,{incident_report["image"]}" alt="Incident Image" />'
    incident_id_html = f'<p><strong>Incident_id:</strong> {incident_report["incident_id"]}</p>'
    detected_objects_html = ''.join(f'<p><strong>Detected_object:</strong> {obj["class_name"]}</p>'
                                    f'<p><strong>Confidence:</strong> {obj["confidence"]}</p>'
                                    for obj in incident_report['detected_objects'])
    timestamp_html = f'<p><strong>Timestamp:</strong> {incident_report["timestamp"]}</p>'
    location_html = f'<p><strong>Location:</strong> {incident_report["location"]}</p>'
    html_content = f'<!DOCTYPE html><html><body>{image_html}{incident_id_html}{detected_objects_html}{timestamp_html}{location_html}</body></html>'
    return html_content

def save_reports(incident_report):
    """Save the incident report in both JSON and HTML formats."""
    report_filename = f"incident_report_{incident_report['incident_id']}"
    json_path = os.path.join(REPORT_DIR, report_filename + '.json')
    html_path = os.path.join(REPORT_DIR, report_filename + '.html')

    with open(json_path, 'w') as json_file:
        json.dump(incident_report, json_file, indent=4)

    with open(html_path, 'w') as html_file:
        html_file.write(create_html_report(incident_report))

    print(f"Saved JSON report: {json_path}")
    print(f"Saved HTML report: {html_path}")

def process_images():
    """
    Process each image file detected in the directory, generate reports for objects with high confidence.
    """
    image_files = [f for f in os.listdir(TEST_IMAGES_DIR) if f.endswith((".jpg", ".png"))]
    if not image_files:
        print("No images found in the directory.")
        return

    incident_counter = 0

    for image_file in image_files:
        print(f'Processing image file: {image_file}')
        frame = cv2.imread(os.path.join(TEST_IMAGES_DIR, image_file))
        frame_resized = cv2.resize(frame, (416, 416))
        blob = cv2.dnn.blobFromImage(frame_resized, 1/255, (416, 416), swapRB=True, crop=False)
        net.setInput(blob)
        outputs = net.forward(net.getUnconnectedOutLayersNames())
        
        detected_objects = []
        for output in outputs:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > 0.1 and class_id in range(len(classes)):
                    center_x, center_y, width, height = detection[0:4] * np.array([frame.shape[1], frame.shape[0], frame.shape[1], frame.shape[0]])
                    x, y = int(center_x - width / 2), int(center_y - height / 2)
                    detected_objects.append({
                        "class_name": classes[class_id],
                        "confidence": float(confidence)
                    })
        
        if detected_objects:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            incident_report = {
                "incident_id": incident_counter,
                "detected_objects": detected_objects,
                "timestamp": timestamp,
                "location": None,
                "image": encode_image(frame)
            }
            save_reports(incident_report)
            incident_counter += 1

    # Optionally terminate after processing all images
    print("Processing complete. Exiting...")
    exit()

if __name__ == '__main__':
    process_images()