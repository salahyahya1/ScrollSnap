// import { ChangeDetectorRef, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
// import { Section1 } from "../section1/section1";
// import { Section2 } from "../section2/section2";
// import { Section3 } from "../section3/section3";
// import { Section4 } from "../section4/section4";
// import { Section5 } from "../section5/section5";
// import { Section6 } from "../section6/section6";
// import { Section7 } from "../section7/section7";
// import { Section8 } from "../section8/section8";
// import { BehaviorSubject } from 'rxjs';
// import { isPlatformBrowser } from '@angular/common';
// export type SectionItem = { id: string; labelKey?: string; targetId?: string; wholeSectionId?: string };
// import gsap from 'gsap';
// import ScrollTrigger from 'gsap/ScrollTrigger';
// import ScrollSmoother from 'gsap/ScrollSmoother';


// gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
// @Component({
//   selector: 'app-home',
//   imports: [Section1, Section2, Section3, Section4, Section5, Section6, Section7, Section8],
//   templateUrl: './home.html',
//   styleUrl: './home.scss',
// })
// export class Home {
//   private visibilitySubject = new BehaviorSubject<'visible' | 'invisible'>('visible');
//   visibility$ = this.visibilitySubject.asObservable();
//   visibilityState: 'visible' | 'invisible' = 'visible';

//   isMobile!: boolean;
//   isBrowser: boolean;

//   private ctx?: gsap.Context;

//   // ---- Snap system (Desktop only) ----
//   private snapPoints: Array<{ el: HTMLElement; y: number }> = [];
//   private snapTween?: gsap.core.Tween;
//   private isSnapping = false;
//   private isRefreshing = false;

//   // لو عندك Navbar ثابتة فوق وبتغطي بداية السكشن جرّب 80
//   private readonly NAV_OFFSET_DESKTOP = 80;

//   // MutationObserver (للـ @defer)
//   private observer?: MutationObserver;
//   private lastHomeHeight = 0;
//   private refreshTimer: any;

//   constructor(
//     @Inject(PLATFORM_ID) private platformId: Object,
//     private ngZone: NgZone,
//     private cdr: ChangeDetectorRef,
//   ) {
//     this.isBrowser = isPlatformBrowser(this.platformId);
//   }

//   ngOnInit() {
//     if (!this.isBrowser) return;
//     this.isMobile = window.matchMedia('(max-width: 767px)').matches;
//   }

//   ngAfterViewInit(): void {
//     if (!this.isBrowser) return;

//     // ✅ Mobile: بدون Snap
//     if (this.isMobile) {
//       setTimeout(() => this.observeSectionsMobile(), 750);
//       return;
//     }

//     this.ngZone.runOutsideAngular(() => {
//       this.waitForSmoother((smoother) => {
//         this.ctx = gsap.context(() => {
//           this.initDesktop(smoother);


//           ScrollTrigger.create({
//             trigger: '#home',
//             scroller: smoother.wrapper(),
//             start: 'top top',
//             end: 'bottom bottom',
//             onEnter: () => {
//               console.log('home');
//             },
//             onEnterBack: () => {
//               console.log('home');
//             },
//             onLeaveBack: () => {
//               console.log('home');
//             }
//           });
//         });
//       });
//     });
//   }

//   /**
//    * ✅ مهم: Home ممكن يشتغل قبل Layout، فلازم نستنى ScrollSmoother.get()
//    */
//   private waitForSmoother(cb: (s: any) => void) {
//     const start = performance.now();
//     const tick = () => {
//       const s = ScrollSmoother.get() as any;
//       if (s) return cb(s);
//       if (performance.now() - start < 3000) requestAnimationFrame(tick);
//     };
//     tick();
//   }

//   private initDesktop(smoother: any) {
//     const scroller = smoother.wrapper();

