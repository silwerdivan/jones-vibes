export default abstract class BaseComponent<T = unknown> {
    protected element: HTMLElement;
    protected mounted: boolean = false;

    constructor(tagName: string, className?: string, id?: string) {
        this.element = document.createElement(tagName);
        if (className) {
            this.element.className = className;
        }
        if (id) {
            this.element.id = id;
        }
    }

    abstract render(state: T): void;

    getElement(): HTMLElement {
        return this.element;
    }

    mount(parent: HTMLElement): void {
        if (this.mounted) {
            return;
        }
        parent.appendChild(this.element);
        this.mounted = true;
    }

    unmount(): void {
        if (!this.mounted || !this.element.parentElement) {
            return;
        }
        this.element.parentElement.removeChild(this.element);
        this.mounted = false;
    }

    isMounted(): boolean {
        return this.mounted;
    }
}
