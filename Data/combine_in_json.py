import json, os
import csv

out_path = "questions.json"
custom_path = "custom_questions.json"
categories_path = "format_csv/"

# newest and hobbies should be reclassified
# entertainment needs to have subcategories added
# brain-teasers will most likely not be used
# tv, music, and movies are attributes of entertainment category
# religion is under pop culture?
categories = {"humanities", "general", "pop culture", "entertainment", "history", "stem", "world", "brain-teasers", "kids", "hobbies", "sports", "newest", "religion"}
translate_categories = {
    "eng_lit":"humanities",
    "literature":"humanities",
    "gen":"general",
    "pc":"pop culture",
    "hist":"history",
    "science-technology":"stem",
    "television":"tv",
    "celebrities":"pop culture",
    "people":"pop culture",
    "movies":"entertainment",
    "rated":"entertainment",
    "geography":"world",
    "animals":"stem",
    "tv":"entertainment",
    "video-games":"entertainment",
    "for-kids":"kids",
    "music":"entertainment", 
    "religion-faith":"religion",
}
translate_attributes = {
    "eng_lit" : "literature",
    "television":"tv"
}
no_attributes = {"science-technology","pc", "hist", "gen", "rated","for-kids","religion-faith"}


def transform_json_question(question_dict):
    """
    Transforms a dictionary of question details into the desired format.
    """
    q = {
        "Difficulty": question_dict['difficulty'],
        "Question": question_dict['question'],
        "A": question_dict['a'],
        "B": question_dict['d1'],
        "C": question_dict['d2'],
        "D": question_dict['d3']
    }
    # attributes
    if "attributes" in question_dict:
        q["Attributes"]=question_dict["attributes"]
    else:
        q["Attributes"]=[]
    # category
    if question_dict['category'] in categories:
        q["Category"] = question_dict['category']
    elif question_dict['category'] in translate_categories:
        q["Category"] = translate_categories[question_dict['category']]
        if question_dict['category'] not in no_attributes:
            if question_dict['category'] in translate_attributes:
                q["Attributes"].append(translate_attributes[question_dict['category']])
            else:
                q["Attributes"].append(question_dict['category'])
    else:
        print(question_dict['category'])
        q["Category"] = question_dict['category']

    return q

def transform_csv_question(row):
    q = {
        "Questions": row[1],
        "A": row[2],
        "Difficulty": int(row[8]),
        "Attributes": []
    }
    if row[7] in categories:
        q["Category"] = row[7]
    elif row[7] in translate_categories:
        q["Category"] = translate_categories[row[7]]
        if row[7] not in no_attributes:
            if row[7] in translate_attributes:
                q["Attributes"].append(translate_attributes[row[7]])
            else:
                q["Attributes"].append(row[7])
    else:
        print(row[7])
        q["Category"] = row[7]


    options = []
    for i in row[3:7]:
        if i == row[1]:
            continue
        options.append(i)
    q["B"] = options[0]
    q["C"] = options[1]
    q["D"] = options[2]
    return q


questions = []
with open(custom_path, "r") as ifh:
    raw_qs = json.load(ifh)
    for q in raw_qs:
        questions.append(transform_json_question(q))
for root, dirs, files in os.walk(categories_path):
    for file in files:
        with open(categories_path+file, mode='r', encoding="utf-8") as ifh:
            csv_reader = csv.reader(ifh)
            for row in csv_reader:
                if not row[0]:
                    continue
                questions.append(transform_csv_question(row))

with open(out_path, "w+") as ofh:
    json.dump(questions, ofh)