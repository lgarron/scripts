#!/usr/bin/env -S fish --no-config

set COMMAND $argv[1]
set PAM_SUDO_FILE "/private/etc/pam.d/sudo"

function show_matches
  set ADVERB $argv[1]
  echo "[$PAM_SUDO_FILE] Lines $ADVERB containing `pam_tid.so`:"
  cat $PAM_SUDO_FILE | grep "pam_tid\.so" ; or echo "(no lines)"
end

set SCRIPT_NAME (basename (status -f))
function show_help
  echo "Usage: $SCRIPT_NAME [enable/disable/status/help]"
  echo ""
  echo "Enable Touch ID for sudo commands in shells by adding `pam_tid.so` to `$PAM_SUDO_FILE`."
  echo ""
  show_matches "currently"
  exit
end

function enable
  show_matches "originally"
  echo "----------------"
  echo "Ensuring `auth sufficient pam_tid.so` entry."
  echo "May require `sudo` auth itself."

  cat $PAM_SUDO_FILE | grep pam_tid.so > /dev/null ; or \
    sudo sed -i "" "1,/.so/s/^auth/auth       sufficient     pam_tid.so\nauth/" $PAM_SUDO_FILE # Touch ID sudo
    
  echo "----------------"
  show_matches "now"
end

if [ "$COMMAND" = "status" ]
  show_matches "currently"
else if [ "$COMMAND" = "help" ]
  show_help  
else if [ "$COMMAND" = "enable" ]
  echo "Enabling Touch ID sudo…"
  echo "----------------"
  enable
else if [ "$COMMAND" = "" ]
  echo "Enabling Touch ID sudo…"
  echo "(To view options, run: $SCRIPT_NAME help)"
  echo "----------------"
  enable
else if [ "$COMMAND" = "disable" ]
  show_matches "originally"
  echo "----------------"
  echo "Deleting any `auth sufficient pam_tid.so` entry."
  echo "You will likely be prompted for `sudo` auth using a password in order to enable Touch ID."

  sudo sed -i "" "/^auth  *sufficient  *pam_tid\.so\$/d" $PAM_SUDO_FILE

  echo "----------------"
  show_matches "now"
else
  show_help
end
