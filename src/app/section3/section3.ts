// import { Component } from '@angular/core';
// import { gsap } from 'gsap';
// import ScrollTrigger from 'gsap/ScrollTrigger';
// @Component({
//   selector: 'app-section3',
//   imports: [],
//   templateUrl: './section3.html',
//   styleUrl: './section3.scss',
// })
// export class Section3 {
//   ngAfterViewInit() {
//     gsap.registerPlugin(ScrollTrigger);
//     gsap.to("#section3-homes", {
//       scrollTrigger: {
//         trigger: "#section3-homes",
//         start: "top top",
//         end: () => "+=4500",
//         // scrub: 1,
//         pin: true,
//         anticipatePin: 1,
//         markers: true
//       },
//       x: 100,
//     });
//   }
// }
import { Component, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
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

  constructor(private zone: NgZone) { }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const smoother = ScrollSmoother.get() as any;
      const scrollerEl = smoother?.wrapper(); // ✅ نفس scroller

      if (!scrollerEl) return;

      this.ctx = gsap.context(() => {
        gsap.to("#section3-homes", {
          x: 100,
          scrollTrigger: {
            trigger: "#section3-homes",
            scroller: scrollerEl,      // ✅ أهم سطر
            start: "top top",
            end: () => "+=4500",       // ✅ end أوضح
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            markers: true,
          },
        });
      });
    });
  }

  ngOnDestroy() {
    this.ctx?.revert(); // ✅ ينضف pin/triggers كويس
  }
}
