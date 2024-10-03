# python3 converter.py input_file
# This will create an input_file.json. You can also pass multiple files:
# python converter.py input_file1 input_file2
# Or even:
# python converter.py folder/*

import json
import os
import sys

def list_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            yield os.path.join(root, file)

def strip_and_encode(s):
    return s.strip().encode('ISO-8859-1').decode('UTF-8')

def process_file(file):
    if os.path.isdir(file):
        print(f"{file} is a directory.")
        files = list_files(file)
    else:
        files = [file]
    
    for f in files:
        try:
            questions = []
            question = {}

            with open(f, "r", encoding='ISO-8859-1') as fh:
                lines = fh.readlines()

            i = 0
            while i < len(lines):
                line = strip_and_encode(lines[i])
                if line.startswith('#Q '):
                    question['question'] = line[3:]
                    question['category'] = os.path.basename(f)
                    i += 1
                    while i < len(lines) and not lines[i].startswith('^ '):
                        line = strip_and_encode(lines[i])
                        question['question'] += "\n" + line
                        i += 1
                    if i < len(lines):
                        line = strip_and_encode(lines[i])
                if line.startswith('^ '):
                    question['answer'] = line[2:]
                elif line[:2] in [f"{chr(c)} " for c in range(ord('A'), ord('Z') + 1)]:
                    question.setdefault('choices', []).append(line[2:])
                elif not line:
                    if question:
                        questions.append(question)
                        question = {}
                i += 1
            out_path = "format_json" + "\\" + f.split('\\')[1]+".json"
            print(out_path)
            with open(out_path, "w", encoding='UTF-8') as out_file:
                json.dump(questions, out_file, ensure_ascii=False, indent=4)
        
        except Exception as ex:
            print(ex)
            print(f"{f} failed to convert")
            continue

if __name__ == "__main__":
    for file in sys.argv[1:]:
        process_file(file)
