import numpy as np, librosa, soundfile as sf

def phone_sim(wave16k):
    # 1. 16 kHz -> 8 kHz: drops everything above 4 kHz, like a phone line
    w8 = librosa.resample(wave16k, orig_sr=16000, target_sr=8000)
    # 2. mu-law squeeze to 8 bits (an approximation of the G.711 codec)
    mu = 255.0
    w8 = np.clip(w8, -1, 1)
    comp = np.sign(w8) * np.log1p(mu * np.abs(w8)) / np.log1p(mu)
    q = np.round((comp + 1) / 2 * 255)
    comp_q = q / 255 * 2 - 1
    w8 = np.sign(comp_q) * np.expm1(np.log1p(mu) * np.abs(comp_q)) / mu
    # 3. back to 16 kHz, because XLS-R needs 16 kHz
    return librosa.resample(w8.astype(np.float32), orig_sr=8000, target_sr=16000)

wave, _ = librosa.load("test.wav", sr=16000, mono=True)
out = phone_sim(wave)
sf.write("test_phone.wav", out, 16000)
print("wrote test_phone.wav,", len(out) / 16000, "seconds")