//     // 1) Registry للـ section indicator
//     const sections: SectionItem[] = [
//       { id: 'section1-home', labelKey: 'HOME.INDECATORS.ABOUT', wholeSectionId: 'section1-home' },
//       { id: 'section2-home', labelKey: 'HOME.INDECATORS.FACTS', wholeSectionId: 'section2-home' },
//       { id: 'section3-home', labelKey: 'HOME.INDECATORS.WHY', wholeSectionId: 'section3-home' },
//       { id: 'section4-home', labelKey: 'HOME.INDECATORS.APPS', wholeSectionId: 'section4-home' },
//       { id: 'section5-home', labelKey: 'HOME.INDECATORS.TESTIMONIALS', wholeSectionId: 'section5-home' },
//       { id: 'section6-home', labelKey: 'HOME.INDECATORS.INTEGRATIONS', wholeSectionId: 'section6-home' },
//       { id: 'section7-home', labelKey: 'HOME.INDECATORS.PLANS', wholeSectionId: 'section7-home' },
//       { id: 'section8-home', labelKey: 'HOME.INDECATORS.CONTACT', wholeSectionId: 'section8-home' },
//     ];


//     // 2) Navbar colors triggers (مع scroller بتاع smoother)
//     this.observeSections(scroller);


//     // 4) Snap on scrollEnd (أثبت حل مع ScrollSmoother + أطوال مختلفة)
//     // ScrollTrigger.addEventListener('scrollStart', this.onScrollStart);


//     // 5) Observer للـ @defer changes
//     this.initMutationObserver();

//     // 6) Resize
//     window.addEventListener('resize', this.onResize);

//     // أول refresh بعد ما ثبتنا كل حاجة
//     this.safeRefresh();
//   }

//   private safeRefresh() {
//     if (this.isRefreshing) return;

//     const smoother = ScrollSmoother.get() as any;
//     if (!smoother) return;

//     this.isRefreshing = true;


//     // refresh
//     smoother.refresh();
//     ScrollTrigger.refresh();


//     this.isRefreshing = false;
//   }

//   /**
//    * ✅ MutationObserver: لو @defer غيّر ارتفاع الصفحة → نعمل refresh throttled
//    */
//   private initMutationObserver() {
//     const homeEl = document.getElementById('home');
//     if (!homeEl) return;

//     this.lastHomeHeight = homeEl.scrollHeight;

//     this.observer = new MutationObserver(() => {
//       const h = homeEl.scrollHeight;
//       if (Math.abs(h - this.lastHomeHeight) < 5) return; // تجاهل تغييرات بسيطة
//       this.lastHomeHeight = h;

//       if (this.refreshTimer) clearTimeout(this.refreshTimer);
//       this.refreshTimer = setTimeout(() => this.safeRefresh(), 200);
//     });

//     this.observer.observe(homeEl, { childList: true, subtree: true });
//   }

//   // ✅ Desktop Navbar Color Observer
//   private observeSections(scroller: HTMLElement) {
//     const sections = gsap.utils.toArray<HTMLElement>('.panel');
//     const smoother = ScrollSmoother.get() as any;
//     sections.forEach((section, index) => {
//       const textColor = section.dataset['textcolor'] || 'var(--primary)';
//       const bgColor = section.dataset['bgcolor'] || 'var(--white)';

//       ScrollTrigger.create({
//         trigger: section,
//         scroller,
//         start: 'top 90%',
//         end: 'bottom 50%',
//         markers: true,
//         onEnter: () => {
//           // console.log("enter:", section.id);

//           if (index === 0) {
//           }
//           else {
//             // console.log("#section" + (index));

//             // gsap.to(smoother, { duration: 1, scrollTo: { y: "#section" + (index), offsetY: 120 } });
//             smoother.scrollTo("#section" + (index + 1), { duration: 1 });
//           }
//         },
//         onEnterBack: () => {
//           // console.log("enterBack:", section.id);
//           // console.log("enterBack:", index);

//         },
//         onLeaveBack: () => {
//           // console.log("leaveBack:", section.id);
//           // console.log("leaveBack:", index);
//           if (index === 0) {
//           }
//         },
//         onLeave: () => {
//           // console.log("leave:", section.id);
//           // console.log("leave:", index);
//           // if (index === 0) {
//           // }
//           // else {
//           console.log("#section" + (index - 1 === -1 ? 0 : index - 1));

