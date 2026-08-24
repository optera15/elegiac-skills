# Elegiac CLI Reference (shared)

Use the CLI only when the user explicitly asks to test or use it; MCP tools are the default
transport. All commands accept `--json`. Mutating commands take `--max-credits` (the batch cap)
and `--wait`; if `--wait` times out but a job id was returned, run `elegiac job wait "$JOB_ID"
--json` rather than starting a duplicate generation.

## Auth & account

```bash
elegiac auth login --api-base "${ELEGIAC_API_BASE:-https://elegiac.vercel.app}"
elegiac auth status --json
elegiac account status --json
```

## Discovery & reads

```bash
elegiac model list --json
elegiac model schema "$MODEL_ID" --json
elegiac production list --json
elegiac asset list --media-type image --json          # also: video, audio; add --production "$PRODUCTION_ID"
elegiac character list --production "$PRODUCTION_ID" --json
elegiac character get "$CAST_MEMBER_ID" --production "$PRODUCTION_ID" --json
elegiac style list --production "$PRODUCTION_ID" --json
elegiac style find "$LOOK_HINT" --json
elegiac style get "$STYLE_SYSTEM_ID" --json
elegiac campaign list --production "$PRODUCTION_ID" --json
elegiac campaign find "$BRAND_HINT" --json
elegiac workflow list --production "$PRODUCTION_ID" --json    # add --type campaign_pack etc.
elegiac workflow memory "$WORKFLOW_ID" --json
elegiac board list --production "$PRODUCTION_ID" --json
elegiac board get "$BOARD_ID" --production "$PRODUCTION_ID" --json
elegiac job wait "$JOB_ID" --json
```

## Quotes

```bash
elegiac generate quote --operation image --model "$MODEL_ID" --resolution 2k --max-credits "$CAP" --json
elegiac generate quote --operation video --quality-mode draft --duration 5 --max-credits "$CAP" --json
elegiac generate quote --operation audio --type speech --model "$MODEL_ID" --max-credits "$CAP" --json
```

## Generation

```bash
elegiac generate image --prompt "$PROMPT" --aspect-ratio 16:9 --resolution 2k --max-credits "$CAP" --wait --json
elegiac generate image --prompt "$PROMPT" --reference-image "$REF_URL" --resolution 2k --max-credits "$CAP" --wait --json
elegiac generate image --prompt "$PROMPT" --model "$MODEL_ID" --resolution 1k --aspect-ratio 16:9 --max-credits "$CAP" --wait --json
elegiac generate edit --image "$SOURCE_URL" --prompt "$SURGICAL_FIX" --max-credits "$CAP" --wait --json
elegiac generate video --prompt "$PROMPT" --quality-mode draft --duration 5 --max-credits "$CAP" --wait --json
elegiac generate video --prompt "$PROMPT" --model "$MODEL_ID" --duration 5 --resolution 720p --max-credits "$CAP" --wait --json
elegiac generate animate --prompt "$MOTION" --start-image "$STILL_URL" --duration 5 --max-credits "$CAP" --wait --json
elegiac generate audio --prompt "$LINE" --type speech --max-credits "$CAP" --wait --json
elegiac generate audio --prompt "$MUSIC_BRIEF" --type music --max-credits "$CAP" --wait --json     # lyria: add --model lyria-3 --lyria-endpoint clip
elegiac generate audio --prompt "$SONG_BRIEF" --type music --model minimax-music-3 --lyrics "$LYRIC_SHEET" --music-duration 180 --max-credits "$CAP" --wait --json   # full song, sung lyrics; duration is a MAX and the unused length is refunded
elegiac generate lipsync --video "$CLIP_URL" --audio "$SPEECH_URL" --max-credits "$CAP" --wait --json
```

## Storyboards

```bash
elegiac storyboard create --script "$SCENE_TEXT" --title "$TITLE" --frame-count 4 --aspect-ratio 16:9 --resolution 2k --production "$PRODUCTION_ID" --cast "$CAST_MEMBER_ID" --max-credits "$CAP" --wait --json
```

## Boards

```bash
elegiac board create --production "$PRODUCTION_ID" --name "$BOARD_NAME" --json
elegiac board add-asset "$BOARD_ID" --production "$PRODUCTION_ID" --gallery-item-id "$GALLERY_ITEM_ID" --layout grid --json
elegiac board add-workflow "$BOARD_ID" --production "$PRODUCTION_ID" --workflow "$WORKFLOW_ID" --layout storyboard --json
elegiac board from-workflow --workflow "$WORKFLOW_ID" --name "$BOARD_NAME" --json
elegiac board brainstorm --production "$PRODUCTION_ID" --name "$BOARD_NAME" --brief "$BRIEF" --json
elegiac board develop-scene --production-title "$TITLE" --board-name "$BOARD_NAME" --film-premise "$FILM_PREMISE" --scene-brief "$SCENE_BRIEF" --characters-json "$CHARACTERS_JSON" --json
elegiac board stage-scene --production "$PRODUCTION_ID" --board-name "$BOARD_NAME" --scene-brief "$SCENE_BRIEF" --characters "$NAMES" --locations "$LOCATIONS" --required-variant "Name:prop" --json
elegiac board add-roadmap "$BOARD_ID" --production "$PRODUCTION_ID" --brief "$BRIEF" --json
elegiac board add-direction "$BOARD_ID" --production "$PRODUCTION_ID" --title "$TITLE" --pitch "$PITCH" --json
elegiac board add-style "$BOARD_ID" --production "$PRODUCTION_ID" --title "$TITLE" --palette "$COLORS" --keywords "$KEYWORDS" --json
elegiac board add-character-concept "$BOARD_ID" --production "$PRODUCTION_ID" --name "$NAME" --role lead --json
elegiac board add-location-concept "$BOARD_ID" --production "$PRODUCTION_ID" --title "$LOCATION" --logline "$LOOK_AND_FUNCTION" --json
elegiac board promote-character "$BOARD_ID" --production "$PRODUCTION_ID" --item "$ITEM_ID" --json
elegiac board promote-style "$BOARD_ID" --production "$PRODUCTION_ID" --item "$ITEM_ID" --json
elegiac board create-character "$BOARD_ID" --production "$PRODUCTION_ID" --name "$NAME" --description "$DESCRIPTION" --max-credits "$CAP" --wait --json
elegiac board make-character-consistent "$BOARD_ID" --production "$PRODUCTION_ID" --item "$CHARACTER_ITEM_ID" --max-credits "$CAP" --wait --json
elegiac board character-variation "$BOARD_ID" --production "$PRODUCTION_ID" --item "$CONSISTENT_CHARACTER_ITEM_ID" --variation "$VARIATION" --label "$LABEL" --max-credits "$CAP" --wait --json
elegiac board storyboard "$BOARD_ID" --production "$PRODUCTION_ID" --scene "$SCENE_BRIEF" --frame-count 4 --wait --json
elegiac board animate-frame "$BOARD_ID" --production "$PRODUCTION_ID" --item "$FRAME_ITEM_ID" --prompt "$MOTION_PROMPT" --wait --json
elegiac board archive "$BOARD_ID" --production "$PRODUCTION_ID" --json   # only after explicit per-item confirmation
elegiac board restore "$BOARD_ID" --production "$PRODUCTION_ID" --json
```

