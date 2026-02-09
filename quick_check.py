import os

def quick_check():
    dataset_path = 'data/Datasets'
    
    print(" Quick Dataset Check")
    print("=" * 40)
    
    # Check each split
    for split in ['train', 'valid', 'test']:
        print(f"\n {split}:")
        
        images_folder = f"{dataset_path}/{split}/images"
        labels_folder = f"{dataset_path}/{split}/labels"
        
        # Count files
        if os.path.exists(images_folder):
            images = len([f for f in os.listdir(images_folder) if f.endswith(('.jpg', '.png'))])
            print(f"    Images: {images}")
        else:
            print(f"    Missing: {images_folder}")
            
        if os.path.exists(labels_folder):
            labels = len([f for f in os.listdir(labels_folder) if f.endswith('.txt')])
            print(f"    Labels: {labels}")
        else:
            print(f"    Missing: {labels_folder}")
    
    print("\n" + "=" * 40)
    print(" Check complete!")

quick_check()

