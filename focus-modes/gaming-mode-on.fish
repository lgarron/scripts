#!/usr/bin/env -S fish --no-config

open -a "Background Music"
/Applications/Arq.app/Contents/Resources/arqc pauseBackups 120 > /dev/null

defaults write com.apple.screencapture location "/Volumes/VIDEOLAND/Screencaps/"
killall SystemUIServer
