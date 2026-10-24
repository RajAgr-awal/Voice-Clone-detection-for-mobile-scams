import torch, librosa
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2Model

MODEL = "facebook/wav2vec2-xls-r-300m"   # ~1.3 GB download the first time
device = "cuda" if torch.cuda.is_available() else "cpu"

# 1. Load audio: mono, 16,000 samples per second
wave, sr = librosa.load("test.wav", sr=16000, mono=True)
wave = wave[: 4 * 16000]                 # keep at most 4 seconds
print("samples:", wave.shape, "= seconds:", len(wave) / sr)

# 2. Prepare the audio the way the model was trained
extractor = Wav2Vec2FeatureExtractor.from_pretrained(MODEL)
inputs = extractor(wave, sampling_rate=16000, return_tensors="pt")

# 3. Load the model in half precision (smaller, fits 4 GB) and run it
dtype = torch.float16 if device == "cuda" else torch.float32
model = Wav2Vec2Model.from_pretrained(MODEL, torch_dtype=dtype).to(device).eval()
with torch.no_grad():
    out = model(inputs.input_values.to(device, dtype), output_hidden_states=True)

# 4. Look at what came out
print("layers returned:", len(out.hidden_states))
print("shape of layer 7:", tuple(out.hidden_states[7].shape))
if device == "cuda":
    print("GPU memory used (GB):", round(torch.cuda.max_memory_allocated() / 1e9, 2))