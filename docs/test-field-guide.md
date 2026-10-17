# Your controlled test workflow

The test field is a separate local workspace. Open MATHOS → **Open test field**. Switching back preserves the paused living world; the test field has its own settings, organisms and results.

## Run a prepared test and send results

1. Open **Controls** on a phone (left panel on desktop). Choose Movement & feeding, Growth & learning, Reproduction & inheritance, or Empty field. Adjust settings if needed.
2. Press **Prepare test · reset field**. This explicitly starts a new test and clears its old edits/results. The starting setup is paused at step0.
3. Press **Run prepared test**, or use **One test step**. It stops at the chosen step limit. You can pause, add food/organisms, erase, select or rotate a body while inspecting. Coordinate controls and keyboard arrows/Enter offer the same tools as tapping the canvas.
4. Open **Results**, add **My observations**, then **Copy test report**. Paste the whole copied text into the project chat. Alternatively **Save test report** and attach that JSON file. If clipboard access is unavailable, select/copy the report text shown below the buttons.

Switching workspaces or hiding the browser tab pauses playback. Press Run again to continue. A report copied before the limit is reached is a valid partial observation, not a completed test.

A test report includes actual settings, seed, preset, complete accepted edits with their steps, observed outcomes, recent errors, your notes, build identity and a final-state fingerprint. It gives the next agent a reproducible test instead of requiring a screenshot or remembered conversation. It stays local until you share it. Saving a test report differs from saving starting configuration.

## Configuration scope

| Setting | Bounds / meaning | Apply |
| --- | --- | --- |
| Seed | Whole number0–4294967295 | Prepare/reset |
| Field size | Width16–64, height16–48 cells | Prepare/reset |
| Prepared scenario | Feeding, growth, inheritance or empty | Prepare/reset |
| Food energy |1–96 units in each new patch | Live; existing patches unchanged |
| Food spawn attempts |0–8 attempts per step, not guaranteed new patches | Live |
| Upkeep |1–3 energy per developed body cell per step | Live |
| New organism energy |40–300, used for subsequently placed organisms | Live; never refills existing organisms |
| Learning | On/off | Live; freezing retains earlier weights/update count |
| Body mutation | On/off | Live; numerical trait mutation still follows engine rules |
| Test limit |1–1600 absolute steps, not below the current step | Live; increase to continue a completed test |

The first editor deliberately keeps controller equations, arbitrary executable rules and arbitrary anatomy outside its scope. Those require separately versioned contracts. It is not an unrestricted scientific-rule editor.

**Show JSON / Hide JSON** toggles the editor without losing text or changing the simulation. Valid JSON synchronizes controls; **Apply live settings** / **Apply JSON settings** changes the active test at a recorded boundary. Invalid JSON leaves the active run intact and remains editable. **Revert draft** restores active settings. Seed/dimensions/scenario changes require explicit Prepare, never an automatic reset.

**Open JSON file / Save JSON file** use the validated [schema](../schemas/test-field-v1.schema.json) and [example](../examples/test-field.v1.json). Browser save/load stores one small configuration; it never silently replaces corrupt data. Files and raw JSON cannot bypass limits. Configuration files start from0; reports reproduce by replaying, not by loading hidden live state.

## What the results mean

Population, food intake, births/deaths, body development, movement, actual learning updates and structural changes describe what happened. Detailed analytics includes resource sources, authored removals and sampled population history. The resource check means all energy is accounted for; it is not a verdict that the organisms are intelligent or improved. A completed edited test is labeled edited, not presented as the untouched prepared scenario.

Undo reverses the most recent authored edit only before the next simulation step. It does not rewind elapsed learning/evolution. Erasing organisms counts as user removal, separate from biological death; new organisms/food are explicit external inputs. Reset restores the prepared recipe and begins a new report.

## Agent: reproduce an owner's report

Save the pasted full report as a UTF-8 .txt file, or use their .json download. From the matching source/engine version:

```sh
npm run test:replay -- path/to/report.json
```

On Windows PowerShell use npm.cmd if script policy blocks npm. The parser accepts JSON or the clipboard text's JSON block, caps input at1MiB, validates the full configuration/edit recipe and rejects hash/analytics mismatches. Passing output says replay matched, actual tick and exact metrics. This uses the same production engine; it is deterministic regression evidence, not an independent scientific oracle.

First compare actual tick/status, initial settings, edits, resource check, learning updates and the owner's notes. Do not assume a partial test completed, confuse authored removals with death, or tune parameters merely because one outcome is poor. Preserve the original report as evidence and explain a concrete observed cause or the remaining uncertainty.
