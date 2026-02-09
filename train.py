from ultralytics import YOLO

def train_model():
    print("🚀 Starting Wildlife Detection Training...")
    
    # Load model
    model = YOLO('yolo11n.pt')
    
    results = model.train(
        data='data/dataset/data.yaml',
        epochs=50,
        imgsz=640,
        batch=16,
        patience=10,
        project='runs/extended_train',
        name='wildlife_v1'
    )
    
    print("Training completed!")

if __name__ == "__main__":
    train_model()

