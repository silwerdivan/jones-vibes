class ClockVisualization {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }

        // Default options
        this.options = {
            size: options.size || 60,
            strokeWidth: options.strokeWidth || 8,
            backgroundColor: options.backgroundColor || 'rgba(0, 255, 255, 0.2)',
            foregroundColor: options.foregroundColor || '#00FFFF',
            textColor: options.textColor || '#FFFFFF',
            fontSize: options.fontSize || '14px',
            fontFamily: options.fontFamily || 'VT323, monospace',
            showNumeric: options.showNumeric !== undefined ? options.showNumeric : true,
            animationDuration: options.animationDuration || 500,
            ...options
        };

        this.currentHours = 24;
        this.init();
    }

    init() {
        // Create the SVG element for the clock
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', this.options.size);
        this.svg.setAttribute('height', this.options.size);
        this.svg.setAttribute('viewBox', `0 0 ${this.options.size} ${this.options.size}`);
        this.svg.style.display = 'block';

        // Create background circle
        this.backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.backgroundCircle.setAttribute('cx', this.options.size / 2);
        this.backgroundCircle.setAttribute('cy', this.options.size / 2);
        this.backgroundCircle.setAttribute('r', (this.options.size / 2) - (this.options.strokeWidth / 2));
        this.backgroundCircle.setAttribute('fill', 'none');
        this.backgroundCircle.setAttribute('stroke', this.options.backgroundColor);
        this.backgroundCircle.setAttribute('stroke-width', this.options.strokeWidth);
        this.svg.appendChild(this.backgroundCircle);

        // Create foreground circle (the pie chart)
        this.foregroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.foregroundCircle.setAttribute('cx', this.options.size / 2);
        this.foregroundCircle.setAttribute('cy', this.options.size / 2);
        this.foregroundCircle.setAttribute('r', (this.options.size / 2) - (this.options.strokeWidth / 2));
        this.foregroundCircle.setAttribute('fill', 'none');
        this.foregroundCircle.setAttribute('stroke', this.options.foregroundColor);
        this.foregroundCircle.setAttribute('stroke-width', this.options.strokeWidth);
        this.foregroundCircle.setAttribute('stroke-dasharray', '0 1000');
        this.foregroundCircle.setAttribute('transform', `rotate(-90 ${this.options.size / 2} ${this.options.size / 2})`);
        this.foregroundCircle.style.transition = `stroke-dasharray ${this.options.animationDuration}ms ease-in-out`;
        this.svg.appendChild(this.foregroundCircle);

        // Create text element for numeric time display
        if (this.options.showNumeric) {
            this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this.textElement.setAttribute('x', this.options.size / 2);
            this.textElement.setAttribute('y', this.options.size / 2);
            this.textElement.setAttribute('text-anchor', 'middle');
            this.textElement.setAttribute('dominant-baseline', 'middle');
            this.textElement.setAttribute('fill', this.options.textColor);
            this.textElement.setAttribute('font-size', this.options.fontSize);
            this.textElement.setAttribute('font-family', this.options.fontFamily);
            this.textElement.textContent = '24h';
            this.svg.appendChild(this.textElement);
        }

        // Clear container and append the SVG
        this.container.innerHTML = '';
        this.container.appendChild(this.svg);

        // Set initial state
        this.updateTime(24);
    }

    updateTime(hours) {
        // Ensure hours is within valid range
        hours = Math.max(0, Math.min(24, hours));
        this.currentHours = hours;

        // Calculate the circumference
        const radius = (this.options.size / 2) - (this.options.strokeWidth / 2);
        const circumference = 2 * Math.PI * radius;

        // Calculate the filled portion (24 hours = empty, 0 hours = full)
        const filledPercentage = (24 - hours) / 24;
        const dashLength = circumference * filledPercentage;
        const gapLength = circumference - dashLength;

        // Update the stroke-dasharray to create the pie chart effect
        this.foregroundCircle.setAttribute('stroke-dasharray', `${dashLength} ${gapLength}`);

        // Update the text if enabled
        if (this.options.showNumeric && this.textElement) {
            this.textElement.textContent = `${hours}h`;
        }

        // Calculate color intensity based on time remaining (darker as time depletes)
        const intensityPercentage = 1 - (hours / 24); // 0 when full time, 1 when no time
        const darkerColor = this.getDarkerColor(this.options.foregroundColor, intensityPercentage);
        
        // Apply the darker color to the foreground circle
        this.foregroundCircle.setAttribute('stroke', darkerColor);
        
        // Also update text color to match for consistency
        if (this.options.showNumeric && this.textElement) {
            this.textElement.setAttribute('fill', darkerColor);
        }
    }

    // Helper method to calculate a darker version of a color
    getDarkerColor(color, intensity) {
        // If intensity is 0, return the original color
        if (intensity === 0) return color;
        
        // Parse the color to RGB values
        let r, g, b;
        
        if (color.startsWith('#')) {
            // Hex color format
            const hex = color.substring(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else if (color.startsWith('rgb')) {
            // RGB color format
            const matches = color.match(/\d+/g);
            r = parseInt(matches[0]);
            g = parseInt(matches[1]);
            b = parseInt(matches[2]);
        } else {
            // Default to cyan for named colors
            return color;
        }
        
        // Calculate darker values by reducing each component
        const darknessFactor = 1 - (intensity * 0.7); // Max 70% darker
        r = Math.floor(r * darknessFactor);
        g = Math.floor(g * darknessFactor);
        b = Math.floor(b * darknessFactor);
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Method to get current hours
    getCurrentHours() {
        return this.currentHours;
    }

    // Method to destroy the component
    destroy() {
        if (this.container && this.svg) {
            this.container.removeChild(this.svg);
        }
    }
}

export default ClockVisualization;