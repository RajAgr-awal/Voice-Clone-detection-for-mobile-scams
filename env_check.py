import platform, sys
print("Python:", sys.version.split()[0], "|", platform.platform())

import torch, psutil
print("torch:", torch.__version__)
print("GPU available:", torch.cuda.is_available())
if torch.cuda.is_available():
    p = torch.cuda.get_device_properties(0)
    print("GPU:", p.name, f"| VRAM: {p.total_memory/1e9:.1f} GB")
print(f"RAM: {psutil.virtual_memory().total/1e9:.1f} GB")