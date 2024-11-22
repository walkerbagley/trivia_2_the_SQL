with open('facts.txt','r',encoding='utf-8') as fh:
    data = fh.readlines()
    with open('list.txt','w') as ofh:
        ofh.write('facts = [\n')
        for line in data:
            line = line.replace("'","").strip()
            ofh.write(f"    '{line}',\n")
        ofh.write("]\n")