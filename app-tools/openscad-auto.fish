#!/usr/bin/env -S fish --no-config

if [ (count $argv) -lt 1 ]
  echo "Usage: openscad-auto file.scad" >&2
  exit 1
end

set INPUT_FILE $argv[1]
set OUTPUT_FILE $INPUT_FILE.stl

if test -e $OUTPUT_FILE
  set -l OUTPUT_FILE_BACKUP $OUTPUT_FILE.bak.(date "+%Y-%m-%d_%H-%M-%S").stl
  echo "Output file already exists. Moving to: "(set_color --bold)"$OUTPUT_FILE_BACKUP"(set_color normal)
  mv $OUTPUT_FILE $OUTPUT_FILE_BACKUP
end

echo "Writing new file to: "(set_color --bold)"$INPUT_FILE.stl"(set_color normal)
openscad -o $INPUT_FILE.stl $INPUT_FILE

terminal-notifier -title "openscad-auto" -message "Done converting: $INPUT_FILE" -execute "open -R "(string escape $OUTPUT_FILE)""
