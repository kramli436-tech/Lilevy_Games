import glob
import os

files = glob.glob("scratch_*.*")
print("Found scratch files in workspace:")
for f in files:
    print(" -", f)

