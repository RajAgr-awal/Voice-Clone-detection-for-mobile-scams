import numpy as np, soundfile as sf
sr = 16000
t = np.linspace(0, 3, 3 * sr, endpoint=False)
tone = 0.3 * np.sin(2 * np.pi * 220 * t)
sf.write("test.wav", tone, sr)
print("wrote test.wav")