#!/usr/bin/env node

// Smoke test for build-fcpxml.mjs: builds from a minimal version 2 manifest (no media on disk needed) and checks the
// document structurally with string assertions plus a tiny tag-balance walk. The CLI path is exercised in manifest.test.mjs.

import assert from 'node:assert/strict';
import { buildFcpxml, rational, toFrames, FCPXML_VERSION } from './build-fcpxml.mjs';

assert.equal(rational(0, 30), '0s');
assert.equal(rational(750, 30), '750/30s');
assert.equal(toFrames(25, 30), 750);
assert.equal(toFrames(0.5, 24), 12);

const manifest = {
  version: 2,
  show: 'The Second Phone',
  episodeId: 'S01E01',
  canvas: { width: 1080, height: 1920, fps: 30 },
  clips: [
    { shotId: 'S01E01-010', localPath: 'assets/video/a.mp4', inSeconds: 0, outSeconds: 25, transitionOutSeconds: 1, audioMode: 'native', sourceSpec: { width: 720, height: 1280, fps: 30, durationSeconds: 25, hasAudio: true } },
    { shotId: 'S01E01-020', localPath: 'assets/video/b.mp4', inSeconds: 2, outSeconds: 26.5, transitionOutSeconds: 0, audioMode: 'native', sourceSpec: { width: 720, height: 1280, fps: 30, durationSeconds: 30, hasAudio: true } },
  ],
  audio: {
    music: [
      { id: 'cue-1', localPath: 'audio/cue.wav', inSeconds: 0, outSeconds: 12, timelineStartSeconds: 20, volumeKeyframes: [{ atSeconds: 20, gainDb: -30 }, { atSeconds: 22, gainDb: -12 }, { atSeconds: 31, gainDb: -40 }] },
    ],
  },
};

const { xml, summary } = buildFcpxml(manifest, { root: '/kit' });

assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<!DOCTYPE fcpxml>\n<fcpxml version="1\.11">/);
assert.equal(FCPXML_VERSION, '1.11');
assert.match(xml, /<format id="r1" name="Elegiac 1080x1920 30p" frameDuration="1\/30s" width="1080" height="1920"\/>/);
assert.match(xml, /<media-rep kind="original-media" src="file:\/\/\/kit\/assets\/video\/a\.mp4"\/>/);
assert.match(xml, /<media-rep kind="original-media" src="file:\/\/\/kit\/audio\/cue\.wav"\/>/);

// Story runtime: (25 + 24.5) - 1 s overlap = 48.5 s = 1455 frames; the dissolve is split across the cut (15 + 15 frames).
assert.equal(summary.storyDurationSeconds, 48.5);
assert.equal(summary.storyDurationFrames, 1455);
assert.match(xml, /<sequence format="r1" duration="1455\/30s" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">/);
assert.match(xml, /<asset-clip ref="r2" offset="0s" name="S01E01-010" start="0s" duration="735\/30s">/);
assert.match(xml, /<asset-clip ref="r3" offset="735\/30s" name="S01E01-020" start="75\/30s" duration="720\/30s">/);
assert.match(xml, /<transition name="Cross Dissolve" offset="720\/30s" duration="30\/30s">\s*<filter-video ref="r5" name="Cross Dissolve"\/>/);
assert.match(xml, /<effect id="r5" name="Cross Dissolve" uid="FxPlug:[0-9A-F-]+"\/>/);

// Markers at each clip start, named by shotId, in the clip's own time base.
assert.match(xml, /<marker start="0s" duration="1\/30s" value="S01E01-010"\/>/);
assert.match(xml, /<marker start="75\/30s" duration="1\/30s" value="S01E01-020"\/>/);
assert.equal(summary.markerCount, 2);

// Music lane: connected to the first clip, lane -1, role music, keyframes in clip-local time (in + (at - timelineStart)).
assert.match(xml, /<asset-clip ref="r4" lane="-1" offset="600\/30s" name="cue-1" start="0s" duration="360\/30s" audioRole="music">/);
assert.match(xml, /<adjust-volume amount="-30dB">/);
assert.match(xml, /<keyframe time="0s" value="-30dB"\/>/);
assert.match(xml, /<keyframe time="60\/30s" value="-12dB"\/>/);
assert.match(xml, /<keyframe time="330\/30s" value="-40dB"\/>/);
assert.equal(summary.musicCount, 1);

// Tag balance: every opened element closes in order (self-closing elements excluded).
const stack = [];
for (const match of xml.matchAll(/<(\/?)([A-Za-z][\w-]*)([^<>]*?)(\/?)>/g)) {
  const [, closing, tag, , selfClosing] = match;
  if (selfClosing) continue;
  if (closing) {
    assert.equal(stack.pop(), tag, `unbalanced closing tag </${tag}>`);
  } else {
    stack.push(tag);
  }
}
assert.deepEqual(stack, []);

// Escaping and refusal paths.
const escaped = buildFcpxml({ ...manifest, show: 'Tom & "Jerry" <S1>', audio: {} }, { root: '/kit' }).xml;
assert.match(escaped, /<project name="Tom &amp; &quot;Jerry&quot; &lt;S1&gt; S01E01">/);
assert.throws(() => buildFcpxml({ ...manifest, clips: [] }, { root: '/kit' }), /at least one clip/);
assert.throws(() => buildFcpxml({ ...manifest, clips: [{ ...manifest.clips[0], localPath: 'https://example.test/a.mp4' }] }, { root: '/kit' }), /frozen local file/);
assert.throws(() => buildFcpxml({ ...manifest, clips: [{ ...manifest.clips[0], localPath: '../escape.mp4' }] }, { root: '/kit' }), /escapes the declared root/);
assert.throws(() => buildFcpxml({ ...manifest, clips: [{ ...manifest.clips[0], transitionOutSeconds: 25 }, manifest.clips[1]] }, { root: '/kit' }), /shorter than the clip/);

// Explicit timeline placement is honoured and overlaps are refused.
const explicit = buildFcpxml({
  ...manifest,
  audio: {},
  clips: manifest.clips.map((clip, index) => ({ ...clip, transitionOutSeconds: 0, timelineStartSeconds: index * 30 })),
}, { root: '/kit' });
assert.match(explicit.xml, /<asset-clip ref="r3" offset="900\/30s" name="S01E01-020" start="60\/30s" duration="735\/30s">/);
assert.equal(explicit.summary.storyDurationSeconds, 54.5);
assert.throws(() => buildFcpxml({
  ...manifest,
  audio: {},
  clips: manifest.clips.map((clip) => ({ ...clip, transitionOutSeconds: 0, timelineStartSeconds: 0 })),
}, { root: '/kit' }), /overlaps the previous clip/);

// Extracted-mode clips mute their embedded audio and connect the linked native track on lane -2.
const extracted = buildFcpxml({
  ...manifest,
  audio: { native: [{ id: 'native-010', sourceShotId: 'S01E01-010', localPath: 'audio/native-010.wav', inSeconds: 0, outSeconds: 25, timelineStartSeconds: 0 }] },
  clips: [{ ...manifest.clips[0], transitionOutSeconds: 0, audioMode: 'extracted' }],
}, { root: '/kit' });
assert.match(extracted.xml, /<adjust-volume amount="-96dB"\/>/);
assert.match(extracted.xml, /<asset-clip ref="r3" lane="-2" offset="0s" name="native-010 native audio" start="0s" duration="750\/30s" audioRole="dialogue"\/>/);

console.log('build-fcpxml.test.mjs PASS');
