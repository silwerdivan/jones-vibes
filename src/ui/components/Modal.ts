import EventBus from '../../EventBus.js';
import { Clerk, IconRegistry, PlayerState, Course, Job, LogMessage, TurnSummary } from '../../models/types.js';

export interface ModalConfig {
  title?: string;
}

export abstract class Modal {
  protected overlay: HTMLElement | null;
  protected titleElement: HTMLElement | null;
  
  constructor(overlayId: string, titleId?: string, closableByOverlay: boolean = true) {
    this.overlay = document.getElementById(overlayId);
    this.titleElement = titleId ? document.getElementById(titleId) : null;
    
    // Default: clicking the overlay hides it (if it's not the actual modal content)
    if (closableByOverlay) {
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
    }
  }

  public isVisible(): boolean {
    return !this.overlay?.classList.contains('hidden');
  }

  public show(config: ModalConfig = {}): void {
    if (this.isVisible()) return;

    if (config.title && this.titleElement) {
      this.titleElement.textContent = config.title;
      this.titleElement.classList.remove('hidden');
    }
    this.overlay?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    EventBus.publish('modalShown', { modalId: this.overlay?.id });
  }

  public hide(): void {
    if (!this.isVisible()) return;

    this.overlay?.classList.add('hidden');
    document.body.style.overflow = '';
    EventBus.publish('modalHidden', { modalId: this.overlay?.id });
  }

  protected addSwipeToClose(modalElement: HTMLElement): void {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = modalElement.getBoundingClientRect();
      
      if (touch.clientY - rect.top < rect.height * 0.25) {
        startY = touch.clientY;
        isDragging = true;
        modalElement.style.transition = 'none';
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 0) {
        modalElement.style.transform = `translateY(${deltaY}px)`;
        const opacity = Math.max(0, 1 - (deltaY / window.innerHeight));
        if (this.overlay) this.overlay.style.backgroundColor = `rgba(0, 0, 0, ${0.8 * opacity})`;
      }
    };
    
    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      isDragging = false;
      const deltaY = currentY - startY;
      const threshold = window.innerHeight * 0.3;
      
      modalElement.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      
      if (deltaY > threshold) {
        modalElement.style.transform = `translateY(100%)`;
        modalElement.style.opacity = '0';
        
        setTimeout(() => {
          this.hide();
          modalElement.style.transform = '';
          modalElement.style.opacity = '';
          if (this.overlay) this.overlay.style.backgroundColor = '';
        }, 300);
      } else {
        modalElement.style.transform = '';
        if (this.overlay) this.overlay.style.backgroundColor = '';
      }
    };
    
    modalElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    modalElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    modalElement.addEventListener('touchend', handleTouchEnd, { passive: true });
  }
}

export class ChoiceModal extends Modal {
  private content: HTMLElement | null;
  private inputContainer: HTMLElement | null;
  private inputField: HTMLInputElement | null;
  private primaryButtons: HTMLElement | null;
  private secondaryActions: HTMLElement | null;
  private cancelButton: HTMLElement | null;
  private clerkContainer: HTMLElement | null;
  private clerkAvatar: HTMLElement | null;
  private clerkName: HTMLElement | null;
  private clerkMessage: HTMLElement | null;

  constructor() {
    super('choice-modal-overlay', 'choice-modal-title');
    
    this.content = document.getElementById('choice-modal-content');
    this.inputContainer = document.getElementById('choice-modal-input');
    this.inputField = document.getElementById('modal-input-amount') as HTMLInputElement;
    this.primaryButtons = document.getElementById('choice-modal-buttons');
    this.secondaryActions = document.getElementById('dashboard-secondary-actions');
    this.cancelButton = document.getElementById('modal-cancel-button');
    
    this.clerkContainer = document.getElementById('modal-clerk-container');
    this.clerkAvatar = document.getElementById('modal-clerk-avatar');
    this.clerkName = document.getElementById('modal-clerk-name');
    this.clerkMessage = document.getElementById('modal-clerk-message');
    
    if (this.cancelButton) {
      this.cancelButton.addEventListener('click', () => this.hide());
    }

    const modalElement = document.getElementById('choice-modal');
    if (modalElement) this.addSwipeToClose(modalElement);
  }

  public setupClerk(clerk: Clerk | null, Icons: IconRegistry): void {
    if (clerk && this.clerkContainer) {
      this.clerkContainer.classList.remove('hidden');
      if (this.clerkAvatar) this.clerkAvatar.innerHTML = Icons[clerk.icon](40, '#00FFFF');
      if (this.clerkName) this.clerkName.textContent = clerk.name;
      if (this.clerkMessage) this.clerkMessage.textContent = clerk.message;
      this.titleElement?.classList.add('hidden');
    } else {
      this.clerkContainer?.classList.add('hidden');
      this.titleElement?.classList.remove('hidden');
    }
  }

