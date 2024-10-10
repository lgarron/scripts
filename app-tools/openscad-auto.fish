#!/usr/bin/env -S fish --no-config

if [ (count $argv) -lt 1 ]
  echo "Usage: openscad-auto file.scad" >&2
  exit 1
end

echo "Writing to: "(set_color --bold)"$argv[1].stl"(set_color normal)
openscad -o $argv[1].stl $argv[1]
