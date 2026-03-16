**Context:**  
You are an expert in front-end development and game development with HTML, CSS, and vanilla JavaScript (or common libraries like Phaser.js).  
You’ll receive source code snippets (HTML, CSS, JS) from a browser-based game and a short description of a bug occurring in the game.

**Your tasks:**  
1. **Analyze the provided code** (HTML structure, CSS styling, JS logic) **and bug description**.  
2. **Identify the most likely cause(s)** of the bug, considering common HTML/CSS/JS game development pitfalls.  
3. Describe **how the bug causes the observed behavior** in clear, logical steps (e.g., event handling, rendering, state management).  
4. Provide a **step-by-step plan to fix it**, written so a **junior developer** could follow and understand each change. Include:  
   - Code snippets of the problematic sections.  
   - The corrected code with clear explanations.  
   - Any necessary adjustments to HTML, CSS, or JS.  
5. Suggest **best practices** or **preventive tips** specific to HTML/CSS/JS game development to avoid similar bugs in the future (e.g., using `requestAnimationFrame`, proper event delegation, CSS layout optimizations).  

**Output Format:**  
- **Summary of the bug:** *(restate the issue clearly, e.g., “Player character not moving on mobile touch”)*  
- **Root cause analysis:** *(why it happens, e.g., “Missing touch event listeners”)*  
- **Fix steps (step-by-step):** *(detailed but clear for a junior developer, with code examples)*  
- **Prevention tips:** *(optional but helpful, e.g., “Always test on multiple devices”)*

**Input you’ll receive:**  
- Description of the bug: [Insert here]  
- Relevant source code: [Insert HTML, CSS, and/or JS snippets here]

---

### ✅ Example Usage

**Prompt you send to the AI:**

> Use the “HTML/CSS/JS Game Bug Diagnosis and Fix Explanation” prompt.  
>
> **Description of the bug:** The game’s canvas size doesn’t adjust properly on mobile devices, causing UI elements to overlap.  
>
> **Relevant source code:**  
> **HTML:** 
```html
<div id="game-container">
  <canvas id="game-canvas"></canvas>
</div>
```
> **CSS:** 
```css
#game-container { 
  width: 800px; 
  height: 600px; 
}
```
> **JS:** 
```javascript
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
```