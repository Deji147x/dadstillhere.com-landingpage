#!/bin/bash
source /etc/dsh/social.env
node /opt/dsh/deploy/auto-post-buffer.mjs >> /var/log/dsh-buffer.log 2>&1
