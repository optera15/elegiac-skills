#!/usr/bin/env bash
# LAST RESORT ONLY (see references/production-pipeline.md, stage 4).
# Pad (or trim) a dialogue stem to a clip's whole-second length, without the model ever reading
# audio bytes into its context.
#
# The default fix for a length mismatch is to generate the CLIP longer, not to pad the stem:
# audio longer than picture makes VEED run the picture backwards, and padding is how that happens.
# Reach for this only when an approved clip cannot be regenerated and its stem is shorter than it.
#
#   pad-stem.sh <stem.mp3> <clipSeconds> <out.mp3> [--lead 0.25] [--serve-base https://host/path]
#
# Writes <out.mp3> (44.1 kHz mono, 128 kbps, silence lead then the stem then silence to clipSeconds)
# and <out.mp3>.upload.json describing how to register it:
#   - with --serve-base, the JSON carries a mediaUrl for upload_asset (preferred: no base64 anywhere);
#   - otherwise it carries the local path and size, and the recommendation to use
#     sync-lipsync-v2-pro with syncMode for that cut rather than pushing base64 through the model.
# The original stem stays untouched: the edit uses the original, the padded copy only drives lipsync.
set -euo pipefail

if [ $# -lt 3 ]; then
  echo "usage: pad-stem.sh <stem> <clipSeconds> <out> [--lead 0.25] [--serve-base <url>]" >&2
  exit 2
fi
STEM="$1"; CLIP="$2"; OUT="$3"; shift 3
LEAD=0.25; SERVE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --lead) LEAD="$2"; shift 2 ;;
    --serve-base) SERVE="${2%/}"; shift 2 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

command -v ffmpeg >/dev/null || { echo "ffmpeg is required" >&2; exit 1; }
command -v ffprobe >/dev/null || { echo "ffprobe is required" >&2; exit 1; }

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$STEM")
# leading-silence trim so the first phoneme lands at LEAD seconds
ffmpeg -v error -y -i "$STEM" \
  -af "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,adelay=$(python3 -c "print(int(round(float('$LEAD')*1000)))")|$(python3 -c "print(int(round(float('$LEAD')*1000)))"),apad=whole_dur=${CLIP},atrim=0:${CLIP}" \
  -ac 1 -ar 44100 -b:a 128k "$OUT"
PADDED=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
BYTES=$(wc -c < "$OUT" | tr -d ' ')
NAME=$(basename "$OUT")

if [ -n "$SERVE" ]; then
  cat > "$OUT.upload.json" <<EOF
{
  "tool": "upload_asset",
  "args": { "mediaUrl": "$SERVE/$NAME", "fileName": "$NAME", "mediaType": "audio/mpeg" },
  "stemSeconds": $DUR,
  "clipSeconds": $CLIP,
  "paddedSeconds": $PADDED,
  "bytes": $BYTES
}
EOF
  echo "padded $NAME: stem ${DUR}s -> ${PADDED}s (clip ${CLIP}s); upload by URL: $SERVE/$NAME"
else
  cat > "$OUT.upload.json" <<EOF
{
  "tool": "upload_asset",
  "note": "no --serve-base given: host this file and pass mediaUrl, or use sync-lipsync-v2-pro with syncMode for this cut. Do not Read this audio into the model context as base64.",
  "localPath": "$OUT",
  "stemSeconds": $DUR,
  "clipSeconds": $CLIP,
  "paddedSeconds": $PADDED,
  "bytes": $BYTES
}
EOF
  echo "padded $NAME: stem ${DUR}s -> ${PADDED}s (clip ${CLIP}s); no host given, see $OUT.upload.json"
fi
