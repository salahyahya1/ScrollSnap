import { Component, AfterViewInit, OnDestroy, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollSmoother from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

@Component({
  selector: 'app-section3',
  templateUrl: './section3.html',
  styleUrl: './section3.scss',
})
export class Section3 implements AfterViewInit, OnDestroy {
  private ctx?: gsap.Context;
  private isBrowser: boolean;

  constructor(
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    this.zone.runOutsideAngular(() => {
      this.waitForSmoother((smoother) => {
        this.ctx = gsap.context(() => {
          gsap.to("#section3-homes", {
            x: 100,
            scrollTrigger: {
              trigger: "#section3-homes",
              start: "top top",
              end: () => "+=4500",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              markers: true,
            },
          });
          ScrollTrigger.refresh();
        });
      });
    });
  }

  private waitForSmoother(cb: (s: any) => void) {
    const start = performance.now();
    const tick = () => {
      const s = ScrollSmoother.get() as any;
      if (s) return cb(s);
      if (performance.now() - start < 3000) {
        requestAnimationFrame(tick);
      }
    };
    tick();
  }

  ngOnDestroy() {
    this.ctx?.revert();
  }
}

