# Deleting previous build folder if it exists
if [ -d "webrtc-client" ]; then
    echo "Deleting previous build folder..."
    rm -rf webrtc-client
fi

echo "Building a Project..."
npm run build

echo "Setting up Project..."

mv dist webrtc-client
cd webrtc-client

# Copying .env file from the main folder of React app to build folder
cp ../.env .env

# Copying a server.js file to build folder
cp /C/Users/omkar/Desktop/projects/server-template.txt server.js

# Starting the server
echo "Setup complete..."
