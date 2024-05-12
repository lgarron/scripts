#!/usr/bin/env bun

import { rename } from "node:fs/promises";
import { exit } from "node:process";
import { parseArgs } from "node:util";
import { $, file, spawn } from "bun";

const { values: options, positionals } = parseArgs({
  options: { quality: { type: "string", default: "70" } },
  allowPositionals: true,
});

if (positionals.length < 1) {
  console.error("Pass a file!");
  exit(1);
}
let quality: number;
try {
  quality = parseInt(options.quality);
} catch {
  console.error("Invalid `--quality` argument.");
  exit(1);
}
const inputFile = positionals[0];

interface FFprobeStream {
  codec_type: "video" | "audio" | string;
  codec_name: string;
  pix_fmt: string;
  color_space: string;
  color_transfer: string;
  color_primaries: string;
}

const { streams }: { streams: FFprobeStream[] } =
  await $`ffprobe -v quiet -output_format json -show_format -show_streams ${inputFile}`.json();

const videoStream: FFprobeStream = (() => {
  for (const stream of streams) {
    if (stream.codec_type === "video") {
      return stream;
    }
  }
  console.error("No video stream found.");
  exit(1);
})();

const codec_fingerprint = `${videoStream.codec_name}/${videoStream.pix_fmt}/${videoStream.color_space}/${videoStream.color_primaries}/${videoStream.color_transfer}`;

console.log(codec_fingerprint);

const settings = {
  bit_depth: 8,
  hdrHLG: false,
};
switch (codec_fingerprint) {
  // biome-ignore format: https://github.com/biomejs/biome/issues/2786
  case "hevc/yuv422p10le/bt2020nc/bt2020/arib-std-b67": // Final cut HLG export?
  {
    console.log("Detected 10-bit HDR footage.");
    settings.bit_depth = 10;
    settings.hdrHLG = true;
    break;
  }
  case "h264/yuvj420p/smpte170m/smpte432/bt709": // iPhone 15 Pro
  // biome-ignore format: https://github.com/biomejs/biome/issues/2786
  case "h264/yuv420p/bt709/bt709/bt709": // macOS Screen capture
  {
    console.log("Detected 8-bit SDR (or SDR-mapped) footage.");
    settings.bit_depth = 8;
    break;
  }
  case "hevc/yuv420p/bt709/bt709/bt709": // Final Cut export
  case "hevc/yuv420p10le/bt709/undefined/undefined": // Final Cut export?
  case "h264/yuv422p10le/bt709/undefined/undefined": // R5 C using XF-AVC
  // biome-ignore format: https://github.com/biomejs/biome/issues/2786
  case "hevc/yuv422p10le/bt709/undefined/undefined": // R5 C HEVC (e.g. BT.709 or CLog 3)
  {
    console.log("Detected 10-bit SDR (or SDR-mapped) footage.");
    settings.bit_depth = 10;
    break;
  }
  default: {
    throw new Error(`Unknown codec fingerprint: ${codec_fingerprint}`);
  }
}

if (settings.hdrHLG) {
  throw new Error(
    "Haven't figured out how to do HDR tone mapping preservation yet.",
  );
}

const profile = settings.bit_depth === 10 ? "main10" : "main";
// TODO: // TODO: why doesn't yuv422p10 work for 10-bit?
const pix_fmt = settings.bit_depth === 10 ? "p010le" : "yuvj420p";

let destPrefix = `${inputFile}.hevc.qv${quality}`;
if (await file(`${destPrefix}.mp4`).exists()) {
  destPrefix = `${inputFile}.hevc.qv${quality}.${new Date().toISOString()}`;
}
const dest = `${destPrefix}.mp4`;
const tempDest = `${destPrefix}.temp.mp4`;

if (
  // TODO: process HLG without breaking colors.
  // TODO: transfer HiDPI hint (e.g. for screencaps)
  (await spawn([
    "ffmpeg",
    // Input
    "-i",
    inputFile,
    // Encoder
    "-c:v",
    "hevc_videotoolbox", // fast encoding
    "-q:v",
    quality.toString(), // Quality setting up to 100
    // File format
    "-tag:v",
    "hvc1", // Needed to play in Quicktime
    "-f",
    "mp4",
    // Quality of life
    "-movflags",
    "faststart", // Streaming
    "-movflags",
    "write_colr", // Color …?
    "-movflags",
    "frag_keyframe", // Allow the file to be readable even if it's not finished being written.
    // Bit depth
    "-profile:v",
    profile,
    "-pix_fmt",
    pix_fmt,
    // Output
    tempDest,
  ]).exited) !== 0
) {
  throw new Error();
}

await rename(tempDest, dest);

// TODO: catch Ctrl-c and rename to indicate partial transcoding
