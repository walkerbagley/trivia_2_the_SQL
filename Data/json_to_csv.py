import json

questions_json = './questions.json'
questions_csv = './questions.tsv'
csv_content = []

csv_content.append('\t'.join(['question','difficulty','A','B','C','D','category']))

with open(questions_json, 'r') as js:
    questions = json.loads(js.readlines()[0])
    for question in questions:
        row = []
        try:
            row.append(' '.join(question['Question'].strip().split('\t')))
        except:
            row.append(' '.join(question['Questions'].strip().split('\t')))
        row.append(question['Difficulty'])
        row.append(' '.join(question['A'].strip().split('\t')))
        row.append(' '.join(question['B'].strip().split('\t')))
        try:
            row.append(' '.join(question['C'].strip().split('\t')))
        except:
            row.append('')
        try:
            row.append(' '.join(question['D'].strip().split('\t')))
        except:
            row.append('')
        row.append(' '.join(question['Category'].strip().split('\t')))
        csv_content.append('\t'.join(map(str, row)))

with open(questions_csv, 'w') as csv:
    csv.writelines('\n'.join(csv_content))