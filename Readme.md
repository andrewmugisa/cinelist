CineList
Getting Started

Follow the instructions below to configure and run the CineList application locally.

1. Environment Configuration
Rename .env.example to .env.
Open the .env file and update the authorization token with your valid token.
2. Start the Node.js Server

Navigate to the cinelist project directory and run:

bash
node .

3. Access the Application

Once the server starts successfully, the following message should appear:

text
App available on http://localhost:3000/


Open your browser and visit:

http://localhost:3000/

4. Troubleshooting

If the application displays the following error:

text
Something went wrong. Status: 401


This indicates that the authorization token may be invalid or incorrect.

To resolve this issue:

Verify that the authorization token in your .env file is correct.
Ensure the .env file is located in the root of the cinelist directory.
Restart the Node.js server after making any changes to the .env file.

Once the token is correctly configured, restart the application and try accessing it again.