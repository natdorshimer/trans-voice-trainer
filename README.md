# Trans Voice Trainer

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

An web application designed to help trans people train their voice by analyzing and providing feedback on vocal formants. This is primarily targeted towards transgender women or anyone looking to feminize their voice. 

[**Try Trans Voice Trainer Here! 🏳️‍⚧️**](https://natdorshimer.github.io/trans-voice-trainer/)


## About This Project

Trans Voice Trainer helps people modify their vocal resonance through real-time analysis and comparison. While aspects like pitch (F0) are important, this tool specifically focuses on training **formants** (F1, F2, F3).

### What are Formants?
Think of your voice as a fundamental pitch produced by your vocal cords (F0), which is then filtered and amplified by the shape of your vocal tract (your throat and mouth). Formants are the peak resonant frequencies created by this filtering process. They significantly influence the perceived quality and gender association of a voice.

Crucially, you can learn to control the shape of your vocal tract to modify these formants. A common goal in feminizing voice training is to adjust the vocal tract shape (often by making the resonant space effectively smaller) to raise formant frequencies.

### How Trans Voice Trainer Helps
1.  **Record:** The app records your voice.
2.  **Segment:** It automatically segments the recording into individual words.
3.  **Analyze:** For each word, it calculates the key formants (F1, F2, F3).
4.  **Compare:** It compares your calculated formants against a database containing average formant values associated with different genders for those words.
5.  **Feedback:** The results are displayed visually. You can click on the formant information to get insights and guidance on how to adjust your vocal tract to move towards your desired vocal quality.

### Important Considerations
Formant training is a powerful tool, but it's only one part of voice modification. Elements like **intonation**, **inflection**, and **speech patterns** also play important roles. A spectrogram won't help you easily measure this. Instead you must carefully listen to voices you like and try to mimick them.

## Features

* Real-time audio recording and analysis in the browser.
* Automatic word segmentation.
* Calculation of F0, F1, F2, and F3 formants.
* Comparison of user formants against a reference database.
* Interactive feedback and guidance on formant modification.
* **Fully Client-Side:** All processing happens in your browser. Your voice data is never sent to a server. This ensure privacy, as well as makes the application free and easy to distribute.
* Easy deployment via static hosting (like GitHub Pages).

## Running Locally (For Developers)

These instructions are for developers who want to contribute to, modify, or run a local development version of Trans Voice Trainer.

### Prerequisites

* [Node.js](https://nodejs.org/) installed.
* [pnpm](https://pnpm.io/installation) installed (`npm install -g pnpm`).

### Development Server

1.  Clone the repository:
    ```bash
    git clone [https://github.com/natdorshimer/trans-voice-trainer.git](https://github.com/natdorshimer/trans-voice-trainer.git)
    cd trans-voice-trainer
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Run the development server:
    ```bash
    pnpm run dev
    ```
    This will typically start a local server (e.g., at `http://localhost:3000`).

### Building for Production

1.  **Configure Base Path (If Necessary):**
    The build process may require setting the `NEXT_PUBLIC_TRANS_VOICE_PATH` environment variable. This tells the application the base URL path where it will be hosted.
    * For GitHub Pages deploying to `https://username.github.io/repo-name/`, the path would likely be `/repo-name`.
    * For deploying at the root of a domain, it might be `/` or an empty string `""`.
    * Set it in your shell before building (syntax varies by OS):
        * Linux/macOS: `export NEXT_PUBLIC_TRANS_VOICE_PATH="/your-base-path"`
        * Windows (PowerShell): `$env:NEXT_PUBLIC_TRANS_VOICE_PATH="/your-base-path"`

2.  Run the build command:
    ```bash
    pnpm run build
    ```
    This will create a production-ready build in the `out` directory. You can then deploy the contents of this directory to any static web host.

## Acknowledgements
A big thank you to [TransVoiceLessons](https://www.youtube.com/@TransVoiceLessons/videos) and everyone in the TransVoice discord. It is a vast wealth of knowledge to reference from, and it does a great service for the transgender community. 

## Contributing

Contributions are welcome! If you have ideas for improvements, find bugs, or want to add features, please feel free to:

* Open an issue to discuss the change.
* Submit a pull request with your improvements.