  public clearContent(): void {
    if (this.content) this.content.innerHTML = '';
    if (this.primaryButtons) this.primaryButtons.innerHTML = '';
    if (this.secondaryActions) this.secondaryActions.innerHTML = '';
  }

  public showInput(show: boolean): void {
    if (show) {
      this.inputContainer?.classList.remove('hidden');
      if (this.inputField) this.inputField.value = '';
    } else {
      this.inputContainer?.classList.add('hidden');
    }
  }

  public getInputValue(): number {
    return this.inputField ? parseInt(this.inputField.value, 10) : 0;
  }

  public addPrimaryButton(text: string, onClick: (amount: number) => void): void {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('btn', 'btn-primary');
    button.onclick = () => {
      const amount = this.getInputValue();
      onClick(amount);
    };
    this.primaryButtons?.appendChild(button);
  }

  public addActionCard(card: HTMLElement): void {
    this.content?.appendChild(card);
  }

    public addSecondaryButton(label: string, icon: string, isPrimary: boolean, onClick: (e: MouseEvent) => void, customClass?: string): void {
      const btn = document.createElement('button');
      btn.className = `btn ${isPrimary ? 'btn-primary' : 'btn-secondary'} ${customClass || ''}`;
      btn.innerHTML = `<i class="material-icons">${icon}</i> <span>${label}</span>`;
      btn.onclick = onClick;
  
      if (isPrimary) {
          this.primaryButtons?.appendChild(btn);
      } else {
          this.secondaryActions?.appendChild(btn);
      }
    }
  public setContent(element: HTMLElement): void {
    if (this.content) {
        this.content.innerHTML = '';
        this.content.appendChild(element);
    }
  }
}

export class PlayerStatsModal extends Modal {
  private cash: HTMLElement | null;
  private savings: HTMLElement | null;
  private loan: HTMLElement | null;
  private happiness: HTMLElement | null;
  private education: HTMLElement | null;
  private career: HTMLElement | null;
  private car: HTMLElement | null;
  private time: HTMLElement | null;

  constructor() {
    super('player-stats-modal-overlay', 'player-stats-modal-title');
    this.cash = document.getElementById('modal-cash');
    this.savings = document.getElementById('modal-savings');
    this.loan = document.getElementById('modal-loan');
    this.happiness = document.getElementById('modal-happiness');
    this.education = document.getElementById('modal-education');
    this.career = document.getElementById('modal-career');
    this.car = document.getElementById('modal-car');
    this.time = document.getElementById('modal-time');
    
    const closeBtn = document.getElementById('player-stats-modal-close');
    closeBtn?.addEventListener('click', () => this.hide());

    const modalElement = document.getElementById('player-stats-modal');
    if (modalElement) this.addSwipeToClose(modalElement);
  }

  public update(player: PlayerState, COURSES: Course[], JOBS: Job[], playerIndex: number): void {
    const modalElement = document.getElementById('player-stats-modal');
    if (modalElement) modalElement.className = playerIndex === 1 ? 'player-1' : 'player-2';
    
    if (this.cash) this.cash.textContent = `$${player.cash}`;
    if (this.savings) this.savings.textContent = `$${player.savings}`;
    if (this.loan) this.loan.textContent = `$${player.loan}`;
    if (this.happiness) this.happiness.textContent = player.happiness.toString();
    
    const course = COURSES.find((c: Course) => c.educationMilestone === player.educationLevel);
    if (this.education) this.education.textContent = course ? course.name : 'None';
    
    const job = JOBS.find((j: Job) => j.level === player.careerLevel);
    if (this.career) this.career.textContent = job ? job.title : 'Unemployed';
    
    if (this.car) this.car.textContent = player.hasCar ? 'Yes' : 'No';
    if (this.time) this.time.textContent = `${player.time} hours`;
  }
}

export class IntelTerminalModal extends Modal {
  private entries: HTMLElement | null;

  constructor() {
    super('intel-terminal-overlay');
    this.entries = document.getElementById('terminal-entries');
    
    const closeBtn = document.getElementById('intel-terminal-close');
    closeBtn?.addEventListener('click', () => this.hide());
  }

  public updateEntries(logEntries: LogMessage[]): void {
    if (this.entries) {
      this.entries.innerHTML = '';
      
      logEntries.forEach((message: LogMessage) => {
        const p = document.createElement('p');
        if (typeof message === 'string') {
          p.textContent = message;
        } else {
          p.textContent = message.text;
          p.className = `log-${message.category}`;
        }
        this.entries?.appendChild(p);
      });

      const content = this.entries.parentElement;
      if (content) {
        setTimeout(() => {
          content.scrollTop = content.scrollHeight;
        }, 50);
      }
    }
  }
}

