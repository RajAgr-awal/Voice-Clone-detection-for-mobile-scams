
import random
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
import torch
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2Model

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "LA" / "LA"
OUT = ROOT / "data" / "embeddings"

MODEL_NAME = "facebook/wav2vec2-xls-r-300m"
SAMPLE_RATE = 16000
BATCH_SIZE = 4

# Initial test: 256 genuine + 256 spoofed per split.
# After the test works, change this to None to use every sample.
LIMIT_PER_CLASS = None

SPLITS = {
    "train": {
        "protocol": DATA / "ASVspoof2019_LA_cm_protocols"
        / "ASVspoof2019.LA.cm.train.trn.txt",
        "audio": DATA / "ASVspoof2019_LA_train" / "flac",
    },
    "dev": {
        "protocol": DATA / "ASVspoof2019_LA_cm_protocols"
        / "ASVspoof2019.LA.cm.dev.trl.txt",
        "audio": DATA / "ASVspoof2019_LA_dev" / "flac",
    },
}

random.seed(42)
OUT.mkdir(parents=True, exist_ok=True)

device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

print("Device:", device)

extractor = Wav2Vec2FeatureExtractor.from_pretrained(MODEL_NAME)
model = Wav2Vec2Model.from_pretrained(
    MODEL_NAME,
    torch_dtype=dtype,
).to(device).eval()

def read_audio(path):
    wave, sr = sf.read(path, dtype="float32")

    if wave.ndim == 2:
        wave = wave.mean(axis=1)

    if sr != SAMPLE_RATE:
        wave = librosa.resample(
            wave, orig_sr=sr, target_sr=SAMPLE_RATE
        )

    return np.asarray(wave, dtype=np.float32)

def process_split(split, info):
    rows = []

    with open(info["protocol"], "r", encoding="utf-8") as f:
        for line in f:
            fields = line.split()
            if len(fields) >= 5 and fields[-1] in ("bonafide", "spoof"):
                rows.append((fields[1], fields[-1]))

    genuine = [r for r in rows if r[1] == "bonafide"]
    spoof = [r for r in rows if r[1] == "spoof"]

    if LIMIT_PER_CLASS is not None:
        n = min(LIMIT_PER_CLASS, len(genuine), len(spoof))
        rows = random.sample(genuine, n) + random.sample(spoof, n)
    else:
        rows = genuine + spoof

    random.shuffle(rows)
    print(f"\n{split}: {len(rows)} files selected")

    all_features = []
    all_labels = []
    all_ids = []

    for start in range(0, len(rows), BATCH_SIZE):
        batch_rows = rows[start:start + BATCH_SIZE]
        waves = []
        valid_rows = []

        for utt_id, label in batch_rows:
            path = info["audio"] / f"{utt_id}.flac"

            if not path.exists():
                print("Missing audio:", path)
                continue

            wave = read_audio(path)
            if len(wave) < SAMPLE_RATE // 2:
                print("Skipping very short audio:", utt_id)
                continue

            waves.append(wave)
            valid_rows.append((utt_id, label))

        if not waves:
            continue

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

            # Intermediate XLS-R representation, layer 7.
            hidden = result.hidden_states[7]

            # Exclude padded frames from mean pooling.
            lengths = model._get_feat_extract_output_lengths(
                attention_mask.sum(dim=1)
            ).clamp(max=hidden.shape[1])

            lengths = lengths.to(hidden.device)

            for i, (utt_id, label) in enumerate(valid_rows):
                length = int(lengths[i].item())
                pooled = hidden[i, :length].float().mean(dim=0)

                all_features.append(pooled.cpu().numpy())
                all_labels.append(1 if label == "spoof" else 0)
                all_ids.append(utt_id)

        done = min(start + BATCH_SIZE, len(rows))
        if done % 100 == 0 or done == len(rows):
            print(f"  Processed {done}/{len(rows)}")

    if not all_features:
        raise RuntimeError(f"No features extracted for {split}")

    output = OUT / f"{split}_features.npz"
    np.savez_compressed(
        output,
        X=np.stack(all_features).astype(np.float32),
        y=np.asarray(all_labels, dtype=np.int64),
        ids=np.asarray(all_ids),
    )

    print("Saved:", output)
    print("Feature shape:", np.stack(all_features).shape)
    print("Genuine:", all_labels.count(0), "| Spoof:", all_labels.count(1))

for split, info in SPLITS.items():
    process_split(split, info)

print("\nFeature extraction test completed.")
