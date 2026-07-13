from datasets import load_dataset
import json
import os
from datetime import datetime

dataset = load_dataset("newfacade/LeetCodeDataset")

questions = dataset["train"]

output_dir = "dataset"
os.makedirs(output_dir, exist_ok=True)

output_path = os.path.join(output_dir, "leetcode_questions.json")

def json_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

with open(output_path, "w", encoding="utf-8") as file:
    json.dump(
        list(questions),
        file,
        ensure_ascii=False,
        indent=2,
        default=json_serializer,
    )

print(f"Dataset saved successfully at {output_path}")
print(f"Total questions: {len(questions)}")