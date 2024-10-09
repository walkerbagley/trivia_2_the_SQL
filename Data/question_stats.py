import json

path = "questions.json"


categories = set()
attributes = set()
with open(path,"r") as fh:
    qs = json.load(fh)
    for q in qs:
        categories.add(q['Category'])
        for a in q["Attributes"]:
            attributes.add(a)
print(f"Number of questions: {len(qs)}")
print("Categories:")
print(categories)
print("Attributes:")
print(attributes)