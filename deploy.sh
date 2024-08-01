localBuildFolder="webrtc-client"
remoteServer="omkarpanchal.cse@35.200.170.161"
remoteDeployFolder="/home/omkarpanchal.cse/deploy"
sshKeyPath="/C/Users/omkar/Documents/omkar-linux-key"

# Transfer build folder using scp with SSH key
echo "Connecting to Server..."
scp -i "$sshKeyPath" -r "$localBuildFolder" "$remoteServer:$remoteDeployFolder/"

ssh -i "$sshKeyPath" "$remoteServer" <<EOF

# Installing dependancy and deploy on the server
cd "$remoteDeployFolder/webrtc-client"
npm init -y
npm install express
npm install dotenv
pm2 reload webrtc-client
EOF

echo "Deployment completed successfully..."