//           // gsap.to(smoother, { duration: 1, scrollTo: { y: "#section" + (index), offsetY: 120 } });
//           // smoother.scrollTo("#section" + (index - 1 === -1 ? 0 : index - 1), { duration: 1 });
//           // }
//         },
//       });
//     });
//   }

//   // ✅ Mobile Navbar Color Observer
//   private observeSectionsMobile() {
//     const sections = gsap.utils.toArray<HTMLElement>('.panel');

//     sections.forEach((section, index) => {
//       const textColor = section.dataset['textcolor'] || 'var(--primary)';
//       const bgColor = section.dataset['bgcolor'] || 'var(--white)';

//       ScrollTrigger.create({
//         trigger: section,
//         start: 'top 10%',
//         end: 'bottom 50%',
//         onEnter: () => {

//         },
//         onEnterBack: () => {
//         },
//         onLeaveBack: () => {
//           if (index === 0) {
//           }
//         }
//       });
//     });
//   }

//   private onResize = () => {
//     // refresh بعد resize عشان points تتظبط
//     if (this.refreshTimer) clearTimeout(this.refreshTimer);
//     this.refreshTimer = setTimeout(() => this.safeRefresh(), 120);

//     this.ngZone.run(() => {
//       this.cdr.detectChanges();
//     });
//   };


//   ngOnDestroy(): void {

//     if (this.isBrowser) {
//       try {
//         window.removeEventListener('resize', this.onResize);
//       } catch { }

//       if (this.observer) this.observer.disconnect();
//       if (this.refreshTimer) clearTimeout(this.refreshTimer);

//       this.ctx?.revert();
//     }
//   }
// }
// import { ChangeDetectorRef, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
// import { Section1 } from "../section1/section1";
// import { Section2 } from "../section2/section2";
// import { Section3 } from "../section3/section3";
// import { Section4 } from "../section4/section4";
// import { Section5 } from "../section5/section5";
// import { Section6 } from "../section6/section6";
// import { Section7 } from "../section7/section7";
// import { Section8 } from "../section8/section8";
// import { BehaviorSubject } from 'rxjs';
// import { isPlatformBrowser } from '@angular/common';
// export type SectionItem = { id: string; labelKey?: string; targetId?: string; wholeSectionId?: string };
// import gsap from 'gsap';
// import ScrollTrigger from 'gsap/ScrollTrigger';
// import ScrollSmoother from 'gsap/ScrollSmoother';

// gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// @Component({
//   selector: 'app-home',
//   imports: [Section1, Section2, Section3, Section4, Section5, Section6, Section7, Section8],
//   templateUrl: './home.html',
//   styleUrl: './home.scss',
// })
// export class Home {
//   private visibilitySubject = new BehaviorSubject<'visible' | 'invisible'>('visible');
//   visibility$ = this.visibilitySubject.asObservable();
//   visibilityState: 'visible' | 'invisible' = 'visible';

//   isMobile!: boolean;
//   isBrowser: boolean;

//   private ctx?: gsap.Context;

//   private isRefreshing = false;

//   // MutationObserver (للـ @defer)
//   private observer?: MutationObserver;
//   private lastHomeHeight = 0;
//   private refreshTimer: any;

//   constructor(
//     @Inject(PLATFORM_ID) private platformId: Object,
//     private ngZone: NgZone,
//     private cdr: ChangeDetectorRef,
//   ) {
//     this.isBrowser = isPlatformBrowser(this.platformId);
//   }

//   ngOnInit() {
//     if (!this.isBrowser) return;
//     this.isMobile = window.matchMedia('(max-width: 767px)').matches;
//   }

//   ngAfterViewInit(): void {
//     if (!this.isBrowser) return;

//     // ✅ Mobile: بدون أي Snap
//     if (this.isMobile) {
//       setTimeout(() => this.observeSectionsMobile(), 750);
//       return;
//     }

//     this.ngZone.runOutsideAngular(() => {
//       this.waitForSmoother((smoother) => {
//         this.ctx = gsap.context(() => {
//           this.initDesktop(smoother);

//           ScrollTrigger.create({
//             trigger: '#home',
//             scroller: smoother.wrapper(),
//             start: 'top top',
//             end: 'bottom bottom',
//             onEnter: () => {
//               console.log('home');
//             },
//             onEnterBack: () => {
//               console.log('home');
//             },
//             onLeaveBack: () => {
//               console.log('home');
//             }
//           });
//         });
//       });
//     });
//   }

