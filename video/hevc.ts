#!/usr/bin/env bun

import { exit } from "node:process";
import { parseArgs } from "node:util";
import { $, file, sleep, spawn } from "bun";

const { values: options, positionals } = parseArgs({
  options: {
    quality: { type: "string", default: "65" },
    help: { type: "boolean" },
  },
  allowPositionals: true,
});

function printHelp() {
  console.info(`Usage: hevc [--quality VALUE] <INPUT-FILE>

Default quality is 65.`);
}

if (options.help) {
  printHelp();
  exit(0);
}

if (positionals.length < 1) {
  console.error("Pass a file!");
  printHelp();
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

// const codec_fingerprint = `${videoStream.codec_name}/${videoStream.pix_fmt}/${videoStream.color_space}/${videoStream.color_primaries}/${videoStream.color_transfer}`;
const simplifiedCodecFingerprint = `${videoStream.pix_fmt}/${videoStream.color_transfer}`;

console.log(simplifiedCodecFingerprint);

const handbrakePreset = await (async () => {
  switch (simplifiedCodecFingerprint) {
    case "yuv422p10le/arib-std-b67":
    case "yuv420p10le/arib-std-b67": {
      console.log("Detected 10-bit HDR footage.");
      return "HEVC 10-bit (qv65)";
    }
    case "yuv420p/smpte170m":
    case "yuv420p/bt709":
    case "yuvj420p/bt709":
    case "yuv444p/undefined": {
      console.log("Detected 8-bit SDR (or SDR-mapped) footage.");
      return "HEVC 8-bit (qv65)";
    }
    case "yuv420p10le/bt709":
    case "yuv420p10le/undefined": {
      // `hevc`'s own output
      console.warn(`
Detected \`hevc\`'s own output with an accidental 10-bit encoding for 8-bit video data. This is not an issue if you expected it, but you may want to run \`hevc\` on the original source if it's still available.
`);
      console.write("Continuing.");
      await sleep(1000);
      console.write(".");
      await sleep(1000);
      console.write(".");
      await sleep(1000);
      console.log();
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: Intentional fallthrough
    }
    case "yuv422p10le/undefined": {
      console.log("Detected 10-bit SDR (or SDR-mapped) footage.");
      return "HEVC 10-bit (qv65)";
    }
    default: {
      throw new Error(
        `Unknown simplifiedCodecFingerprint: ${simplifiedCodecFingerprint}`,
      );
    }
  }
})();

let destPrefix = `${inputFile}.hevc.qv${quality}`;
if (await file(`${destPrefix}.mp4`).exists()) {
  destPrefix = `${inputFile}.hevc.qv${quality}.${new Date()
    .toISOString()
    .replaceAll(":", "-")}`;
}
const dest = `${destPrefix}.mp4`;

if (
  // TODO: transfer HiDPI hint (e.g. for screencaps)
  (await spawn(
    [
      "HandBrakeCLI",
      "--preset-import-file",
      "/Users/lgarron/Code/git/github.com/lgarron/dotfiles/exported/HandBrake/UserPresets.json", // TODO
      "--preset",
      handbrakePreset,
      "--quality",
      quality.toString(),
      "-i",
      inputFile,
      "-o",
      dest,
    ],
    { stdout: "inherit", stderr: "inherit" },
  ).exited) !== 0
) {
  throw new Error();
}

// TODO: catch Ctrl-C and rename to indicate partial transcoding
