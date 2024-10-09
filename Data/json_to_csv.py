import json

questions_json = './questions.json'
questions_csv = './questions.csv'
csv_content = []

with open(questions_json, 'r') as js:
    questions = json.loads(js.readlines()[0])
    for question in questions:
        row = []
        try:
            row.append(question['Question'].strip())
        except:
            row.append(question['Questions'].strip())
        row.append(question['Difficulty'])
        row.append(question['A'].strip())
        row.append(question['B'].strip())
        row.append(question['C'].strip())
        row.append(question['D'].strip())
        row.append(question['Category'].strip())
        csv_content.append(','.join(map(str, row)))

with open(questions_csv, 'w') as csv:
    csv.writelines('\n'.join(csv_content))