//   /**
//    * ✅ مهم: Home ممكن يشتغل قبل Layout، فلازم نستنى ScrollSmoother.get()
//    */
//   private waitForSmoother(cb: (s: any) => void) {
//     const start = performance.now();
//     const tick = () => {
//       const s = ScrollSmoother.get() as any;
//       if (s) return cb(s);
//       if (performance.now() - start < 3000) requestAnimationFrame(tick);
//     };
//     tick();
//   }

//   private initDesktop(smoother: any) {
//     const scroller = smoother.wrapper();

//     // 1) Registry للـ section indicator
//     const sections: SectionItem[] = [
//       { id: 'section1-home', labelKey: 'HOME.INDECATORS.ABOUT', wholeSectionId: 'section1-home' },
//       { id: 'section2-home', labelKey: 'HOME.INDECATORS.FACTS', wholeSectionId: 'section2-home' },
//       { id: 'section3-home', labelKey: 'HOME.INDECATORS.WHY', wholeSectionId: 'section3-home' },
//       { id: 'section4-home', labelKey: 'HOME.INDECATORS.APPS', wholeSectionId: 'section4-home' },
//       { id: 'section5-home', labelKey: 'HOME.INDECATORS.TESTIMONIALS', wholeSectionId: 'section5-home' },
//       { id: 'section6-home', labelKey: 'HOME.INDECATORS.INTEGRATIONS', wholeSectionId: 'section6-home' },
//       { id: 'section7-home', labelKey: 'HOME.INDECATORS.PLANS', wholeSectionId: 'section7-home' },
//       { id: 'section8-home', labelKey: 'HOME.INDECATORS.CONTACT', wholeSectionId: 'section8-home' },
//     ];

//     // 2) Navbar colors triggers (مع scroller بتاع smoother)
//     this.observeSections(scroller);

//     // 3) Observer للـ @defer changes
//     this.initMutationObserver();

//     // 4) Resize
//     window.addEventListener('resize', this.onResize);

//     // أول refresh بعد ما ثبتنا كل حاجة
//     this.safeRefresh();
//   }

//   private safeRefresh() {
//     if (this.isRefreshing) return;

//     const smoother = ScrollSmoother.get() as any;
//     if (!smoother) return;

//     this.isRefreshing = true;

//     smoother.refresh();
//     ScrollTrigger.refresh();

//     this.isRefreshing = false;
//   }

//   /**
//    * ✅ MutationObserver: لو @defer غيّر ارتفاع الصفحة → نعمل refresh throttled
//    */
//   private initMutationObserver() {
//     const homeEl = document.getElementById('home');
//     if (!homeEl) return;

//     this.lastHomeHeight = homeEl.scrollHeight;

//     this.observer = new MutationObserver(() => {
//       const h = homeEl.scrollHeight;
//       if (Math.abs(h - this.lastHomeHeight) < 5) return;
//       this.lastHomeHeight = h;

//       if (this.refreshTimer) clearTimeout(this.refreshTimer);
//       this.refreshTimer = setTimeout(() => this.safeRefresh(), 200);
//     });

//     this.observer.observe(homeEl, { childList: true, subtree: true });
//   }

//   // ✅ Desktop Navbar Color Observer
//   private observeSections(scroller: HTMLElement) {
//     const sections = gsap.utils.toArray<HTMLElement>('.panel');
//     const smoother = ScrollSmoother.get() as any;

//     sections.forEach((section, index) => {
//       const textColor = section.dataset['textcolor'] || 'var(--primary)';
//       const bgColor = section.dataset['bgcolor'] || 'var(--white)';

//       ScrollTrigger.create({
//         trigger: section,
//         scroller,
//         start: 'top 90%',
//         end: 'bottom 50%',
//         markers: true,
//         onEnter: () => {
//           if (index === 0) {
//           } else {
//             // smoother.scrollTo("#section" + (index + 1), { duration: 1 });
//           }
//         },
//         onEnterBack: () => {
//         },
//         onLeaveBack: () => {
//           if (index === 0) {
//           }
//         },
//         onLeave: () => {
//           // console.log("#section" + (index - 1 === -1 ? 0 : index - 1));
//         },
//       });
//     });
//   }

