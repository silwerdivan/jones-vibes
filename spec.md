# Detailed Specification: Jones in the Fast Lane (MVP)

## I. Core Game Structure

*   **Platform:** Browser-based Game.
*   **Player Modes:** Local **'Hotseat' Multiplayer** (2-player) and **Single-Player vs. AI**.
*   **Game Objective:** First player to **simultaneously** achieve all four metrics wins.

| Metric | Target Value | Notes |
| :--- | :--- | :--- |
| **Wealth** | **\$10,000** | Must be **cash on hand**. Savings do not count toward this goal. |
| **Happiness** | **80 points** | Out of a maximum score of 100. |
| **Education** | **"Completed Community College"** | Achieved by completing the 3 courses. |
| **Career** | **"Junior Manager" (Level 4)** | Highest job level in the MVP. |

## II. Time & Economy Mechanics

| Mechanic | Detail |
| :--- | :--- |
| **Time Unit** | **Hours** |
| **Turn Time** | Player starts each turn with **24 Hours**. |
| **Max Time Bank** | **48 Hours** (Can carry over 24 unused Hours). |
| **Daily Expense** | **\$50** per turn/day. |
| **Resting** | **Ends turn**, replenishes Time to 24 Hours, and **deducts the Daily Expense**. If a player cannot pay, an Overdue Bills amount is tracked. |

## III. Map & Locations

The game board features 6 interactive locations:

| Location | Core Action / Function |
| :--- | :--- |
| **Home** | Start/End turn, replenish Time, pay Daily Expense. |
| **Employment Agency** | Look for and work jobs (Gain Wealth/Career). |
| **Community College** | Enroll in and attend courses (Gain Education). |
| **Shopping Mall** | Purchase consumables (Gain Happiness). |
| **Used Car Lot** | Purchase the **Used Sedan** for efficiency. |
| **Bank** | Deposit/Withdraw, Take Out/Pay Back Loans (Manage Wealth). |

## IV. Progression Mechanics Detail

### 1. Career (Employment Agency)

*   Working requires a single trip to the location and consumes the full Standard Shift Length.

| Career Level | Job Title | Hourly Wage | Standard Shift (Hours) | Requirements |
| :---: | :---: | :---: | :---: | :---: |
| **1** | Dishwasher | \$8 / hour | 6 Hours | None |
| **2** | Retail Clerk | \$12 / hour | 7 Hours | 1 Completed Course (Any) |
| **3** | Office Assistant | \$16 / hour | 8 Hours | 2 Completed Courses (Any) |
| **4** | **Junior Manager** | \$20 / hour | 8 Hours | **Completed Community College** |

### 2. Education (Community College)

*   Courses are **one-time** purchases and time commitments.

| Course Name | Cost (\$) | Time to Complete (Hours) | Milestone Gained |
| :---: | :---: | :---: | :---: |
| Intro to Business | \$500 | 10 Hours | Completed 1st Course |
| Basic Accounting | \$750 | 15 Hours | Completed 2nd Course |
| **Time Management** | \$1,000 | 20 Hours | **Completed Community College** |

### 3. Happiness (Shopping Mall)

*   Items are **consumable** (one-time use) and provide an immediate, permanent boost to Happiness score.

| Category | Item Name | Cost (\$) | Happiness Boost (Points) |
| :---: | :---: | :---: | :---: |
| Entertainment | New Video Game | \$150 | +15 Points |
| Luxury | Designer Watch | \$400 | +30 Points |
| Personal Care | Spa Day Voucher | \$600 | +40 Points |

### 4. Travel & Efficiency (Used Car Lot)

| Travel Method | Time Cost Per Trip (Between Locations) | Purchase Cost |
| :--- | :--- | :--- |
| **On Foot** | **2 Hours** | N/A |
| **Used Sedan** | **1 Hour** | **\$3,000** (One-time purchase) |

### 5. Finance (Bank)

*   **Bank Actions:** Deposit Cash, Withdraw Cash, Take Out Loan, Pay Back Loan.
*   **Maximum Loan:** **\$2,500**.
*   **Interest:** Applied at the start of every turn/day (Compounded Daily/Per Turn).
    *   Savings: **+1%** on total savings.
    *   Loan: **+5%** on outstanding balance.

## V. AI Opponent (Single Player Mode)

*   **Personality:** "The Balanced Climber" - follows a simple, fixed, balanced priority list.

| Priority | Action | Condition to Act |
| :---: | :--- | :--- |
| **1 (Highest)** | **Pay Bills/Loan** | If Overdue Bills exist or Loan is at max amount. |
| **2** | **Gain Wealth** | If cash on hand is **below \$1,000**. |
| **3** | **Advance Education** | If enough cash/time and next required course is not complete. |
| **4** | **Boost Happiness** | If Happiness is **below 50**. |
| **5** | **Increase Efficiency** | Buy **Used Sedan** if cash is **>\$3,500** and car is not owned. |
| **6 (Lowest)** | **Work** | If none of the above are met, work the highest-level job available. |

## VI. User Interface (UI) Requirements

Three essential, persistent UI components must be visible at all times:

### 1. The Player Status Panel (Persistent)
*   **Displays:** Current Player Indicator, **Cash on Hand**, **Total Savings**, **Happiness Score** (X/100), **Education Milestone**, and **Current Job Title/Level**.

### 2. The Time & Movement Tracker (Persistent)
*   **Displays:** **Hours Remaining** (X Hours Left), **Car Status** (Owned/Not Owned), **Current Location**, and a clear, always-visible **End Turn/Rest Button**.

### 3. The Opponent Status Panel (Persistent)
*   **Displays:** Opponent's Name (Player 2 or AI), and a set of four simple **Progress Indicators** (bars/icons) showing their progress towards the four Wealth, Happiness, Education, and Career goals. *(Note: Specific cash/score numbers are hidden, only progress is shown.)*