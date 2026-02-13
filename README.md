# 📡 Medrunner API Bridge - v0.2.1

![Status](https://img.shields.io/badge/Status-Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge)

Connect **Medrunner emergencies** directly to your Smart Home. Trigger lights, sirens, or automations via **Sinric Pro** (Google Home / Alexa) whenever a new emergency call is received.

---

## Requierments

Before setting up, ensure you have these ready:

* **Node.js**: [Download & Install](https://nodejs.org/) (LTS version recommended)
* **FFmpeg**: [Download & Install](https://www.ffmpeg.org/download.html)
* **Sinric Pro Account**: [Sign up for free](https://sinric.pro)
* Have access to the **Medrunner Staff Portal**

---

## Step 1: Sinric Pro Configuration

[Detailed Guide](https://github.com/TW1NG0/medrunner-api-bridge/wiki/How-to-setup-your-Sinric-Pro-device)

1.  **Create Device**: In your Sinric Dashboard, add a new device of type **Switch**.
2.  **Naming**: Name it something recognizable (e.g., `Emergency Alarm`).
3.  **Get Credentials**: Open the device details and copy these three values:
    * `App Key`
    * `App Secret`
    * `Switch ID` (Device ID)

---

## Step 2: Get your Medrunner API Token

[Detailed Guide](https://github.com/TW1NG0/medrunner-api-bridge/wiki/Where-to-find-your-Medrunner-API-Token)

1.  Head into the **Staffportal**.
2.  Click on the **Profile Icon** in the top right and find the section called "API TOKENS".
3.  Click **Create Token +**, name it whatever you want (and dont set an expiration date if you wish to keep using the Bridge) and copy the Token.

---

## Step 3: Installation & Launch

[Detailed Guide](https://github.com/TW1NG0/medrunner-api-bridge/wiki/How-to-setup-Medrunner-API-Bridge)

No coding skills or terminal commands are required! 

1.  **Download** this project and extract the folder.
2.  **Double-click** the **`start.bat`** file.
    * *The first time you run it, it will automatically download all necessary components. This may take a minute.*
3.  **Web Setup**: If the system isn't configured yet, it will ask you to visit [http://localhost:3000](http://localhost:3000) in your browser.
4.  **Configure**: Enter your Medrunner and Sinric credentials into the web form and click **Save**.

The system will now automatically listen for emergencies and trigger your switch!

[Here](https://github.com/TW1NG0/medrunner-api-bridge/wiki/How-to-control-smart-home-devices-with-Medrunner%E2%80%90API%E2%80%90Bridge) you can learn how to connect the Medrunner-API-Bridge to Smarthome and more!

---

## 📡 Usage & Logs

Keep the terminal window open to see live updates or make changes:

- test           - simulate alert-event

- stop           - stop current alert-event

- status         - shows API and websocket status

- version        - shows Medrunner API Bridge version

- setup          - setup to change tokens / device

- clear          - clears the terminal feed

- exit           - close Medrunner API Bridge

---

## ❓ Troubleshooting

### Check the [WIKI](https://github.com/TW1NG0/medrunner-api-bridge/wiki) for detailed guides on how to setup the Medrunner API Bridge

| Issue | Solution |
| :--- | :--- |
| **Port 3000 busy** | Another program is using the setup port. Close other windows or restart your PC. |
| **Invalid Token** | Ensure no spaces are included when pasting your Medrunner refresh token. |
| **No reaction** | Double-check if the `App Secret` and `Switch ID` match your Sinric Dashboard exactly. |
| **Start.bat fails** | Ensure Node.js is installed. If it still fails, try running `npm install` manually. |

> **Pro Tip:** To reset your settings or change your keys, simply delete the `.env` file in the project folder and run `start.bat` again.

---

## ⚖️ License

Distributed under the **ISC License**. Free to use, modify, and share for the Medrunner community.

Disclaimer: AI has been used to write some of the code in this repository.

---
*Developed for the Medrunner Community.*