//   // ✅ Mobile Navbar Color Observer
//   private observeSectionsMobile() {
//     const sections = gsap.utils.toArray<HTMLElement>('.panel');

//     sections.forEach((section, index) => {
//       const textColor = section.dataset['textcolor'] || 'var(--primary)';
//       const bgColor = section.dataset['bgcolor'] || 'var(--white)';

//       ScrollTrigger.create({
//         trigger: section,
//         start: 'top 10%',
//         end: 'bottom 50%',
//         onEnter: () => {
//         },
//         onEnterBack: () => {
//         },
//         onLeaveBack: () => {
//           if (index === 0) {
//           }
//         }
//       });
//     });
//   }

//   private onResize = () => {
//     if (this.refreshTimer) clearTimeout(this.refreshTimer);
//     this.refreshTimer = setTimeout(() => this.safeRefresh(), 120);

//     this.ngZone.run(() => {
//       this.cdr.detectChanges();
//     });
//   };

//   ngOnDestroy(): void {
//     if (this.isBrowser) {
//       try {
//         window.removeEventListener('resize', this.onResize);
//       } catch { }

//       if (this.observer) this.observer.disconnect();
//       if (this.refreshTimer) clearTimeout(this.refreshTimer);

//       this.ctx?.revert();
//     }
//   }
// }
import { ChangeDetectorRef, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { Section1 } from "../section1/section1";
import { Section2 } from "../section2/section2";
import { Section3 } from "../section3/section3";
import { Section4 } from "../section4/section4";
import { Section5 } from "../section5/section5";
import { Section6 } from "../section6/section6";
import { Section7 } from "../section7/section7";
import { Section8 } from "../section8/section8";
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export type SectionItem = { id: string; labelKey?: string; targetId?: string; wholeSectionId?: string };

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollSmoother from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

@Component({
  selector: 'app-home',
  imports: [Section1, Section2, Section3, Section4, Section5, Section6, Section7, Section8],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private visibilitySubject = new BehaviorSubject<'visible' | 'invisible'>('visible');
  visibility$ = this.visibilitySubject.asObservable();
  visibilityState: 'visible' | 'invisible' = 'visible';

  isMobile!: boolean;
  isBrowser: boolean;

  private ctx?: gsap.Context;

  private isRefreshing = false;

  // MutationObserver (للـ @defer)
  private observer?: MutationObserver;
  private lastHomeHeight = 0;
  private refreshTimer: any;

  // ---- NEW Directional Snap (Desktop only) ----
  private snapPositions: number[] = [];
  private snapFunc?: (value: number, direction?: number) => number;

  private snapObserver?: any;                 // ScrollTrigger.observe instance
  private snapTriggers: ScrollTrigger[] = []; // triggers used only to compute start/end

  private snapLockedUntil = 0;                // prevents snapping during programmatic scroll
  private readonly SNAP_STOP_DELAY = 0.5;

  private lockSnap(ms: number) {
    this.snapLockedUntil = Math.max(this.snapLockedUntil, performance.now() + ms);
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    this.isMobile = window.matchMedia('(max-width: 767px)').matches;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // ✅ Mobile: بدون Snap
    if (this.isMobile) {
      setTimeout(() => this.observeSectionsMobile(), 750);
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.waitForSmoother((smoother) => {
        this.ctx = gsap.context(() => {
          this.initDesktop(smoother);

          ScrollTrigger.create({
            trigger: '#home',
            scroller: smoother.wrapper(),
            start: 'top top',
            end: 'bottom bottom',
            onEnter: () => {
              console.log('home');
            },
            onEnterBack: () => {
              console.log('home');
            },
            onLeaveBack: () => {
              console.log('home');
            }
          });
        });
      });
    });
  }

  /**
   * ✅ مهم: Home ممكن يشتغل قبل Layout، فلازم نستنى ScrollSmoother.get()
   */
  private waitForSmoother(cb: (s: any) => void) {
    const start = performance.now();
    const tick = () => {
      const s = ScrollSmoother.get() as any;
      if (s) return cb(s);
      if (performance.now() - start < 3000) requestAnimationFrame(tick);
    };
    tick();
  }

  private initDesktop(smoother: any) {
    const scroller = smoother.wrapper();

    // 1) Registry للـ section indicator
    const sections: SectionItem[] = [
      { id: 'section1-home', labelKey: 'HOME.INDECATORS.ABOUT', wholeSectionId: 'section1-home' },
      { id: 'section2-home', labelKey: 'HOME.INDECATORS.FACTS', wholeSectionId: 'section2-home' },
      { id: 'section3-home', labelKey: 'HOME.INDECATORS.WHY', wholeSectionId: 'section3-home' },
      { id: 'section4-home', labelKey: 'HOME.INDECATORS.APPS', wholeSectionId: 'section4-home' },
      { id: 'section5-home', labelKey: 'HOME.INDECATORS.TESTIMONIALS', wholeSectionId: 'section5-home' },
      { id: 'section6-home', labelKey: 'HOME.INDECATORS.INTEGRATIONS', wholeSectionId: 'section6-home' },
      { id: 'section7-home', labelKey: 'HOME.INDECATORS.PLANS', wholeSectionId: 'section7-home' },
      { id: 'section8-home', labelKey: 'HOME.INDECATORS.CONTACT', wholeSectionId: 'section8-home' },
    ];

    // 2) Navbar colors triggers (مع scroller بتاع smoother)
    this.observeSections(scroller);

    // ✅ 3) NEW: Directional snap logic (uses existing smoother from Layout)
    this.initDirectionalSnap(smoother);

    // 4) Observer للـ @defer changes
    this.initMutationObserver();

    // 5) Resize
    window.addEventListener('resize', this.onResize);

    // أول refresh بعد ما ثبتنا كل حاجة
    this.safeRefresh();
  }

  private safeRefresh() {
    if (this.isRefreshing) return;

    const smoother = ScrollSmoother.get() as any;
    if (!smoother) return;

    this.isRefreshing = true;

    smoother.refresh();
    ScrollTrigger.refresh();

    // ✅ rebuild snap positions after refresh (important with @defer / resize)
    this.rebuildSnapPositions(smoother);

    this.isRefreshing = false;
  }

  /**
   * ✅ MutationObserver: لو @defer غيّر ارتفاع الصفحة → نعمل refresh throttled
   */
  private initMutationObserver() {
    const homeEl = document.getElementById('home');
    if (!homeEl) return;

    this.lastHomeHeight = homeEl.scrollHeight;

    this.observer = new MutationObserver(() => {
      const h = homeEl.scrollHeight;
      if (Math.abs(h - this.lastHomeHeight) < 5) return;
      this.lastHomeHeight = h;

      if (this.refreshTimer) clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(() => this.safeRefresh(), 200);
    });

    this.observer.observe(homeEl, { childList: true, subtree: true });
  }

  // ✅ Desktop Navbar Color Observer
  private observeSections(scroller: HTMLElement) {
    const sections = gsap.utils.toArray<HTMLElement>('.panel');
    const smoother = ScrollSmoother.get() as any;

    sections.forEach((section, index) => {
      const textColor = section.dataset['textcolor'] || 'var(--primary)';
      const bgColor = section.dataset['bgcolor'] || 'var(--white)';

      ScrollTrigger.create({
        trigger: section,
        scroller,
        start: 'top 90%',
        end: 'bottom 50%',
        markers: true,
        onEnter: () => {
          if (index === 0) {
          } else {
            // ✅ prevent snap fighting with programmatic scrollTo
            // this.lockSnap(1200);
            // smoother.scrollTo("#section" + (index + 1), { duration: 1 });
          }
        },
        onEnterBack: () => {
        },
        onLeaveBack: () => {
          if (index === 0) {
          }
        },
        onLeave: () => {
          // console.log("#section" + (index - 1 === -1 ? 0 : index - 1));
        },
      });
    });
  }

  // ✅ Mobile Navbar Color Observer
  private observeSectionsMobile() {
    const sections = gsap.utils.toArray<HTMLElement>('.panel');

    sections.forEach((section, index) => {
      const textColor = section.dataset['textcolor'] || 'var(--primary)';
      const bgColor = section.dataset['bgcolor'] || 'var(--white)';

      ScrollTrigger.create({
        trigger: section,
        start: 'top 10%',
        end: 'bottom 50%',
        onEnter: () => {
        },
        onEnterBack: () => {
        },
        onLeaveBack: () => {
          if (index === 0) {
          }
        }
      });
    });
  }

  // -----------------------
  // NEW Directional Snap
  // -----------------------
  private initDirectionalSnap(smoother: any) {
    // prevent double init
    if (this.snapObserver) return;

    const scroller = smoother.wrapper();
    const smootherST = smoother.scrollTrigger;

    // (اختياري) trigger عام زي سكربتك
    ScrollTrigger.create({
      scroller,
      start: "top top",
      end: "max",
    });

    this.snapObserver = ScrollTrigger.observe({
      target: scroller,
      onStop: () => {
        if (performance.now() < this.snapLockedUntil) return;
        if (!this.snapFunc) return;

        smoother.scrollTo(this.snapFunc(smootherST.scroll()), true);
      },
      onStopDelay: this.SNAP_STOP_DELAY
    });

    // initial build
    this.rebuildSnapPositions(smoother);
  }

  private rebuildSnapPositions(smoother: any) {
    const scroller = smoother.wrapper();

    // kill old calc triggers
    this.snapTriggers.forEach(t => t.kill());
    this.snapTriggers = [];
    this.snapPositions = [];

    // 👇 بدل "section" استخدم ".panel" (غيره لو عندك selector مختلف)
    const panels = gsap.utils.toArray<HTMLElement>('.panel');

    panels.forEach((panel) => {
      const st = ScrollTrigger.create({
        trigger: panel,
        scroller,
        start: "top top",
        refreshPriority: -1,
      });

      this.snapPositions.push(st.start, st.end);
      this.snapTriggers.push(st);
    });

    const finalPositions = Array.from(new Set(this.snapPositions)).sort((a, b) => a - b);
    this.snapFunc = this.getDirectionalSnapFunc(finalPositions);
  }

  private getDirectionalSnapFunc(snapIncrementOrArray: number[] | number) {
    const snap = gsap.utils.snap(snapIncrementOrArray as any);
    const a =
      Array.isArray(snapIncrementOrArray) &&
      (snapIncrementOrArray as number[]).slice(0).sort((x, y) => x - y);

    return a
      ? (value: number, direction?: number) => {
        let i: number;
        if (!direction) {
          return snap(value);
        }
        if (direction > 0) {
          value -= 1e-4; // to avoid rounding errors
          for (i = 0; i < a.length; i++) {
            if (a[i] >= value) {
              return a[i];
            }
          }
          return a[i - 1];
        } else {
          i = a.length;
          value += 1e-4;
          while (i--) {
            if (a[i] <= value) {
              return a[i];
            }
          }
        }
        return a[0];
      }
      : (value: number, direction?: number) => {
        const snapped = snap(value);
        return !direction ||
          Math.abs(snapped - value) < 0.001 ||
          ((snapped - value < 0) === (direction < 0))
          ? snapped
          : snap(
            direction < 0
              ? value - (snapIncrementOrArray as number)
              : value + (snapIncrementOrArray as number)
          );
      };
  }

  // -----------------------
  // Resize / Destroy
  // -----------------------
  private onResize = () => {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.safeRefresh(), 120);

    this.ngZone.run(() => {
      this.cdr.detectChanges();
    });
  };

  ngOnDestroy(): void {
    if (this.isBrowser) {
      try {
        window.removeEventListener('resize', this.onResize);
      } catch { }

      if (this.observer) this.observer.disconnect();
      if (this.refreshTimer) clearTimeout(this.refreshTimer);

      // ✅ snap cleanup
      try { this.snapObserver?.kill?.(); } catch { }
      this.snapTriggers.forEach(t => t.kill());
      this.snapTriggers = [];

      this.ctx?.revert();
    }
  }
}
