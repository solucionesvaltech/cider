import {
  Directive, ElementRef, HostListener, Input, OnChanges, Renderer2, SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[appCard3dTilt]'
})
export class Card3dTiltDirective implements OnChanges {
  @Input() tiltEnabled = true;
  @Input() maxTilt = 14;
  @Input() perspective = 1100;
  @Input() glare = true;

  private reduceMotion = false;

  constructor(private host: ElementRef<HTMLElement>, private renderer: Renderer2) {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    this.renderer.setStyle(this.host.nativeElement, 'transform-style', 'preserve-3d');
    this.renderer.setStyle(this.host.nativeElement, 'will-change', 'transform');
    this.renderer.setStyle(this.host.nativeElement, 'transition',
      'transform 250ms cubic-bezier(.2,.85,.4,1.2), box-shadow 200ms ease-out');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tiltEnabled'] && !this.tiltEnabled) {
      this.resetTransform();
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.tiltEnabled || this.reduceMotion) {
      return;
    }
    const el = this.host.nativeElement;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;
    const rotY = (px - 0.5) * 2 * this.maxTilt;
    const rotX = -(py - 0.5) * 2 * this.maxTilt;
    this.renderer.setStyle(el, 'transform',
      `perspective(${this.perspective}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.04)`);
    if (this.glare) {
      const gx = (px * 100).toFixed(1);
      const gy = (py * 100).toFixed(1);
      this.renderer.setStyle(el, 'box-shadow',
        `0 25px 50px rgba(0,0,0,0.5), inset 0 0 80px rgba(255,255,255,0.06)`);
      this.renderer.setStyle(el, 'background-image',
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.18), transparent 55%)`);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.resetTransform();
  }

  private resetTransform(): void {
    const el = this.host.nativeElement;
    this.renderer.setStyle(el, 'transform', 'perspective(1100px) rotateX(0) rotateY(0) scale(1)');
    this.renderer.removeStyle(el, 'background-image');
    this.renderer.setStyle(el, 'box-shadow', '0 16px 30px rgba(0,0,0,0.35)');
  }
}
