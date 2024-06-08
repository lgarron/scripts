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

const codec_fingerprint = `${videoStream.codec_name}/${videoStream.pix_fmt}/${videoStream.color_space}/${videoStream.color_primaries}/${videoStream.color_transfer}`;

console.log(codec_fingerprint);

const handbrakePreset = await (async () => {
  switch (codec_fingerprint) {
    // biome-ignore format: https://github.com/biomejs/biome/issues/2786
    case "hevc/yuv422p10le/bt2020nc/bt2020/arib-std-b67": // Final cut HLG export?
    case "av1/yuv420p10le/bt2020nc/bt2020/arib-std-b67": // YouTube
    case "vp9/yuv420p10le/bt2020nc/bt2020/arib-std-b67": {
      // YouTube (HLG)
      console.log("Detected 10-bit HDR footage.");
      return "HEVC 10-bit (qv65)";
    }
    case "mpeg2video/yuv420p/smpte170m/smpte170m/smpte170m": // DVD?
    case "h264/yuv420p/bt470bg/bt470bg/smpte170m": // Oculus Quest 1 screen captures
    case "vp9/yuv420p/bt709/undefined/undefined": // ???
    case "vp9/yuv420p/bt709/bt709/bt709": // YouTube (SDR)
    case "h264/yuv420p/smpte170m/bt470bg/bt709": // ???
    case "hevc/yuvj420p/bt709/bt709/bt709":
    case "hevc/yuv420p/bt709/bt709/bt709": // Final Cut export
    case "h264/yuvj420p/smpte170m/smpte432/bt709": // iPhone 15 Pro
    // biome-ignore format: https://github.com/biomejs/biome/issues/2786
    case "h264/yuv420p/bt709/bt709/bt709": // macOS Screen capture
  {
    console.log("Detected 8-bit SDR (or SDR-mapped) footage.");
    return "HEVC 8-bit (qv65)";
  }
    // biome-ignore format: https://github.com/biomejs/biome/issues/2786
    case  "hevc/yuv420p10le/bt709/bt709/bt709": // `hevc`'s own output
  {
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
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: Intentional
    // fallthrough
  }
    case "hevc/yuv420p10le/bt709/undefined/undefined": // Final Cut export?
    case "h264/yuv422p10le/bt709/undefined/undefined": // R5 C using XF-AVC
    case "hevc/yuv422p10le/bt709/undefined/undefined": {
      // biome-ignore format: https://github.com/biomejs/biome/issues/2786 // R5 C HEVC (e.g. BT.709 or CLog 3)
      console.log("Detected 10-bit SDR (or SDR-mapped) footage.");
      return "HEVC 10-bit (qv65)";
    }
    default: {
      throw new Error(`Unknown codec fingerprint: ${codec_fingerprint}`);
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

// TODO: catch Ctrl-c and rename to indicate partial transcoding
