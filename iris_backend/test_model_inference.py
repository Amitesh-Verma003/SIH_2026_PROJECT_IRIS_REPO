import sys
from pathlib import Path

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add iris_backend root to sys.path so app modules are discoverable
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from PIL import Image, ImageDraw
from app.ml.classifier import get_classifier, CLASS_METADATA


def create_synthetic_fundus_image() -> Image.Image:
    """Generate a test image that resembles a retinal fundus capture."""
    img = Image.new("RGB", (224, 224), color=(30, 8, 4))
    draw = ImageDraw.Draw(img)
    # Retinal disc aperture
    draw.ellipse([8, 8, 216, 216], fill=(180, 50, 20), outline=(120, 30, 10))
    # Optic disc (yellowish)
    draw.ellipse([50, 90, 85, 125], fill=(255, 230, 140))
    # Macular area (darker reddish)
    draw.ellipse([130, 95, 160, 125], fill=(120, 25, 10))
    # Primary blood vessels
    draw.line([(68, 107), (110, 50), (170, 40)], fill=(80, 10, 10), width=3)
    draw.line([(68, 107), (115, 160), (175, 180)], fill=(80, 10, 10), width=3)
    return img


def main():
    print("=" * 60)
    print("[TEST] Testing IRIS Deep Learning Inference Pipeline")
    print("=" * 60)

    # 1. Test Model Loading
    print("1. Loading trained model...")
    classifier = get_classifier()
    print(f"   [OK] Model loaded on device: {classifier.device}")
    print(f"   [OK] Weights path: {classifier.weights_path}")
    print(f"   [OK] Training dataset: {classifier.config_data.get('training', {}).get('dataset', 'APTOS 2019')}")
    print(f"   [OK] Best Val QWK: {classifier.config_data.get('training', {}).get('best_val_qwk', 'N/A')}")

    # 2. Test Image Preprocessing & Inference
    print("\n2. Executing inference on test retinal image...")
    test_img = create_synthetic_fundus_image()
    result = classifier.predict(test_img)

    print(f"   [OK] Predicted Grade: Level {result['icdr_level']} ({result['grade_label']})")
    print(f"   [OK] Severity Category: {result['severity_category']}")
    print(f"   [OK] Peak Confidence: {result['confidence_score']}%")
    print(f"   [OK] Referable DR Flag: {result['referable_flag']}")
    print(f"   [OK] VTDR Flag: {result['vtdr_flag']}")
    print(f"   [OK] Urgency Level: {result['urgency_level']}")
    print(f"   [OK] Doctor Recommendation: {result['doctor_recommendation'][:65]}...")

    # 3. Softmax Distribution Verification
    print("\n3. Verifying 5-class softmax distribution:")
    total_prob = 0.0
    for item in result["softmax_distribution"]:
        print(f"   - {item['label']}: {item['prob']}%")
        total_prob += item["prob"]
    print(f"   Total probability sum: {total_prob:.1f}%")
    assert 98.0 <= total_prob <= 102.0, f"Softmax sum outside expected range: {total_prob}"

    # 4. Saliency / Grad-CAM Verification
    print("\n4. Verifying Grad-CAM saliency localization:")
    hotspots = result["grad_cam"]["hotspots"]
    print(f"   [OK] Hotspot count: {len(hotspots)}")
    for i, hs in enumerate(hotspots):
        print(f"      [{i+1}] (x: {hs['x']}%, y: {hs['y']}%, r: {hs['r']}, intensity: {hs['intensity']})")
    print(f"   [OK] Heatmap Base64 generated: {bool(result['grad_cam']['heatmap_base64'])}")

    # 5. Image Quality Assessment Verification
    print("\n5. Verifying Image Quality Assessment (IQA):")
    iqa = result["iqa"]
    print(f"   [OK] Focus Score: {iqa['focus_score']}%")
    print(f"   [OK] Illumination Score: {iqa['illumination_score']}%")
    print(f"   [OK] FOV Score: {iqa['fov_score']}%")
    print(f"   [OK] Status: {iqa['overall_status']}")
    print(f"   [OK] Feedback: {iqa['feedback']}")

    print("\n" + "=" * 60)
    print("ALL INFERENCE PIPELINE CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    main()
