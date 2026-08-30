#!/usr/bin/env python3
"""
IRIS — Diabetic Retinopathy CNN Training Script
================================================
Trains an EfficientNet-B0 transfer-learning model on the APTOS 2019 dataset
to classify fundus images into ICDR severity levels 0–4.

Usage:
    python3 train_dr_model.py

Outputs (saved to --output-dir, default: ./model_output/):
    - iris_dr_model.pth          Best model state dict
    - model_config.json          Model metadata & normalization params
    - training_curves.png        Loss & QWK vs epoch
    - confusion_matrix.png       Validation confusion matrix
    - training_log.txt           Epoch-by-epoch metrics
"""

import ssl
import certifi
import os

# Fix SSL certificates on macOS (python.org installers don't include root certs)
os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
ssl._create_default_https_context = ssl._create_unverified_context

import argparse
import json
import os
import time
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # non-interactive backend
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import torch
import torch.nn as nn
import torch.optim as optim
from PIL import Image
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    cohen_kappa_score,
)
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset, WeightedRandomSampler
from torchvision import models, transforms


# ── Constants ──────────────────────────────────────────────────────────────────
CLASS_NAMES = [
    "0 - No DR",
    "1 - Mild",
    "2 - Moderate",
    "3 - Severe",
    "4 - Proliferative DR",
]
NUM_CLASSES = 5
IMG_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


# ── Dataset ────────────────────────────────────────────────────────────────────
class RetinaDataset(Dataset):
    """Loads retinal fundus images with ICDR 0-4 labels."""

    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        label = self.labels[idx]

        # Load and convert to RGB (some images may have alpha channel)
        image = Image.open(img_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label


# ── Transforms ─────────────────────────────────────────────────────────────────
def get_train_transforms():
    """Augmentation pipeline for training — handles class imbalance via diversity."""
    return transforms.Compose([
        transforms.Resize((IMG_SIZE + 32, IMG_SIZE + 32)),
        transforms.RandomCrop(IMG_SIZE),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1, hue=0.05),
        transforms.RandomAffine(degrees=0, translate=(0.05, 0.05), scale=(0.95, 1.05)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def get_val_transforms():
    """Deterministic transforms for validation."""
    return transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


# ── Model ──────────────────────────────────────────────────────────────────────
def build_model(num_classes=NUM_CLASSES, pretrained=True):
    """EfficientNet-B0 with custom classification head."""
    weights = models.EfficientNet_B0_Weights.IMAGENET1K_V1 if pretrained else None
    model = models.efficientnet_b0(weights=weights)

    # Freeze backbone
    for param in model.features.parameters():
        param.requires_grad = False

    # Replace classifier head
    in_features = model.classifier[1].in_features  # 1280
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, num_classes),
    )

    return model


def unfreeze_backbone(model):
    """Unfreeze all layers for full fine-tuning."""
    for param in model.parameters():
        param.requires_grad = True


# ── Metrics ────────────────────────────────────────────────────────────────────
def quadratic_weighted_kappa(y_true, y_pred):
    """Compute QWK — the primary metric for DR grading (matches APTOS competition)."""
    return cohen_kappa_score(y_true, y_pred, weights="quadratic")


# ── Training Loop ──────────────────────────────────────────────────────────────
def train_one_epoch(model, loader, criterion, optimizer, device):
    """Train for one epoch, return average loss and accuracy."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc


@torch.no_grad()
def validate(model, loader, criterion, device):
    """Validate, return loss, accuracy, QWK, all predictions and true labels."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    all_preds = []
    all_labels = []

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

        all_preds.extend(predicted.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    qwk = quadratic_weighted_kappa(all_labels, all_preds)

    return epoch_loss, epoch_acc, qwk, np.array(all_preds), np.array(all_labels)


# ── Plotting ───────────────────────────────────────────────────────────────────
def plot_training_curves(history, output_dir):
    """Save training/validation loss and QWK curves."""
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))

    epochs = range(1, len(history["train_loss"]) + 1)

    # Loss
    axes[0].plot(epochs, history["train_loss"], "b-o", label="Train Loss", markersize=3)
    axes[0].plot(epochs, history["val_loss"], "r-o", label="Val Loss", markersize=3)
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Loss")
    axes[0].set_title("Training & Validation Loss")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Accuracy
    axes[1].plot(epochs, history["train_acc"], "b-o", label="Train Acc", markersize=3)
    axes[1].plot(epochs, history["val_acc"], "r-o", label="Val Acc", markersize=3)
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Accuracy")
    axes[1].set_title("Training & Validation Accuracy")
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    # QWK
    axes[2].plot(epochs, history["val_qwk"], "g-o", label="Val QWK", markersize=3)
    axes[2].set_xlabel("Epoch")
    axes[2].set_ylabel("Quadratic Weighted Kappa")
    axes[2].set_title("Validation QWK (Primary Metric)")
    axes[2].legend()
    axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    path = os.path.join(output_dir, "training_curves.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  📊 Training curves saved → {path}")


