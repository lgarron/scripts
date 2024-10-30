#!/usr/bin/env -S fish --no-config

set VERSION (version)

function tagpush-check
  set PREVIOUS_COMMIT_VERSION (version --previous)
  if test $VERSION = $PREVIOUS_COMMIT_VERSION
    echo "Project version did not change since last commit. Halting `tagpush`." 1>&2
    return 1
  end
end

function tagpush-version
  set TAG $argv[1]
  git tag $TAG
  echo "--------"
  git push origin $TAG
end

function retagpush-version
    set TAG $argv[1]
    echo -n "Tag was previously at at commit: "
    git rev-parse $TAG; or echo "No old tag"
    echo "--------"
    rmtag $TAG
    echo "--------"
    tagpush-version $TAG
end

if contains -- "--retag" $argv
  tagpush-check || return 1
  retagpush-version $VERSION
else
  tagpush-check || return 1
  tagpush-version $VERSION
end

