export default class Player {
    constructor(id) {
        this.id = id;
        this.cash = 0;
        this.savings = 0;
        this.happiness = 50;
        this.educationLevel = 0;
        this.careerLevel = 0;
        this.time = 24;
        this.location = "Home";
        this.hasCar = false;
        this.loan = 0;
        this.inventory = [];
        this.hunger = 0; // 0 is full, higher is hungrier
    }

    addCash(amount) {
        this.cash += amount;
    }

    spendCash(amount) {
        if (this.cash >= amount) {
            this.cash -= amount;
            return true;
        }
        return false;
    }

    updateHappiness(points) {
        this.happiness += points;
        if (this.happiness > 100) {
            this.happiness = 100;
        } else if (this.happiness < 0) {
            this.happiness = 0;
        }
    }

    advanceEducation() {
        this.educationLevel++;
    }

    advanceCareer() {
        this.careerLevel++;
    }

    deductTime(hours) {
        this.time -= hours;
    }

    setTime(hours) {
        this.time = hours;
    }

    setLocation(newLocation) {
        this.location = newLocation;
    }

    giveCar() {
        this.hasCar = true;
    }

    takeLoan(amount) {
        this.loan += amount;
    }

    repayLoan(amount) {
        if (this.loan >= amount) {
            this.loan -= amount;
            return true;
        }
        return false;
    }

    deposit(amount) {
        if (this.cash >= amount) {
            this.cash -= amount;
            this.savings += amount;
            return true;
        }
        return false;
    }

    withdraw(amount) {
        if (this.savings >= amount) {
            this.savings -= amount;
            this.cash += amount;
            return true;
        }
        return false;
    }
}
