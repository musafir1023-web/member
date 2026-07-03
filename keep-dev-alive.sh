#!/bin/bash
cd /home/z/my-project
npx next dev -p 3000 &
DEV_PID=$!
echo "Dev server PID: $DEV_PID"

cd /home/z/my-project/mini-services/chat-service
bun --hot index.ts &
CHAT_PID=$!
echo "Chat service PID: $CHAT_PID"

# Keep this script running to prevent orphaning
while kill -0 $DEV_PID 2>/dev/null; do
  sleep 5
done
