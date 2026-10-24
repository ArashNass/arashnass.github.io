# The score

Each labour has its own music in its own dastgah. The music is made of three stems that loop together and are mixed live while you play. Each boss has its own theme, and five short stings mark the big moments. Everything is optional and can be added one piece at a time. Until a piece's files are in `assets/music` and switched on in `game.js`, the game plays what it played before.

## How it plays

| Moment | What sounds |
| --- | --- |
| Menus, map, story scenes, pause | `menu.m4a` (unchanged) |
| Walking a labour | `k{n}-bed` + `k{n}-melody` |
| A foe that can reach Rostam within about 10 tiles, or the Arzhang horde | `k{n}-drums` fades in within half a second; the melody drops to 45%. The drums stay for 4 s after the last foe leaves, then fade out over a few seconds |
| Boss fight | `k{n}-boss`, restarted from the top each fight |
| Boss appears, boss falls, Rostam falls, feather found, sacred fire lit | `sting-boss`, `sting-victory`, `sting-fall`, `sting-feather`, `sting-fire`, with the music ducked underneath |

When the player pauses or opens a menu and then returns, the labour's stems resume from where they stopped.

Until the recordings exist, `boss` and `fall` play short phrases synthesised in code (a daf roll, and a falling line on the tar). `victory`, `feather` and `fire` play the effects they had before.

## Switching a piece on

In `game.js`:

- **Stems:** set `stems: true` on the labour in `SCORE` once `k{n}-bed.m4a`, `k{n}-melody.m4a` and `k{n}-drums.m4a` are all in `assets/music`.
- **Boss theme:** set `theme: true` once `k{n}-boss.m4a` is there.
- **Stings:** set `rec: true` on the sting in `STINGS` once `sting-{name}.m4a` is there.
- **Levels:** adjust `vol` (stems), `boss` (boss theme) and the sting `vol` by ear against the narration and effects.
- **Cache:** after replacing any audio file, bump `V`.

If a file fails to load, the game falls back to the old shared track instead of going silent.

## File specification

- **Format:** AAC in `.m4a`, 44.1 kHz stereo, about 160 kbps. Normalise to about −16 LUFS integrated, and the stings to about −14 LUFS.
- **Exact lengths:** the three stems of a labour must be exactly the same length and must loop seamlessly on a bar line. 60–90 s is the target length: the stems are decoded into memory, so long files cost a lot of RAM on phones.
- **Encoder padding:** if the encoder adds silence at the start or end, set `loop: [start, end]` in seconds on the labour in `SCORE`.
- **Stem roles:**
  - The bed carries the drone, pads and bass, and must hold up on its own.
  - The melody carries the lead instruments.
  - The drums carry all the percussion.
  - Each stem must work alone and in each of the two mixes (road: bed + melody; fight: bed + 45% melody + drums).
- **Boss themes:** 90–150 s, looping. They play as one file, so they need no stems.
- **Stings:** 1.5–3 s, ending in a natural ring-out, with no silence at the start.

## Workflow

1. **Generate:** generate the full fight-intensity version of the labour (everything playing) with the prompt below. ElevenLabs Music, which the game already uses for narration, or Suno both work. Ask for an instrumental with no vocals.
2. **Split:** use the tool's own stem export if it has one. Otherwise run a separator such as Demucs (`htdemucs_6s`):
   - drums → `drums`
   - other / guitar / piano → `melody`
   - bass and the remainder → `bed`
   
   Check each stem alone. A clean bed matters most.
3. **Trim:** in Audacity, trim all three stems to the same whole number of bars. Crossfade the loop point by 10–20 ms if it clicks.
4. **Encode and enable:** export as `.m4a`, then switch the piece on in `SCORE` and listen in game: walk, then fight, then walk again.

Generated music varies a lot from run to run. Expect to make several takes per labour and keep the best one.

## Prompts

Use the shared style line for every piece. Then add the labour's own prompt.

**Shared style line:** *Instrumental Persian classical and folk music for an epic video game based on Ferdowsi's Shahnameh. Real acoustic instruments, intimate and cinematic, recorded in a warm stone hall. No vocals, no Western orchestra, no electronic beats, no EDM risers. Seamless loop.*

### Labour I: The Lion of the Reeds, in dastgah Shur, 72 BPM

*Night in a reed marsh under a full moon. Rostam sleeps while his horse Rakhsh grazes, and a lion watches from the reeds. Dastgah Shur in D. A low tanbur drone and a soft bowed kamancheh pad. A breathy ney melody that pauses and listens. Sparse santur notes like fireflies. In the fight sections, a steady daf in 6/8 with tombak accents, tense but not frantic. Mood: hushed, watchful, beautiful and dangerous.*

### Labour II: The Burning Desert, in Avaz-e Dashti, 80 BPM

*An endless desert at midday: no water, no shade, heat shimmer. Avaz-e Dashti, a mournful mode of the Persian folk tradition. A long solo ney line over a deep drone. A dry, sparse tar plucking a few repeated notes like footsteps. Wind and silence between phrases. In the fight sections, a dry tombak and frame drum pulse, with the kamancheh rising in thirst and desperation. Mood: parched, lonely, hypnotic, yearning.*