def plot_confusion_matrix(y_true, y_pred, output_dir):
    """Save a nice confusion matrix heatmap."""
    cm = confusion_matrix(y_true, y_pred, labels=list(range(NUM_CLASSES)))
    fig, ax = plt.subplots(figsize=(8, 7))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=CLASS_NAMES,
        yticklabels=CLASS_NAMES,
        ax=ax,
    )
    ax.set_xlabel("Predicted", fontsize=12)
    ax.set_ylabel("True", fontsize=12)
    ax.set_title("Validation Confusion Matrix", fontsize=14)
    plt.xticks(rotation=30, ha="right")
    plt.yticks(rotation=0)
    plt.tight_layout()
    path = os.path.join(output_dir, "confusion_matrix.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  📊 Confusion matrix saved → {path}")


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Train IRIS DR classification model")
    parser.add_argument(
        "--csv",
        default="/Users/vyomvarshney2005/Desktop/iris full/train.csv",
        help="Path to train.csv with id_code and diagnosis columns",
    )
    parser.add_argument(
        "--image-dir",
        default="/Users/vyomvarshney2005/Desktop/aptos2019-blindness-detection/train_images/part 6",
        help="Directory containing training PNG images",
    )
    parser.add_argument(
        "--output-dir",
        default="/Users/vyomvarshney2005/Desktop/iris full/SIH_2026_PROJECT_IRIS_REPO/model_output",
        help="Directory to save model and artifacts",
    )
    parser.add_argument("--warmup-epochs", type=int, default=5, help="Head-only training epochs")
    parser.add_argument("--finetune-epochs", type=int, default=20, help="Full fine-tune epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr-head", type=float, default=1e-3, help="Learning rate for head warmup")
    parser.add_argument("--lr-finetune", type=float, default=1e-4, help="Learning rate for fine-tuning")
    parser.add_argument("--patience", type=int, default=7, help="Early stopping patience (epochs)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    args = parser.parse_args()

    # ── Setup ──────────────────────────────────────────────────────────────
    os.makedirs(args.output_dir, exist_ok=True)
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    # Device selection: MPS (Apple Silicon) > CUDA > CPU
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        device_name = "Apple MPS (Metal)"
    elif torch.cuda.is_available():
        device = torch.device("cuda")
        device_name = torch.cuda.get_device_name(0)
    else:
        device = torch.device("cpu")
        device_name = "CPU"

    print("=" * 70)
    print("  IRIS — Diabetic Retinopathy CNN Training")
    print("=" * 70)
    print(f"  Device:       {device_name}")
    print(f"  Image dir:    {args.image_dir}")
    print(f"  CSV:          {args.csv}")
    print(f"  Output dir:   {args.output_dir}")
    print(f"  Batch size:   {args.batch_size}")
    print(f"  Warmup:       {args.warmup_epochs} epochs (lr={args.lr_head})")
    print(f"  Fine-tune:    {args.finetune_epochs} epochs (lr={args.lr_finetune})")
    print("=" * 70)

    # ── Load Data ──────────────────────────────────────────────────────────
    print("\n📂 Loading dataset...")
    df = pd.read_csv(args.csv)
    image_dir = Path(args.image_dir)

    # Filter to images that exist in the directory
    available_files = {f.stem: str(f) for f in image_dir.glob("*.png")}
    df = df[df["id_code"].isin(available_files)]
    df["image_path"] = df["id_code"].map(available_files)

    print(f"   Found {len(df)} images with labels")
    print(f"   Class distribution:")
    for cls in range(NUM_CLASSES):
        count = (df["diagnosis"] == cls).sum()
        print(f"     {CLASS_NAMES[cls]}: {count} ({100*count/len(df):.1f}%)")

    # Stratified split
    train_df, val_df = train_test_split(
        df, test_size=0.2, stratify=df["diagnosis"], random_state=args.seed
    )
    print(f"\n   Train: {len(train_df)} | Val: {len(val_df)}")

    # ── Datasets & Loaders ─────────────────────────────────────────────────
    train_dataset = RetinaDataset(
        train_df["image_path"].tolist(),
        train_df["diagnosis"].tolist(),
        transform=get_train_transforms(),
    )
    val_dataset = RetinaDataset(
        val_df["image_path"].tolist(),
        val_df["diagnosis"].tolist(),
        transform=get_val_transforms(),
    )

    # Weighted random sampler for class imbalance
    train_labels = train_df["diagnosis"].values
    class_counts = np.bincount(train_labels, minlength=NUM_CLASSES)
    class_weights = 1.0 / (class_counts + 1e-6)
    sample_weights = class_weights[train_labels]
    sampler = WeightedRandomSampler(
        weights=sample_weights, num_samples=len(sample_weights), replacement=True
    )

    train_loader = DataLoader(
        train_dataset, batch_size=args.batch_size, sampler=sampler,
        num_workers=0, pin_memory=False
    )
    val_loader = DataLoader(
        val_dataset, batch_size=args.batch_size, shuffle=False,
        num_workers=0, pin_memory=False
    )

    # ── Model ──────────────────────────────────────────────────────────────
    print("\n🏗️  Building EfficientNet-B0 model...")
    model = build_model(num_classes=NUM_CLASSES, pretrained=True)
    model = model.to(device)

    # Class-weighted loss
    weight_tensor = torch.tensor(class_weights, dtype=torch.float32).to(device)
    criterion = nn.CrossEntropyLoss(weight=weight_tensor)

    # ── Training History ───────────────────────────────────────────────────
    history = {
        "train_loss": [], "train_acc": [],
        "val_loss": [], "val_acc": [], "val_qwk": [],
    }
    best_qwk = -1.0
    patience_counter = 0
    total_epochs = args.warmup_epochs + args.finetune_epochs
    log_lines = []

    def log(msg):
        print(msg)
        log_lines.append(msg)

    start_time = time.time()

    # ── Phase 1: Head Warmup ───────────────────────────────────────────────
    log("\n" + "─" * 70)
    log("  PHASE 1: Head Warmup (backbone frozen)")
    log("─" * 70)

    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=args.lr_head, weight_decay=1e-4
    )
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.warmup_epochs)

    for epoch in range(1, args.warmup_epochs + 1):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc, val_qwk, val_preds, val_labels = validate(model, val_loader, criterion, device)
        scheduler.step()

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)
        history["val_qwk"].append(val_qwk)

        lr_now = optimizer.param_groups[0]["lr"]
        log(
            f"  Epoch {epoch:2d}/{total_epochs} | "
            f"Train Loss: {train_loss:.4f}  Acc: {train_acc:.4f} | "
            f"Val Loss: {val_loss:.4f}  Acc: {val_acc:.4f}  QWK: {val_qwk:.4f} | "
            f"LR: {lr_now:.6f}"
        )

        if val_qwk > best_qwk:
            best_qwk = val_qwk
            torch.save(model.state_dict(), os.path.join(args.output_dir, "iris_dr_model.pth"))
            log(f"  ✅ New best QWK: {best_qwk:.4f} — model saved!")
            patience_counter = 0
        else:
            patience_counter += 1

    # ── Phase 2: Full Fine-Tuning ──────────────────────────────────────────
    log("\n" + "─" * 70)
    log("  PHASE 2: Full Fine-Tuning (all layers unfrozen)")
    log("─" * 70)

    unfreeze_backbone(model)
    optimizer = optim.AdamW(model.parameters(), lr=args.lr_finetune, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.finetune_epochs)
    patience_counter = 0  # reset for phase 2

    for epoch in range(args.warmup_epochs + 1, total_epochs + 1):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc, val_qwk, val_preds, val_labels = validate(model, val_loader, criterion, device)
        scheduler.step()

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)
        history["val_qwk"].append(val_qwk)

        lr_now = optimizer.param_groups[0]["lr"]
        log(
            f"  Epoch {epoch:2d}/{total_epochs} | "
            f"Train Loss: {train_loss:.4f}  Acc: {train_acc:.4f} | "
            f"Val Loss: {val_loss:.4f}  Acc: {val_acc:.4f}  QWK: {val_qwk:.4f} | "
            f"LR: {lr_now:.6f}"
        )

        if val_qwk > best_qwk:
            best_qwk = val_qwk
            torch.save(model.state_dict(), os.path.join(args.output_dir, "iris_dr_model.pth"))
            log(f"  ✅ New best QWK: {best_qwk:.4f} — model saved!")
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= args.patience:
                log(f"\n  ⏹️  Early stopping triggered (no improvement for {args.patience} epochs)")
                break

    elapsed = time.time() - start_time
    log(f"\n  ⏱️  Total training time: {elapsed/60:.1f} minutes")

    # ── Final Evaluation ───────────────────────────────────────────────────
    log("\n" + "=" * 70)
    log("  FINAL EVALUATION")
    log("=" * 70)

    # Load best model for final eval
    model.load_state_dict(torch.load(os.path.join(args.output_dir, "iris_dr_model.pth"), map_location=device, weights_only=True))
    val_loss, val_acc, val_qwk, val_preds, val_labels = validate(model, val_loader, criterion, device)

    log(f"\n  Best Model Results:")
    log(f"    Val Accuracy:  {val_acc:.4f} ({val_acc*100:.1f}%)")
    log(f"    Val QWK:       {val_qwk:.4f}")
    log(f"    Val Loss:      {val_loss:.4f}")

    # Classification report
    report = classification_report(
        val_labels, val_preds,
        target_names=CLASS_NAMES,
        labels=list(range(NUM_CLASSES)),
        zero_division=0,
    )
    log(f"\n  Classification Report:\n{report}")

    # ── Save Artifacts ─────────────────────────────────────────────────────
    # Plots
    plot_training_curves(history, args.output_dir)
    plot_confusion_matrix(val_labels, val_preds, args.output_dir)

    # Model config JSON
    config = {
        "model_name": "iris_dr_efficientnet_b0",
        "model_architecture": "EfficientNet-B0",
        "version": "1.0.0",
        "num_classes": NUM_CLASSES,
        "class_names": CLASS_NAMES,
        "image_size": IMG_SIZE,
        "normalization": {
            "mean": IMAGENET_MEAN,
            "std": IMAGENET_STD,
        },
        "training": {
            "dataset": "APTOS 2019 Blindness Detection (part 6)",
            "total_images": len(df),
            "train_images": len(train_df),
            "val_images": len(val_df),
            "best_val_qwk": round(best_qwk, 4),
            "best_val_accuracy": round(val_acc, 4),
            "total_epochs_run": len(history["train_loss"]),
            "training_time_minutes": round(elapsed / 60, 1),
            "device": device_name,
        },
        "class_distribution": {
            CLASS_NAMES[i]: int((df["diagnosis"] == i).sum()) for i in range(NUM_CLASSES)
        },
    }
    config_path = os.path.join(args.output_dir, "model_config.json")
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    log(f"\n  📄 Model config saved → {config_path}")

    # Training log
    log_path = os.path.join(args.output_dir, "training_log.txt")
    with open(log_path, "w") as f:
        f.write("\n".join(log_lines))
    print(f"  📄 Training log saved → {log_path}")

    print("\n" + "=" * 70)
    print("  ✅ Training complete! Model saved to:")
    print(f"     {os.path.join(args.output_dir, 'iris_dr_model.pth')}")
    print("=" * 70)


if __name__ == "__main__":
    main()
