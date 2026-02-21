import { Item } from '../models/types';
import { LocationName } from '../data/locations';

export default class Player {
    id: number;
    cash: number;
    savings: number;
    happiness: number;
    educationLevel: number;
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
    isAI: boolean = false;
    name: string = '';

    constructor(id: number) {
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
        this.timeDeficit = 0; // Hours carried over from previous turn due to incomplete travel
        
        // Weekly tracking for summary
        this.weeklyIncome = 0;
        this.weeklyExpenses = 0;
        this.weeklyHappinessChange = 0;
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
    }

    advanceEducation(): void {
        this.educationLevel++;
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
