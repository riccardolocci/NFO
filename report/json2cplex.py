import json
import sys

filename = sys.argv[1]
cplexname = filename.replace('.json', '-cplex1.mod')

source = 1
targets = [6]

with open(filename) as f, open(cplexname, 'a') as cf:
    graph = json.load(f)

    dvars = ''
    of = ''
    bonds = {}

    for edge in graph['edges']:
        dvar = 'x{}{}'.format(edge['source'], edge['target'])
        dvars += 'dvar int+ {};\n'.format(dvar)

        if not of:
            of = '{} * {}'.format(edge['cost'], dvar)
        else:
            of += ' + {} * {}'.format(edge['cost'], dvar)

        if edge['source'] not in bonds:
            bonds[edge['source']] = dvar
        else:
            bonds[edge['source']] += ' + {}'.format(dvar)
        
        if edge['target'] not in bonds:
            bonds[edge['target']] = '-{}'.format(dvar)
        else:
            bonds[edge['target']] += ' - {}'.format(dvar)

    dvars += '\n'
    of += ';\n\n'

    cf.write(dvars)
    cf.write('minimize {}'.format(of))

    cf.write('subject to {\n')
    for node, bond in bonds.items():
        flow = 0
        if node == source:
            flow = len(targets) if targets else len(graph['nodes']) - 1
        if node in targets:
            flow = -1
        

        cf.write('\t{} == {};\n'.format(bond, flow))

    cf.write('}')