#!/opt/homebrew/bin/fish

# Full `fish` path is hardcoded so it works outside the shell (e.g. using Karabiner). Note that a symlink at `$HOME/Dropbox` doesn't seem to work for this.
set PARENT_FOLDER "$HOME/Dropbox (Maestral)/Screenshots/Germain Screenshots/Germain App Screenshots/"
set LSAPPINFO (lsappinfo info -only bundlepath (lsappinfo front))
if echo $LSAPPINFO | grep ".*LSBundlePath.*minecraft.*"
  # For Minecraft, `lsappinfo` returns `"LSBundlePath"="/path/…/to/…/java"`
  # I can't figure out how to get a plain string or the arguments, so we just hardcoded this case.
  set APP_NAME "Minecraft"
else
  set APP_NAME (path change-extension '' (basename (echo $LSAPPINFO)))
end
echo $APP_NA`ME
set APP_FOLDER "$PARENT_FOLDER/$APP_NAME"

mkdir -p $APP_FOLDER

set DATE_STRING (date "+%Y-%m-%d — %H-%M-%S")

set FILE_NAME_UNSUFFIXED "$APP_FOLDER/$DATE_STRING — $APP_NAME"

if [ "$argv[1]" = "--front-window-shadowed-png" ]
  set WINDOW_ID (osascript -e 'tell application (path to frontmost application as text) to id of window 1')
  set FILE_NAME $FILE_NAME_UNSUFFIXED.png
  screencapture -l$WINDOW_ID -t png $FILE_NAME
else if [ "$argv[1]" = "--front-window-shadowless-jpg" ]
  set WINDOW_ID (osascript -e 'tell application (path to frontmost application as text) to id of window 1')
  set FILE_NAME $FILE_NAME_UNSUFFIXED.jpg
  screencapture -l$WINDOW_ID -o -t jpg $FILE_NAME
else
  set FILE_NAME $FILE_NAME_UNSUFFIXED.jpg
  screencapture -t jpg $FILE_NAME
end

# TODO: better arg handling
if [ "$argv[1]" = "--reveal" ]
  open -R $FILE_NAME
end
if [ "$argv[2]" = "--reveal" ]
  open -R $FILE_NAME
end
# /Applications/ImageOptim.app/Contents/MacOS/ImageOptim $FILE_NAME &

# Permission needed for: /Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_console_user_server
