#!/usr/bin/env python3
"""
compress_media.py

Batch-compress images and videos for web use.
Images → WebP (or JPEG) via Pillow.
Videos → MP4 (H.264) via ffmpeg.

Usage:
    python compress_media.py \
        --input-dir ./raw_media \
        --output-dir ./compressed_media \
        --img-quality 75 \
        --max-img-dim 1920 \
        --video-crf 23 \
        --max-video-dim 1280
"""

import os
import sys
import argparse
import logging
import subprocess
from pathlib import Path
from PIL import Image
from tqdm import tqdm

SUPPORTED_IMAGES = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'}
SUPPORTED_VIDEOS = {'.mp4', '.mov', '.avi', '.mkv', '.webm'}


def compress_image(src_path: Path, dest_path: Path, quality: int, max_dim: int, to_webp: bool):
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src_path) as img:
        # resize if too large
        img.thumbnail((max_dim, max_dim), Image.LANCZOS)
        fmt = 'WEBP' if to_webp else 'JPEG'
        save_kwargs = {'quality': quality}
        if to_webp:
            save_kwargs['method'] = 6
        else:
            save_kwargs['optimize'] = True

        img.save(dest_path.with_suffix('.webp' if to_webp else '.jpg'), fmt, **save_kwargs)


def compress_video(src_path: Path, dest_path: Path, crf: int, max_dim: int):
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    # build scale filter to maintain aspect ratio
    scale_filter = f"scale='min({max_dim},iw)':-2"
    cmd = [
        'ffmpeg',
        '-i', str(src_path),
        '-vf', scale_filter,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', str(crf),
        '-c:a', 'aac',
        '-b:a', '128k',
        '-y',  # overwrite
        str(dest_path.with_suffix('.mp4'))
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main(args):
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    in_dir = Path(args.input_dir)
    out_dir = Path(args.output_dir)

    all_files = list(in_dir.rglob('*'))
    for src in tqdm(all_files, desc="Processing media"):
        if src.is_dir():
            continue
        rel = src.relative_to(in_dir)
        ext = src.suffix.lower()
        try:
            if ext in SUPPORTED_IMAGES:
                # decide output extension
                to_webp = args.to_webp
                dest = out_dir / rel
                if to_webp:
                    dest = dest.with_suffix('.webp')
                else:
                    dest = dest.with_suffix('.jpg')
                if dest.exists():
                    continue
                compress_image(src, dest, args.img_quality, args.max_img_dim, to_webp)
            elif ext in SUPPORTED_VIDEOS:
                dest = out_dir / rel
                dest = dest.with_suffix('.mp4')
                if dest.exists():
                    continue
                compress_video(src, dest, args.video_crf, args.max_video_dim)
            else:
                logging.debug(f"Skipping unsupported file: {src}")
        except Exception as e:
            logging.error(f"Failed to process {src}: {e}")

    logging.info("All done!")


if name == 'main':
    p = argparse.ArgumentParser(description="Compress images and videos for web.")
    p.add_argument('--input-dir',  '-i', required=True, help="Source folder of raw media")
    p.add_argument('--output-dir', '-o', required=True, help="Destination folder for compressed media")
    p.add_argument('--img-quality', type=int, default=75, help="Image quality (0–100)")
    p.add_argument('--max-img-dim', type=int, default=1920, help="Max width/height for images")
    p.add_argument('--to-webp',     action='store_true', help="Convert images to WebP (else JPEG)")
    p.add_argument('--video-crf',   type=int, default=23, help="FFmpeg CRF for video (lower→better quality)")
    p.add_argument('--max-video-dim', type=int, default=1280, help="Max width for videos (height auto)")
    args = p.parse_args()
    main(args)