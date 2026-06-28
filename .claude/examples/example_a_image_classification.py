"""
Example A: TAO Image Classification Training Pipeline
======================================================

End-to-end workflow: prepare data → train → evaluate → export → deploy

This example uses TAO's PyTorch classifier to build a model that can
identify different object categories from images.
"""

import os
import json
from pathlib import Path

# Example dataset structure you'd prepare:
EXAMPLE_DATASET = """
# Directory structure (required):
# data/
# ├── train/
# │   ├── class_1/
# │   │   ├── img_001.jpg
# │   │   ├── img_002.jpg
# │   │   └── ...
# │   ├── class_2/
# │   └── ...
# ├── val/
# │   ├── class_1/
# │   ├── class_2/
# │   └── ...
# └── classes.txt
#     cat
#     dog
#     bird
"""

class TAOClassificationPipeline:
    """
    TAO Image Classification workflow

    Phases:
    1. Prepare dataset (create tar archives)
    2. Create training spec
    3. Run training with AutoML
    4. Evaluate trained model
    5. Export to ONNX
    6. Generate TensorRT engine
    7. Run inference
    """

    def __init__(self, project_name="my_classifier", num_classes=3):
        self.project_name = project_name
        self.num_classes = num_classes
        self.results_dir = f"results/{project_name}"
        self.data_dir = "data"

    def create_training_spec(self):
        """Generate training specification (YAML format)"""
        spec = {
            "model": {
                "backbone": {
                    "type": "fan_small_12_p4_hybrid",  # Efficient backbone
                    "pretrained_backbone_path": None,  # Use ImageNet pretrained
                },
                "num_classes": self.num_classes,
            },
            "dataset": {
                "num_classes": self.num_classes,
                "train_dataset": {
                    "images_dir": f"{self.data_dir}/train/images_train",
                },
                "val_dataset": {
                    "images_dir": f"{self.data_dir}/val/images_val",
                },
                "classes_file": f"{self.data_dir}/classes.txt",
                "img_size": 224,
                "batch_size": 8,
            },
            "train": {
                "num_epochs": 20,
                "num_gpus": 1,
                "validation_interval": 2,
                "checkpoint_interval": 2,
                "optim": {
                    "lr": 1e-4,
                    "policy": "step",
                },
            },
            "export": {
                "input_height": 224,
                "input_width": 224,
            },
            "gen_trt_engine": {
                "tensorrt": {
                    "data_type": "fp16",  # Mixed precision for speed
                    "max_workspace_size": 1024,
                },
            },
        }
        return spec

    def train_with_automl(self):
        """
        Train using TAO's AutoML (automatic hyperparameter optimization)

        TAO automatically searches:
        - Learning rates
        - Augmentation strategies
        - Batch sizes
        - Checkpoint frequencies
        """
        spec = self.create_training_spec()

        print("=" * 70)
        print("PHASE 1: TRAINING WITH AUTOML")
        print("=" * 70)
        print(f"Project: {self.project_name}")
        print(f"Backbone: {spec['model']['backbone']['type']}")
        print(f"Classes: {self.num_classes}")
        print(f"Epochs: {spec['train']['num_epochs']}")
        print(f"Batch size: {spec['dataset']['batch_size']}")
        print("\nTAO Command:")
        print(f"  tao run --job_type automl_train")
        print(f"      classification_pyt")
        print(f"      -e spec_template_train.yaml")
        print(f"      --gpus 1")
        print(f"      train")
        print("\nExpected output:")
        print("  [OK] Epoch 1/20 -- val_acc: 0.62")
        print("  [OK] Epoch 2/20 -- val_acc: 0.71")
        print("  [OK] Epoch 20/20 -- val_acc: 0.89")
        print(f"  [OK] Best checkpoint saved: {self.results_dir}/model_epoch_18.pth")
        print()
        return spec

    def evaluate_model(self, checkpoint_path=None):
        """Evaluate trained model on validation set"""
        if checkpoint_path is None:
            checkpoint_path = f"{self.results_dir}/classifier_model_latest.pth"

        print("=" * 70)
        print("PHASE 2: EVALUATION")
        print("=" * 70)
        print(f"Checkpoint: {checkpoint_path}")
        print("\nTAO Command:")
        print(f"  tao run classification_pyt evaluate")
        print(f"      -e spec_template_evaluate.yaml")
        print(f"      --gpus 1")
        print("\nExpected Metrics:")
        print("  [OK] Accuracy: 0.891")
        print("  [OK] Precision: 0.883")
        print("  [OK] Recall: 0.891")
        print("  [OK] F1-Score: 0.887")
        print()

    def export_to_onnx(self, checkpoint_path=None):
        """Export trained model to ONNX format"""
        if checkpoint_path is None:
            checkpoint_path = f"{self.results_dir}/classifier_model_latest.pth"

        print("=" * 70)
        print("PHASE 3: EXPORT TO ONNX")
        print("=" * 70)
        print(f"Input: {checkpoint_path}")
        print(f"Output: {self.results_dir}/model.onnx")
        print("\nTAO Command:")
        print(f"  tao run classification_pyt export")
        print(f"      -e spec_template_export.yaml")
        print(f"      --gpus 1")
        print("\nExport Details:")
        print("  [OK] Input: images [B, 3, 224, 224]")
        print("  [OK] Output: logits [B, 3]")
        print("  [OK] Opset version: 13")
        print(f"  [OK] Model size: 45MB")
        print()
        return f"{self.results_dir}/model.onnx"

    def generate_tensorrt_engine(self, onnx_path=None):
        """Build TensorRT engine for high-speed inference"""
        if onnx_path is None:
            onnx_path = f"{self.results_dir}/model.onnx"

        print("=" * 70)
        print("PHASE 4: BUILD TENSORRT ENGINE")
        print("=" * 70)
        print(f"Input: {onnx_path}")
        print(f"Output: {self.results_dir}/model.plan")
        print("Precision: FP16 (mixed)")
        print("\nTAO Command:")
        print(f"  tao run classification_pyt gen_trt_engine")
        print(f"      -e spec_template_gen_trt_engine.yaml")
        print(f"      --gpus 1")
        print("\nEngine Build:")
        print("  [OK] Parsing ONNX...")
        print("  [OK] Building FP16 network...")
        print("  [OK] Optimizing kernels...")
        print(f"  [OK] Engine ready: {self.results_dir}/model.plan (28MB)")
        print("  [OK] Expected inference speed: ~2ms per image (on A100)")
        print()

    def run_inference(self, image_path, engine_path=None):
        """Run inference on a single image or batch"""
        if engine_path is None:
            engine_path = f"{self.results_dir}/model.plan"

        print("=" * 70)
        print("PHASE 5: INFERENCE")
        print("=" * 70)
        print(f"Engine: {engine_path}")
        print(f"Input image: {image_path}")
        print("\nCode example:")
        print("""
import tensorrt as trt
import numpy as np

# Load TensorRT engine
with open("model.plan", "rb") as f:
    engine_data = f.read()
engine = trt.Runtime(trt.Logger()).deserialize_cuda_engine(engine_data)

# Prepare input
image = load_and_preprocess("cat.jpg")  # [1, 3, 224, 224]
bindings = [image, np.empty((1, 3), dtype=np.float32)]

# Infer
with engine.create_execution_context() as context:
    context.execute_v2(bindings)

logits = bindings[1]
class_id = np.argmax(logits)
confidence = softmax(logits)[0, class_id]
print(f"Prediction: {class_names[class_id]} ({confidence:.2%})")
        """)
        print("\nExpected output:")
        print("  Prediction: cat (94.2%)")
        print()

    def end_to_end_pipeline(self):
        """Run complete pipeline"""
        print("\n" + "=" * 70)
        print("TAO IMAGE CLASSIFICATION — END-TO-END EXAMPLE")
        print("=" * 70 + "\n")

        # Phase 1: Train
        spec = self.train_with_automl()

        # Phase 2: Evaluate
        self.evaluate_model()

        # Phase 3: Export
        onnx_path = self.export_to_onnx()

        # Phase 4: Build TensorRT
        self.generate_tensorrt_engine(onnx_path)

        # Phase 5: Inference
        self.run_inference("test_images/cat.jpg")

        print("=" * 70)
        print("[SUCCESS] PIPELINE COMPLETE")
        print("=" * 70)
        print(f"Trained model ready for deployment!")
        print(f"  - ONNX: {onnx_path}")
        print(f"  - TensorRT: {self.results_dir}/model.plan")
        print(f"  - Checkpoint: {self.results_dir}/classifier_model_latest.pth")
        print()


if __name__ == "__main__":
    # Initialize pipeline
    pipeline = TAOClassificationPipeline(
        project_name="pet_classifier",
        num_classes=3  # cat, dog, bird
    )

    # Run complete workflow
    pipeline.end_to_end_pipeline()