## Characters (cast)

```bash
elegiac production create --name "$TITLE" --description "$LOGLINE" --tags "$GENRE" --json
elegiac character create --production "$PRODUCTION_ID" --name "$NAME" --role lead --gallery-item-ids "$GALLERY_ITEM_ID" --notes "$NOTES" --json
elegiac character from-assets --production "$PRODUCTION_ID" --gallery-item-ids "$GALLERY_ITEM_ID" --name "$NAME" --role lead --notes "$NOTES" --json
elegiac character from-assets --production "$PRODUCTION_ID" --cast-member-id "$CAST_MEMBER_ID" --production-gallery-item-ids "$PRODUCTION_GALLERY_ITEM_ID" --notes "$NOTES" --json
elegiac character prepare-from-assets --production "$PRODUCTION_ID" --gallery-item-ids "$GALLERY_ITEM_ID" --name "$NAME" --role lead --generate-starter-reference --reference-type starter_identity_sheet --resolution 2k --max-credits "$CAP" --wait --json
elegiac character update "$CAST_MEMBER_ID" --production "$PRODUCTION_ID" --notes "$NOTES" --json
elegiac character update-bible "$CAST_MEMBER_ID" --production "$PRODUCTION_ID" --bible-json "$BIBLE_JSON" --rights-json "$RIGHTS_JSON" --provenance-json "$PROVENANCE_JSON" --json
elegiac character add-reference "$CAST_MEMBER_ID" --production "$PRODUCTION_ID" --gallery-item-id "$GALLERY_ITEM_ID" --json
elegiac character reference "$CAST_MEMBER_ID" --production "$PRODUCTION_ID" --reference-type starter_identity_sheet --resolution 2k --max-credits "$CAP" --wait --json
elegiac character variants "$CAST_MEMBER_ID" --production "$PRODUCTION_ID" --variant-types portrait,profile,wardrobe,pose --resolution 2k --max-credits "$CAP" --wait --json
elegiac character retry-variant --workflow "$WORKFLOW_ID" --frame-index 4 --wait --json
elegiac character promote-variant "$CAST_MEMBER_ID" --production "$PRODUCTION_ID" --workflow "$WORKFLOW_ID" --frame-index 1 --gallery-item-id "$GALLERY_ITEM_ID" --json
elegiac character archive "$CAST_MEMBER_ID" --production "$PRODUCTION_ID" --json   # only after explicit per-item confirmation
elegiac character restore "$CAST_MEMBER_ID" --production "$PRODUCTION_ID" --json
```

## Style systems

```bash
elegiac style create --title "$TITLE" --production "$PRODUCTION_ID" --visual-rules "$VISUAL_RULES" --json
elegiac style archive "$STYLE_SYSTEM_ID" --json   # only after explicit per-item confirmation
elegiac style restore "$STYLE_SYSTEM_ID" --json
```

## Campaigns

```bash
elegiac campaign brief --campaign-hint "$CAMPAIGN" --objective "$OBJECTIVE" --json
elegiac campaign plan --campaign-hint "$CAMPAIGN" --objective "$OBJECTIVE" --target-channels meta,tiktok --max-credits "$CAP" --json
elegiac campaign execute-plan "$PLAN_ID" --wait --json
elegiac campaign continue "$CAMPAIGN_ID" --brief "$NEXT_BRIEF" --max-credits "$CAP" --wait --json
elegiac campaign create-pack --brief "$CAMPAIGN_BRIEF" --production "$PRODUCTION_ID" --cast "$CAST_MEMBER_ID" --deliverable-count 4 --resolution 2k --max-credits "$CAP" --wait --json
elegiac campaign create-pack --brief "$CAMPAIGN_BRIEF" --production "$PRODUCTION_ID" --deliverables-json "$DELIVERABLES_JSON" --resolution 2k --quality-mode draft --max-credits "$CAP" --wait --json
```

## Export

```bash
elegiac export pack --board "$BOARD_ID" --production "$PRODUCTION_ID" --output-dir ./deliverables --json
elegiac export pack --campaign "$CAMPAIGN_ID" --output-dir ./deliverables --json
```

Production-kit export/sync/push commands live in the `elegiac-production-kit` skill.
