#!/usr/bin/env -S fish --no-config

if [ (count $argv) -lt 1 ]
  echo "Usage: openscad-auto file.scad" >&2
  exit 1
end

set INPUT_FILE $argv[1]
set OUTPUT_FILE $INPUT_FILE.stl

echo "Writing to: "(set_color --bold)"$INPUT_FILE.stl"(set_color normal)
openscad -o $INPUT_FILE.stl $INPUT_FILE

terminal-notifier -title "openscad-auto" -message "Done converting: $INPUT_FILE" -execute "open -R "(string escape $OUTPUT_FILE)""