### Labour III: The Dragon's Night, in dastgah Segah, 66 BPM

*Pitch-black night. A dragon eighty cubits long hunts unseen, and only the horse can sense it. Dastgah Segah with its koron intervals. A low bowed kamancheh, sul ponticello and unsettling. Deep bass drones. A santur struck softly and played tremolo. Long silences. In the fight sections, heavy, slow tombak and booming low drums like great footsteps, with a dissonant ney cry. Mood: dread, darkness, something enormous moving nearby.*

### Labour IV: The Witch's Garden, in Avaz-e Bayat-e Esfahan, 88 BPM

*A lush enchanted garden with a feast laid out. A beautiful lady pours wine, but she is a witch. Avaz-e Bayat-e Esfahan. A sweet, seductive santur melody and a lyrical kamancheh. A gentle tar accompaniment, almost a love song, with a faint wrongness underneath: a slightly detuned drone and bending notes. In the fight sections, the dance turns sinister with a fast daf in 6/8, sharp tombak, and the santur in tremolo. Mood: enchanting, sweet, deceptive.*

### Labour V: The Marches of Olad, in dastgah Chahargah, 96 BPM

*Riding hard across guarded borderlands after the warden Olad. Dastgah Chahargah, bold and heroic. A galloping tar ostinato in 6/8 like horse hooves. A strong kamancheh melody and santur flourishes. In the fight sections, driving daf and tombak with call-and-response accents, like a zurkhaneh workout. Mood: heroic, proud, in motion, a chase on horseback.*

### Labour VI: Arzhang's War Camp, in Chahargah (martial), 104 BPM

*The gates of Mazandaran: a war camp of demons, war drums pounding. Martial Chahargah. A naqareh and dohol war-drum band and a sorna (shawm) blaring a fierce motif. Low tar and kamancheh riffs. For the bed: a relentless low drone and a distant camp ambience. In the fight sections, massed war drums at full force. Mood: menace, siege, battle frenzy.*

### Labour VII: The White Div's Cave, in dastgah Homayoun, 60 BPM

*Beyond seven mountains, a frozen cave as dark as night where the White Div waits. Dastgah Homayoun, grave and majestic. A very low kamancheh drone and a deep ney like wind in ice. A santur with long reverb like dripping icicles. Hushed, cold and vast. In the fight sections, slow, massive frame drums and rising kamancheh tension, approaching the final battle. Mood: cold, awe, fate, the last trial.*

### Boss themes, 90–150 s, looping

Each starts at full intensity with no slow intro, in the same dastgah as its labour.

- **`k1-boss` The Lion:** a fierce daf and tombak duel at 132 BPM in 6/8. The kamancheh snarls, and the ney screams on the accents. Wild, primal, a predator's charge.
- **`k2-boss` The Scorpion Queen (Dashti):** a hypnotic, venomous 7/8 groove on tombak and riq, with a snaking ney and kamancheh line that coils and strikes. Sand and poison.
- **`k3-boss` The Dragon (Segah):** colossal low drums and dissonant brass-like sorna blasts. A kamancheh tremolo like fire, ponderous then explosive. A monster of legend.
- **`k4-boss` The Witch Unmasked (Bayat-e Esfahan):** the garden's love song turned inside out. A frantic santur in tremolo, a shrieking kamancheh and a fast 6/8 daf. Twisted, dizzying.
- **`k5-boss` Olad's Duel (Chahargah):** a noble one-on-one duel at a gallop, with a heroic kamancheh melody over a pounding daf. A rival, not a monster.
- **`k6-boss` Arzhang Div (martial Chahargah):** the war band at full fury: sorna, naqareh, dohol and massed tombak at 120 BPM. Brutal, triumphant, demonic.
- **`k7-boss` The White Div (Homayoun):** the final battle, grand and tragic. A massed kamancheh, a ney cry, the deepest drums and a santur in tremolo, at 108 BPM. The climax of the whole journey.

### Stings

- **`sting-boss`:** a rising daf roll into a single huge low drum hit and a kamancheh slide down. 2.5 s.
- **`sting-victory`:** a triumphant phrase in dastgah Mahur on santur and tar, ending on a sustained chord with a final daf hit. 3 s.
- **`sting-fall`:** a slow descending phrase on solo tar in Shur, ending unresolved, with a soft low drum. 2.5 s.
- **`sting-feather`:** a shimmering santur glissando upward and a high ney note, magical. 1.5 s.
- **`sting-fire`:** a warm tar arpeggio and a soft daf, a sense of safety and rest. 1.2 s.

### Menu theme

If you replace `menu.m4a`, keep the same file name. Suggested prompt:

*A Persian minstrel at court about to tell an ancient tale. A solo tar improvisation in dastgah Mahur, then a gentle santur and kamancheh join. Noble, nostalgic, inviting. 2 minutes, loopable.*
