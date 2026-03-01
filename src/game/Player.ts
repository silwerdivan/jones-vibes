import { Item, PlayerState } from '../models/types';
import { LocationName } from '../data/locations';

export default class Player {
    id: number;
    cash: number;
    savings: number;
    happiness: number;
    educationLevel: number;
    educationCredits: number;
    educationCreditsGoal: number;
    careerLevel: number;
    time: number;
    location: LocationName;
    hasCar: boolean;
    loan: number;
    inventory: Item[];
    hunger: number;
    timeDeficit: number;
    weeklyIncome: number;
    weeklyExpenses: number;
    weeklyHappinessChange: number;
    weeklyGraduations: string[] = [];
    isAI: boolean = false;
    name: string = '';

    constructor(id: number) {
        this.id = id;
        this.cash = 0;
        this.savings = 0;
        this.happiness = 50;
        this.educationLevel = 0;
        this.educationCredits = 0;
        this.educationCreditsGoal = 0; // Set to 0 to require enrollment
        this.careerLevel = 0;
        this.time = 24;
        this.location = "Home";
        this.hasCar = false;
        this.loan = 0;
        this.inventory = [];
        this.hunger = 0; // 0 is full, higher is hungrier
        this.timeDeficit = 0; // Hours carried over from previous turn due to incomplete travel
        
        // Weekly tracking for summary
        this.weeklyIncome = 0;
        this.weeklyExpenses = 0;
        this.weeklyHappinessChange = 0;
        this.weeklyGraduations = [];
    }

    toJSON(): PlayerState {
        return {
            id: this.id,
            cash: this.cash,
            savings: this.savings,
            happiness: this.happiness,
            educationLevel: this.educationLevel,
            educationCredits: this.educationCredits,
            educationCreditsGoal: this.educationCreditsGoal,
            careerLevel: this.careerLevel,
            time: this.time,
            location: this.location,
            hasCar: this.hasCar,
            loan: this.loan,
            inventory: [...this.inventory],
            hunger: this.hunger,
            timeDeficit: this.timeDeficit,
            weeklyIncome: this.weeklyIncome,
            weeklyExpenses: this.weeklyExpenses,
            weeklyHappinessChange: this.weeklyHappinessChange,
            isAI: this.isAI,
            name: this.name
        };
    }

    static fromJSON(data: PlayerState): Player {
        const player = new Player(data.id);
        player.cash = data.cash;
        player.savings = data.savings;
        player.happiness = data.happiness;
        player.educationLevel = data.educationLevel;
        player.educationCredits = data.educationCredits || 0;
        player.educationCreditsGoal = data.educationCreditsGoal !== undefined ? data.educationCreditsGoal : 0;
        player.careerLevel = data.careerLevel;
        player.time = data.time;
        player.location = data.location as LocationName;
        player.hasCar = data.hasCar;
        player.loan = data.loan;
        player.inventory = [...data.inventory];
        player.hunger = data.hunger;
        player.timeDeficit = data.timeDeficit;
        player.weeklyIncome = data.weeklyIncome;
        player.weeklyExpenses = data.weeklyExpenses;
        player.weeklyHappinessChange = data.weeklyHappinessChange;
        player.isAI = data.isAI;
        player.name = data.name;
        return player;
    }

    addCash(amount: number): void {
        this.cash += amount;
        this.weeklyIncome += amount;
    }

    spendCash(amount: number): boolean {
        if (this.cash >= amount) {
            this.cash -= amount;
            this.weeklyExpenses += amount;
            return true;
        }
        return false;
    }

    updateHappiness(points: number): void {
        const oldHappiness = this.happiness;
        this.happiness += points;
        if (this.happiness > 100) {
            this.happiness = 100;
        } else if (this.happiness < 0) {
            this.happiness = 0;
        }
        this.weeklyHappinessChange += (this.happiness - oldHappiness);
    }

    resetWeeklyStats(): void {
        this.weeklyIncome = 0;
        this.weeklyExpenses = 0;
        this.weeklyHappinessChange = 0;
        this.weeklyGraduations = [];
    }

    advanceEducation(courseName?: string): void {
        this.educationLevel++;
        if (courseName) {
            this.weeklyGraduations.push(courseName);
        }
    }

    addEducationCredits(amount: number): void {
        this.educationCredits += amount;
    }

    setEducationGoal(goal: number): void {
        this.educationCreditsGoal = goal;
    }

    advanceCareer(): void {
        this.careerLevel++;
    }

    deductTime(hours: number): void {
        this.time -= hours;
    }

    setTime(hours: number): void {
        this.time = hours;
    }

    setLocation(newLocation: LocationName): void {
        this.location = newLocation;
    }

    giveCar(): void {
        this.hasCar = true;
    }

    takeLoan(amount: number): void {
        this.loan += amount;
    }

    repayLoan(amount: number): boolean {
        if (this.loan >= amount) {
            this.loan -= amount;
            return true;
        }
        return false;
    }

    deposit(amount: number): boolean {
        if (this.cash >= amount) {
            this.cash -= amount;
            this.savings += amount;
            return true;
        }
        return false;
    }

    withdraw(amount: number): boolean {
        if (this.savings >= amount) {
            this.savings -= amount;
            this.cash += amount;
            return true;
        }
        return false;
    }
}
