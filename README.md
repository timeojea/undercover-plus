<div align="center">
  <img src="image_2.png" alt="Undercover Logo" width="150">

  <h1>🕵️ Undercover+ - Custom Party Game</h1>

  <p>
    A fully customizable, mobile-first web version of the famous social deduction party game.<br>
    <strong>Now powered by Google Gemini AI for infinite word generation!</strong><br>
    Built with vanilla HTML, CSS, and JavaScript. No backend required.
  </p>

  <h2>
    <a href="https://timeojea.github.io/undercover-plus/">🚀 PLAY ONLINE NOW</a>
  </h2>

  <p>
    <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
    <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
    <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=white" alt="JavaScript">
    <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI">
  </p>
</div>

<br>

## 🎮 What is Undercover?

Undercover is a local multiplayer party game (played on a single phone passed around). The goal is to find out who among the players has a different secret word than the others.

* **Civilians:** Receive the same secret word.
* **Undercover:** Receives a slightly different word.
* **Mr. White:** Receives no word at all.

Players must describe their word without revealing too much, then vote to eliminate the impostors!

## ✨ Features

* **🤖 AI-Powered Generation:** Use the new **RGB Neon Interface** to generate infinite custom word pairs instantly using **Google Gemini 1.5 Flash**.
* **📱 Mobile-First Design:** Optimized for smartphones with a modern Dark Mode UI and smooth animations.
* **✏️ In-App Editor:** Create and manage your own custom word packs directly within the app (saved locally).
* **🌍 Bilingual Support:** Instant switch between **English** and **French** interface & words.
* **👥 Advanced Player Management:**
    * Add/Import players easily.
    * **Auto-generated avatars** (colored initials) or upload custom photos.
    * **LocalStorage:** Players and custom packs are saved on your device.
* **🔒 Security:** Deleting a saved player requires a PIN code (`4862`) to prevent accidents.
* **📚 Revamped Database:** Includes 3 official lists with 50+ pairs each: **Nature & Animals**, **Sports & Hobbies**, **Video Games**.
* **👁️ Secret Check:** Players can discreetly check their word during the game using a "Hold to reveal" mechanic.
* **📦 PWA Support:** Installable as an app on your phone and works offline (Service Worker included).

## 🚀 How to Play

1.  **Setup:** Open the app on one phone (or click the [Play Online](https://timeojea.github.io/undercover-plus/) link).
2.  **Add Players:** Click `+ Add Player` to create profiles or import saved friends.
3.  **Configure:** * Select the number of *Undercovers* and *Mr. Whites*.
    * Choose a Word Theme from the list OR type a custom theme (e.g., "Harry Potter") and click **GO** to let the AI generate words!
4.  **Distribute Roles:** Pass the phone to each player. They must hold the screen to see their secret identity.
5.  **The Game:** Each player says one word to describe their secret.
6.  **Vote:** After the round, debate and vote to eliminate the impostor!

## 🛠️ Installation & Usage

You don't need to install anything! This is a static web application.

### Option 1: Play Online (Recommended)
Simply click here: **[https://timeojea.github.io/undercover-plus/](https://timeojea.github.io/undercover-plus/)**

### Option 2: Run Locally (For Developers)
1.  Clone the repository:
    ```bash
    git clone [https://github.com/timeojea/undercover-plus.git](https://github.com/timeojea/undercover-plus.git)
    ```
2.  **API Configuration:** To use the AI feature, you must get a free API Key from [Google AI Studio](https://aistudio.google.com/).
    Open `script.js` and replace the placeholder:
    ```javascript
    const GEMINI_API_KEY = "YOUR_API_KEY_HERE";
    ```
3.  **Serve:** Open with a local server (e.g., Live Server on VS Code) to avoid CORS issues.

## 📝 Customization

You can add words in two ways:
1.  **Directly in the App:** Use the "Pencil" icon ✏️ in the main menu to create packs or use the AI generator.
2.  **Hardcoded:** Edit the `data.js` file to add permanent static lists.

```javascript
const DATABASE = {
    "fr": {
        "Nature et animaux": [ ... ],
        "Sports et loisirs": [ ... ],
        "Jeux-vidéos": [ ... ]
    }
    // ...
};
