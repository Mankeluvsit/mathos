"""Independent linear-td@1 oracle. Standard-library integer arithmetic only.

--check compares the committed fixture; --write explicitly regenerates it.
No TypeScript imports or production-generated expected values.
"""
import json
import random
import sys
from pathlib import Path

TARGET = Path(__file__).resolve().parents[1] / 'tests/fixtures/learning-controller.v1.json'
MASK = (1 << 32) - 1


def trunc_div(n, d):
    return (1 if n >= 0 else -1) * (abs(n) // d)


def clip(n, bound):
    return max(-bound, min(bound, n))


def values(weights, features):
    return [trunc_div(sum(a * b for a, b in zip(row, features)), 64) for row in weights]


def transition(controller, event):
    weights = controller['weights']
    chosen = event['action']
    old_q = values(weights, event['input'])[chosen]
    next_q = 0 if event['nextInput'] is None else max(values(weights, event['nextInput']))
    delta = clip(256 * event['reward'] + trunc_div(3 * next_q, 4) - old_q, 16384)
    result = [list(row) for row in weights]
    if event['enabled']:
        result[chosen] = [clip(w + trunc_div(delta * x, 4096), 4096)
                          for w, x in zip(weights[chosen], event['input'])]
    return {
        'controller': {'weights': result, 'updates': controller['updates'] + int(event['enabled'])},
        'previousQ': old_q, 'nextQ': next_q, 'delta': delta,
        'changes': [a - b for a, b in zip(result[chosen], weights[chosen])],
        'updated': event['enabled'],
    }


def draw(state):
    # Model all intermediate JS bit operations explicitly in unsigned arithmetic.
    state = (state + 0x6D2B79F5) & MASK
    t = ((state ^ (state >> 15)) * (state | 1)) & MASK
    t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & MASK)) & MASK
    return state, (t ^ (t >> 14)) & MASK


def decision(controller, inputs, state):
    state, gate = draw(state)
    state, choice = draw(state)
    scores = values(controller['weights'], inputs)
    exploring = gate % 16 == 0
    return {'action': choice % 4 if exploring else scores.index(max(scores)),
            'scores': scores, 'exploring': exploring, 'rngState': state}


def generate():
    cases = []

    def add(name, weights=None, inputs=None, action=0, reward=0, next_input=None, enabled=True):
        controller = {'weights': weights or [[0] * 6 for _ in range(4)], 'updates': 0}
        event = {'input': inputs or [64, 0, 0, 0, 0, 0], 'action': action,
                 'reward': reward, 'nextInput': next_input, 'enabled': enabled}
        result = transition(controller, event)
        cases.append({'name': name, 'controller': controller, 'transition': event, 'expected': result})
        return result

    assert add('positive-reward', reward=1)['changes'] == [4, 0, 0, 0, 0, 0]
    assert add('negative-reward', reward=-1)['changes'] == [-4, 0, 0, 0, 0, 0]
    w = [[65, 0, 0, 0, 0, 0]] + [[0] * 6 for _ in range(3)]
    assert add('negative-truncation', w, [64, 1, 0, 0, 0, 0])['changes'] == [-1, 0, 0, 0, 0, 0]
    w = [[0] * 6, [100, 0, 0, 0, 0, 0], [0] * 6, [0] * 6]
    assert add('live-bootstrap', w, next_input=[64, 0, 0, 0, 0, 0])['delta'] == 75
    assert add('terminal-bootstrap', w)['delta'] == 0
    w = [[-4096] * 6] + [[0] * 6 for _ in range(3)]
    assert add('positive-delta-clamp', w, [64] * 6, reward=32)['changes'] == [256] * 6
    w = [[4096] * 6] + [[0] * 6 for _ in range(3)]
    assert add('negative-delta-clamp', w, [64] * 6, reward=-32)['changes'] == [-256] * 6
    w = [[4095, 0, 0, 0, 0, 0]] + [[0] * 6 for _ in range(3)]
    assert add('upper-weight-saturation', w, reward=32)['changes'] == [1, 0, 0, 0, 0, 0]
    w = [[-4095, 0, 0, 0, 0, 0]] + [[0] * 6 for _ in range(3)]
    assert add('lower-weight-saturation', w, reward=-32)['changes'] == [-1, 0, 0, 0, 0, 0]
    assert add('frozen-positive-reward', reward=32, enabled=False)['controller']['updates'] == 0
    w = [[-1, 0, 0, 0, 0, 0] for _ in range(4)]
    assert add('negative-bootstrap-truncation', w, next_input=[64, 0, 0, 0, 0, 0])['delta'] == 1

    # Deterministic synthetic edge coverage, not ecological experiments or tuning seeds.
    rng = random.Random(314159)
    for i in range(64):
        add(f'mixed-{i}', [[rng.randint(-4096, 4096) for _ in range(6)] for _ in range(4)],
            [64] + [rng.randint(0, 64) for _ in range(5)], action=i % 4,
            reward=rng.randint(-32, 32),
            next_input=None if i % 3 == 0 else [64] + [rng.randint(0, 64) for _ in range(5)],
            enabled=i % 5 != 0)

    decisions = []
    controller = {'weights': [[32, 768, 0, 0, 0, 0], [0, 0, 768, 0, 0, 0],
                              [0, 0, 0, 768, 0, 0], [0, 0, 0, 0, 768, 0]], 'updates': 0}
    inputs = [64, 0, 8, 0, 0, 12]
    for state in [0, 1, 2, 42, MASK] + list(range(100, 132)):
        decisions.append({'controller': controller, 'input': inputs, 'rngState': state,
                          'expected': decision(controller, inputs, state)})
    assert any(c['expected']['exploring'] for c in decisions)
    assert any(not c['expected']['exploring'] for c in decisions)
    streams = [{'seed': seed, 'id': ident,
                'expected': {'environment': seed, 'reproduction': seed ^ 0xA341316C,
                             'exploration': (seed ^ 0xC8013EA4 ^ ((ident * 0x9E3779B9) & MASK)) & MASK}}
               for seed in [0, 42, MASK] for ident in [1, 8, 256]]
    return {'algorithm': 'linear-td@1', 'oracle': 'independent-python-integer-v1',
            'cases': cases, 'decisions': decisions, 'streams': streams}


if __name__ == '__main__':
    if sys.argv[1:] not in [['--check'], ['--write']]:
        raise SystemExit('Usage: python3 scripts/learning-reference.py --check|--write')
    fixture = generate()
    # One numerical case per line keeps independent cases reviewable in a diff.
    groups = []
    for key, value in fixture.items():
        if isinstance(value, list):
            rendered = '[\n' + ',\n'.join('    ' + json.dumps(row) for row in value) + '\n  ]'
        else:
            rendered = json.dumps(value)
        groups.append('  ' + json.dumps(key) + ': ' + rendered)
    data = '{\n' + ',\n'.join(groups) + '\n}\n'
    if sys.argv[1] == '--write':
        TARGET.write_text(data, encoding='utf-8')
    elif TARGET.read_text(encoding='utf-8') != data:
        raise SystemExit('Learning reference fixture differs; inspect the contract before regeneration.')
    print('Independent learning reference: 75 update cases, 37 decisions, 9 stream derivations pass.')
