#!/usr/bin/env -S fish --no-config

if [ (count $argv) -eq 0 ]
  echo "Usage: rmtag <tag-name> [more branch names]"
  echo ""
  echo "Remove `git` tags locally and remotely."
end

for TAG in $argv
  git tag -d $TAG; or echo "Did not need to remove tag locally"
  echo "--------"
  git push origin :$TAG; or echo "Did not need to remove tag from origin"
end
