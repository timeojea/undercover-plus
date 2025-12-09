<div align="center">
  <img src="image_2.png" alt="Undercover Logo" width="150">

  <h1>🕵️ Undercover+ - Custom Party Game</h1>

  <p>
    A fully customizable, mobile-first web version of the famous social deduction party game.<br>
    Built with vanilla HTML, CSS, and JavaScript. No backend required.
  </p>

  <h2>
    <a href="https://timeojea.github.io/undercover-plus/">🚀 PLAY ONLINE NOW</a>
  </h2>

  <p>
    <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
    <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
    <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=white" alt="JavaScript">
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

* **📱 Mobile-First Design:** Optimized for smartphones with a modern Dark Mode UI (Violet Accent).
* **🌍 Bilingual Support:** Instant switch between **English** and **French** interface & words.
* **👥 Advanced Player Management:**
    * Add/Import players easily.
    * **Auto-generated avatars** (colored initials) or upload custom photos.
    * **LocalStorage:** Players are saved on your device for future games.
* **🔒 Security:** Deleting a saved player requires a PIN code (`4862`) to prevent accidents.
* **⚙️ Customizable Settings:** Choose the number of Undercovers and Mr. Whites.
* **📚 Extensive Word Database:** Includes 3 pre-filled "Combolists" with 100+ word pairs each (Daily Life, Pop Culture, Concepts).
* **👁️ Secret Check:** Players can discreetly check their word during the game using a "Hold to reveal" mechanic.

## 🚀 How to Play

1.  **Setup:** Open the app on one phone (or click the [Play Online](https://timeojea.github.io/undercover-plus/) link).
2.  **Add Players:** Click `+ Add Player` to create profiles or import saved friends.
3.  **Configure:** Select the number of *Undercovers* and *Mr. Whites*, and choose a Word Theme.
4.  **Distribute Roles:** Pass the phone to each player. They must hold the screen to see their secret identity.
5.  **The Game:** Each player says one word to describe their secret.
6.  **Vote:** After the round, debate and vote to eliminate the impostor!

## 🛠️ Installation & Usage

You don't need to install anything! This is a static web application.

### Option 1: Play Online (Recommended)
Simply click here: **[https://timeojea.github.io/undercover-plus/](https://timeojea.github.io/undercover-plus/)**

### Option 2: Run Locally
1.  Clone the repository:
    ```bash
    git clone [https://github.com/timeojea/undercover-plus.git](https://github.com/timeojea/undercover-plus.git)
    ```
2.  Simply open `index.html` in your web browser (Chrome, Safari, Firefox).

## 📝 Customization (Adding Words)

You can easily add your own private jokes or themes by editing the `data.js` file.

The structure is simple:
```javascript
const DATABASE = {
    "fr": {
        "My Custom Category": [
            ["Word A", "Word B"],
            ["Batman", "Superman"]
        ]
    },
    "en": {
        "My Custom Category": [
             ["Word A", "Word B"],
             ["Batman", "Superman"]
        ]
    }
};
