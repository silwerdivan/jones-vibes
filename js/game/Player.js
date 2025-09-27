class Player {
    constructor(name = 'Player 1') {
        this.name = name;
        this.cash = 200;
        this.savings = 0;
        this.happiness = 50;
        this.educationLevel = 0;
        this.careerLevel = 0;
        this.time = 24;
        this.location = 'Home';
        this.hasCar = false;
        this.loan = 0;
        this.overdueBills = 0;
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

    updateTime(hours) {
        this.time -= hours;
    }

    setLocation(newLocation) {
        this.location = newLocation;
    }

    giveCar() {
        this.hasCar = true;
    }

    takeLoan(amount) {
        if (this.loan + amount <= 2500) {
            this.loan += amount;
            this.addCash(amount);
            return true;
        }
        return false;
    }

    repayLoan(amount) {
        if (this.cash >= amount && this.loan > 0) {
            const repayment = Math.min(amount, this.loan);
            this.spendCash(repayment);
            this.loan -= repayment;
            return true;
        }
        return false;
    }

    deposit(amount) {
        if (this.spendCash(amount)) {
            this.savings += amount;
            return true;
        }
        return false;
    }

    withdraw(amount) {
        if (this.savings >= amount) {
            this.savings -= amount;
            this.addCash(amount);
            return true;
        }
        return false;
    }
}

module.exports = Player;