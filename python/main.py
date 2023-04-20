from ultralytics import YOLO
import sys

classifications = ['magnolia', 'oak', 'palm', 'pine', 'spruce', 'sycamore']

model = YOLO('python/best.pt')
results = model.predict(sys.argv[1], verbose=False, save=True)
boxes = results[0].numpy().boxes
trees = set()

for box in boxes:
  trees.add(classifications[box.cls[0].astype(int)])

final = ''
for tree in trees:
  final += tree + ','

print(final[:-1])