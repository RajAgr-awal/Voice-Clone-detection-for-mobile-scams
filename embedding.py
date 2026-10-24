
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
import torch
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2Model

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "LA" / "LA"
OUT = ROOT / "data" / "embeddings" / "eval_features.npz"

MODEL_NAME = "facebook/wav2vec2-xls-r-300m"
SAMPLE_RATE = 16000
BATCH_SIZE = 4

protocol = (
    DATA / "ASVspoof2019_LA_cm_protocols"
    / "ASVspoof2019.LA.cm.eval.trl.txt"
)
audio_dir = DATA / "ASVspoof2019_LA_eval" / "flac"

device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

print("Device:", device)

rows = []
with open(protocol, "r", encoding="utf-8") as f:
    for line in f:
        fields = line.split()
        if len(fields) >= 5 and fields[-1] in ("bonafide", "spoof"):
            rows.append((fields[1], fields[-1]))

print("Evaluation protocol rows:", len(rows))
print("Genuine:", sum(label == "bonafide" for _, label in rows))
print("Spoof:", sum(label == "spoof" for _, label in rows))

extractor = Wav2Vec2FeatureExtractor.from_pretrained(MODEL_NAME)
model = Wav2Vec2Model.from_pretrained(
    MODEL_NAME, torch_dtype=dtype
).to(device).eval()

features, labels, ids = [], [], []

for start in range(0, len(rows), BATCH_SIZE):
    batch = rows[start:start + BATCH_SIZE]
    waves, valid = [], []

    for utt_id, label in batch:
        path = audio_dir / f"{utt_id}.flac"
        if not path.exists():
            print("Missing:", path)
            continue

        wave, sr = sf.read(path, dtype="float32")
        if wave.ndim == 2:
            wave = wave.mean(axis=1)
        if sr != SAMPLE_RATE:
            wave = librosa.resample(
                wave, orig_sr=sr, target_sr=SAMPLE_RATE
            )
        if len(wave) < SAMPLE_RATE // 2:
            print("Skipping short audio:", utt_id)
            continue

        waves.append(np.asarray(wave, dtype=np.float32))
        valid.append((utt_id, label))

    if waves:
        inputs = extractor(
            waves,
            sampling_rate=SAMPLE_RATE,
            padding=True,
            return_attention_mask=True,
            return_tensors="pt",
        )
        input_values = inputs.input_values.to(device, dtype=dtype)
        attention_mask = inputs.attention_mask.to(device)

        with torch.inference_mode():
            result = model(
                input_values,
                attention_mask=attention_mask,
                output_hidden_states=True,
            )
            hidden = result.hidden_states[7]
            lengths = model._get_feat_extract_output_lengths(
                attention_mask.sum(dim=1)
            ).clamp(max=hidden.shape[1])

            for i, (utt_id, label) in enumerate(valid):
                length = int(lengths[i].item())
                pooled = hidden[i, :length].float().mean(dim=0)
                features.append(pooled.cpu().numpy())
                labels.append(1 if label == "spoof" else 0)
                ids.append(utt_id)

    done = min(start + BATCH_SIZE, len(rows))
    if done % 100 == 0 or done == len(rows):
        print(f"Processed {done}/{len(rows)}")

if not features:
    raise RuntimeError("No evaluation features were extracted.")

OUT.parent.mkdir(parents=True, exist_ok=True)
np.savez_compressed(
    OUT,
    X=np.stack(features).astype(np.float32),
    y=np.asarray(labels, dtype=np.int64),
    ids=np.asarray(ids),
)

print("Saved:", OUT)
print("Feature shape:", np.stack(features).shape)
print("Genuine:", labels.count(0), "| Spoof:", labels.count(1))
print("Evaluation feature extraction completed.")