export class TurnSummaryModal extends Modal {
  private eventList: HTMLElement | null;
  private subtitle: HTMLElement | null;
  private cashTotal: HTMLElement | null;
  private happinessTotal: HTMLElement | null;
  private nextWeekBtn: HTMLElement | null;

  constructor() {
    super('turn-summary-modal', undefined, false);
    this.eventList = document.getElementById('event-list');
    this.subtitle = document.getElementById('summary-subtitle');
    this.cashTotal = document.getElementById('summary-cash-total');
    this.happinessTotal = document.getElementById('summary-happiness-total');
    this.nextWeekBtn = document.getElementById('btn-start-next-week');
  }

  public update(summary: TurnSummary, onNextWeek: () => void): void {
    if (this.subtitle) this.subtitle.textContent = `${summary.playerName.toUpperCase()} - WEEK ${summary.week} REPORT`;
    
    if (this.cashTotal) {
        this.cashTotal.textContent = (summary.totals.cashChange >= 0 ? '+$' : '-$') + Math.abs(summary.totals.cashChange).toLocaleString();
        this.cashTotal.className = `total-value ${summary.totals.cashChange >= 0 ? 'log-success' : 'log-error'}`;
    }
    
    if (this.happinessTotal) {
        this.happinessTotal.textContent = (summary.totals.happinessChange >= 0 ? '+' : '') + summary.totals.happinessChange;
        this.happinessTotal.className = `total-value ${summary.totals.happinessChange >= 0 ? 'log-success' : 'log-error'}`;
    }

    if (this.eventList) {
        this.eventList.innerHTML = '';
        
        summary.events.forEach((event, index: number) => {
          const card = document.createElement('div');
          card.className = `event-card ${event.type}`;
          
          const valueText = (event.value >= 0 ? '+' : '-') + Math.abs(event.value).toLocaleString() + (event.unit === '$' ? '$' : ' ' + event.unit);
          
          card.innerHTML = `
            <div class="event-icon-circle">
              <i class="material-icons">${event.icon}</i>
            </div>
            <div class="event-info">
              <span class="event-name">${event.label}</span>
              <span class="event-amount">${valueText}</span>
            </div>
          `;
          
          this.eventList?.appendChild(card);
          
          setTimeout(() => {
            card.classList.add('animate-in');
          }, 100 * (index + 1));
        });
    }

    if (this.nextWeekBtn) {
        this.nextWeekBtn.onclick = onNextWeek;
    }

    setTimeout(() => {
      if (this.cashTotal) this.animateValue(this.cashTotal, 0, summary.totals.cashChange, 1000, '$');
      if (this.happinessTotal) this.animateValue(this.happinessTotal, 0, summary.totals.happinessChange, 1000);
    }, 500);
  }

  private animateValue(obj: HTMLElement, start: number, end: number, duration: number, prefix = '') {
    if (!obj) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      
      const isPositive = current >= 0;
      const sign = isPositive ? '+' : '-';
      const absValue = Math.abs(current).toLocaleString();
      
      if (prefix === '$') {
        obj.textContent = `${sign}$${absValue}`;
      } else {
        obj.textContent = `${sign}${absValue}`;
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
}

export class GraduationModal extends Modal {
  private subtitle: HTMLElement | null;
  private degreeName: HTMLElement | null;
  private rewardText: HTMLElement | null;
  private dismissButton: HTMLElement | null;

  constructor() {
    super('graduation-modal', undefined, false);
    this.subtitle = document.getElementById('graduation-subtitle');
    this.degreeName = document.getElementById('graduated-degree-name');
    this.rewardText = document.getElementById('graduation-reward-text');
    this.dismissButton = document.getElementById('btn-graduation-dismiss');

    if (this.dismissButton) {
      this.dismissButton.addEventListener('click', () => this.hide());
    }
  }

  public showGraduation(player: PlayerState, course: Course): void {
    if (this.subtitle) this.subtitle.textContent = `${player.name.toUpperCase()} HAS GRADUATED!`;
    if (this.degreeName) this.degreeName.textContent = course.name;
    
    if (this.rewardText) {
        if (player.educationLevel < 5) {
            this.rewardText.textContent = `Level ${player.educationLevel + 1} Careers are now unlocked at the Employment Agency. Keep studying for even higher wages!`;
        } else {
            this.rewardText.textContent = `You have reached the pinnacle of education! All top-tier career paths are now fully accessible to you.`;
        }
    }

    super.show();
  }
}
