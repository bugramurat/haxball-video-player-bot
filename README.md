# Haxball Video Player Bot
Haxball video player bot with Haxball Headless API
<br><br>
You can upload **your video** to *project-folder/set-up-video* as *video.mp4* file but videos longer than 2 minutes take longer to process in the *frames2txt.js* file *(There is an example video at *project-folder/set-up-video*)*
<br><br>
Use **farthest camera angle** for *the best experience* (***1 key** on the keyboard*). Because of *Haxball's variable limit for stadium elements (max 255 discs)*, video player has **19x13 resolution (247 pixels)** 

## Preview
![preview](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdG16eXJuNDJjNHpvdTllYWt3MTJjZG5jNzVoYnIxcmJ3ODAxZGpwYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZfHDwrYJvEGIOWpF3W/giphy.gif)

## How to run
Run this to **download** this project: *(or download manually and go to your project-folder path)*
```
git clone https://github.com/bugramurat/haxball-video-player-bot.git
cd haxball-video-player-bot/set-up-video
```
Install dependecies for *frames2txt.js*:
```
npm install
```
Run the script before bot for setting up video:
```
node frames2txt.js
```
Return to *project-folder* path and install dependecies for *video-player-bot.js* too:
```
cd ..
npm install
```
**Paste your token** here in *video_player_bot.js* file to run this bot *(https://www.haxball.com/headlesstoken)*
```
const HEADLESS_TOKEN = "insert_your_headless_haxball_token_here"
```
Run the bot:
```
node video_player_bot.js
```
(You can adjust your room's name and other settings in *video_player_bot.js* file)

## Usage
Simply **start** the game to **start** *video player* and **stop** the game to **stop** *video player*

## Libraries
- haxball.js

<br></br>
*For further information: bugramurat4444@gmail.com or discord: buggyraz*
