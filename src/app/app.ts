import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Layout } from "./layout/layout";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Layout],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('snapsol');
}
// export class HomeComponent implements AfterViewInit, OnDestroy, OnInit {
//   private visibilitySubject = new BehaviorSubject<'visible' | 'invisible'>('visible');
//   visibility$ = this.visibilitySubject.asObservable();
//   visibilityState: 'visible' | 'invisible' = 'visible';

//   isMobile!: boolean;
//   isBrowser: boolean;

//   private ctx?: gsap.Context;

//   // guards
//   private isRefreshing = false;
//   private isRefreshQueued = false;

//   // Navbar offset (لو nav ثابت فوق)
//   private readonly NAV_OFFSET_DESKTOP = 0;

//   // MutationObserver / debounce
//   private observer?: MutationObserver;
//   private lastHomeHeight = 0;
//   private refreshTimer: any;

//   // ✅ snap points (pin-safe)
//   private snapY: number[] = [];
//   private snapListenersAttached = false;
//   private readonly SNAP_ZONE_VH = 0.75;

//   // ✅ color triggers
//   private colorTriggers: ScrollTrigger[] = [];

//   // ✅ snap triggers (REAL top/bottom) — pin-safe
//   private snapTriggers: ScrollTrigger[] = [];

//   // ✅ ResizeObserver + media load capture + fonts listener
//   private resizeObs?: ResizeObserver;
//   private cleanupLoadListener?: () => void;
//   private cleanupFontsListener?: () => void;

//   // ✅ HOME_SNAP ref
//   private homeSnapST?: ScrollTrigger;

//   // ✅ scroll-end detector via onUpdate debounce (بديل scrollEnd)
//   private snapDetectorST?: ScrollTrigger;
//   private snapDelay?: gsap.core.Tween; // delayedCall tween
//   private isSnapping = false;

//   // ✅ snap tween
//   private snapTween?: gsap.core.Tween;

//   // ✅ stop media-load refresh spam
//   private mediaRefreshArmed = true;
//   private mediaRefreshTimer: any;

//   constructor(
//     @Inject(PLATFORM_ID) private platformId: Object,
//     private ngZone: NgZone,
//     private cdr: ChangeDetectorRef,
//     private navTheme: NavbarThemeService,
//     private sectionsRegistry: SectionsRegistryService
//   ) {
//     this.isBrowser = isPlatformBrowser(this.platformId);
//   }

//   ngOnInit() {
//     if (!this.isBrowser) return;
//     this.isMobile = window.matchMedia('(max-width: 767px)').matches;
//   }

//   ngAfterViewInit(): void {
//     if (!this.isBrowser) return;

//     this.setupMobileStaticHeroLanguage();

//     // ✅ Mobile: بدون Snap
//     if (this.isMobile) {
//       setTimeout(() => this.observeSectionsMobile(), 750);
//       return;
//     }

//     this.ngZone.runOutsideAngular(() => {
//       this.waitForSmoother((smoother) => {
//         this.ctx = gsap.context(() => {
//           this.initDesktop(smoother);
//         });
//       });
//     });
//   }

//   private waitForSmoother(cb: (s: any) => void) {
//     const start = performance.now();
//     const tick = () => {
//       const s = ScrollSmoother.get() as any;
//       if (s) return cb(s);
//       if (performance.now() - start < 4500) requestAnimationFrame(tick);
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
//     this.sectionsRegistry.set(sections);
//     this.sectionsRegistry.enable();

//     // 2) Navbar color observers (markers ON)
//     this.observeSectionsDesktopColors(scroller);

//     // 3) ✅ build snap triggers (REAL top/bottom)
//     this.buildSnapTriggers(scroller);

//     // 4) ✅ HOME_SNAP trigger (markers ON) — بدون snap
//     this.homeSnapST?.kill();
//     this.homeSnapST = ScrollTrigger.create({
//       id: 'HOME_SNAP',
//       trigger: '#home',
//       scroller,
//       start: 0,
//       end: () => '+=' + (ScrollTrigger.maxScroll(scroller) || 1),
//       invalidateOnRefresh: true,
//       markers: {
//         startColor: 'red',
//         endColor: 'red',
//         fontSize: '12px',
//         indent: 10,
//       },
//     });

//     // 5) ✅ scrollEnd detector (الثابت)
//     this.attachSnapDetector(smoother);

//     // 6) MutationObserver للـ @defer
//     this.initMutationObserver();

//     // 7) Resize
//     window.addEventListener('resize', this.onResize);

//     // 8) pins inside sections
//     window.removeEventListener('pin-ready', this.onPinReady as any);
//     window.addEventListener('pin-ready', this.onPinReady as any);

//     // observe size/media/fonts
//     this.attachResizeObserver();
//     this.attachMediaLoadListener();
//     this.attachFontsListener();

//     // initial refresh
//     this.safeRefresh();

//     // one-time idle refresh (defer/images/fonts)
//     this.scheduleOneTimeIdleRefresh();

//     // build points + refresh listeners
//     this.buildSnapPointsFromTriggers(smoother);
//     this.attachSnapRebuildListeners();

//     // debug
//     this.debugSnapEnds();
//     this.debugSnapPoints();

//     // ✅ kill snap on user input (wheel/touch/pointer)
//     this.bindUserInputKillSnap(scroller);
//   }

//   // ===================== SNAP DETECTOR (بديل scrollEnd) =====================

//   private attachSnapDetector(smoother: any) {
//     const scroller = smoother.wrapper();

//     this.snapDetectorST?.kill();
//     this.snapDetectorST = ScrollTrigger.create({
//       id: 'SNAP_DETECTOR',
//       scroller,
//       start: 0,
//       end: () => '+=' + (ScrollTrigger.maxScroll(scroller) || 1),
//       invalidateOnRefresh: true,
//       // markers: true,
//       onUpdate: () => {
//         // كل update = user still scrolling -> restart debounce
//         this.queueSnapAfterStop(smoother);
//       },
//     });
//   }

//   private queueSnapAfterStop(smoother: any) {
//     if (this.isRefreshing || this.isRefreshQueued) return;
//     if (this.isSnapping) return;

//     // restart debounce timer
//     this.snapDelay?.kill();
//     this.snapDelay = gsap.delayedCall(0.16, () => {
//       this.performSnap(smoother);
//     });
//   }

//   private performSnap(smoother: any) {
//     if (this.isRefreshing || this.isRefreshQueued) return;

//     if (!this.snapY.length) this.buildSnapPointsFromTriggers(smoother);

//     const scroller = smoother.wrapper();
//     const vh = scroller?.clientHeight || window.innerHeight;

//     const currentY = smoother.scrollTop();
//     const targetY = gsap.utils.snap(this.snapY, currentY);

//     const threshold = vh * this.SNAP_ZONE_VH;
//     if (Math.abs(targetY - currentY) > threshold) return;

//     this.isSnapping = true;

//     // ✅ proxy tween (ScrollSmoother-safe)
//     const proxy = { y: currentY };

//     this.snapTween?.kill();
//     this.snapTween = gsap.to(proxy, {
//       y: targetY,
//       duration: 0.55,
//       ease: 'power2.out',
//       overwrite: true,
//       onUpdate: () => smoother.scrollTo(proxy.y, true),
//       onComplete: () => {
//         smoother.scrollTo(targetY, true);
//         this.isSnapping = false;
//       },
//     });
//   }

//   private bindUserInputKillSnap(scroller: HTMLElement) {
//     const kill = () => {
//       this.snapDelay?.kill();
//       this.snapDelay = undefined;
//       this.snapTween?.kill();
//       this.snapTween = undefined;
//       this.isSnapping = false;
//     };

//     // passive listeners
//     scroller.addEventListener('wheel', kill, { passive: true });
//     scroller.addEventListener('touchstart', kill, { passive: true });
//     scroller.addEventListener('pointerdown', kill, { passive: true });

//     // store cleanup
//     (this as any)._killSnapCleanup = () => {
//       scroller.removeEventListener('wheel', kill as any);
//       scroller.removeEventListener('touchstart', kill as any);
//       scroller.removeEventListener('pointerdown', kill as any);
//     };
//   }

//   // ===================== REFRESH / OBSERVERS =====================

//   private onPinReady = () => {
//     this.scheduleRefresh('pin-ready');
//   };

//   private scheduleRefresh(reason: string) {
//     if (this.isRefreshing || this.isRefreshQueued) return;

//     // ✅ media-load: مرة واحدة كل 2 ثانية كحد أقصى
//     if (reason === 'media-load') {
//       if (!this.mediaRefreshArmed) return;
//       this.mediaRefreshArmed = false;

//       clearTimeout(this.mediaRefreshTimer);
//       this.mediaRefreshTimer = setTimeout(() => {
//         this.mediaRefreshArmed = true;
//       }, 2000);
//     }

//     if (this.refreshTimer) clearTimeout(this.refreshTimer);
//     this.refreshTimer = setTimeout(() => {
//       console.log('[HOME] Refreshing due to:', reason);
//       this.safeRefresh();
//     }, 240);
//   }

//   private scheduleOneTimeIdleRefresh() {
//     const run = () => this.safeRefresh();
//     const ric = (window as any).requestIdleCallback;
//     if (typeof ric === 'function') ric(() => run(), { timeout: 2500 });
//     else setTimeout(run, 1400);
//   }

//   /**
//    * ✅ Two-pass refresh + force update HOME_SNAP end + rebuild snap triggers/points
//    */
//   private safeRefresh() {
//     if (this.isRefreshing) return;

//     const smoother = ScrollSmoother.get() as any;
//     if (!smoother) return;

//     if (this.isRefreshQueued) return;
//     this.isRefreshQueued = true;

//     // stop any snapping during refresh
//     this.snapDelay?.kill();
//     this.snapDelay = undefined;
//     this.snapTween?.kill();
//     this.snapTween = undefined;
//     this.isSnapping = false;

//     const doPass = () => {
//       this.isRefreshing = true;

//       smoother.refresh();
//       ScrollTrigger.refresh(true);
//       ScrollTrigger.update();

//       // kick scrollerProxy
//       const y = smoother.scrollTop();
//       smoother.scrollTop(y);

//       // force end update
//       this.forceUpdateHomeSnapEnd();

//       // rebuild snap triggers + points
//       this.buildSnapTriggers(smoother.wrapper());
//       this.buildSnapPointsFromTriggers(smoother);

//       // make sure detector uses new maxScroll
//       this.attachSnapDetector(smoother);

//       this.isRefreshing = false;
//     };

//     doPass();

//     requestAnimationFrame(() => {
//       const sm = ScrollSmoother.get() as any;
//       if (sm) doPass();

//       this.isRefreshQueued = false;
//       this.debugSnapEnds();
//       this.debugSnapPoints();
//     });
//   }

//   private forceUpdateHomeSnapEnd() {
//     const smoother = ScrollSmoother.get() as any;
//     if (!smoother) return;

//     const scroller = smoother.wrapper();
//     const max = ScrollTrigger.maxScroll(scroller) || 1;

//     const st = this.homeSnapST || (ScrollTrigger.getById('HOME_SNAP') as any);
//     if (!st) return;

//     (st as any).vars.end = '+=' + max;
//     try { (st as any).refresh(); } catch { }
//   }

//   private initMutationObserver() {
//     const homeEl = document.getElementById('home');
//     if (!homeEl) return;

//     this.lastHomeHeight = homeEl.scrollHeight;

//     this.observer = new MutationObserver(() => {
//       const h = homeEl.scrollHeight;
//       if (Math.abs(h - this.lastHomeHeight) < 5) return;
//       this.lastHomeHeight = h;

//       this.scheduleRefresh('mutation');
//     });

//     this.observer.observe(homeEl, { childList: true, subtree: true });
//   }

//   private attachResizeObserver() {
//     if (typeof ResizeObserver === 'undefined') return;

//     this.resizeObs?.disconnect();

//     const content = document.querySelector('#smooth-content') as HTMLElement | null;
//     const wrapper = document.querySelector('#smooth-wrapper') as HTMLElement | null;

//     this.resizeObs = new ResizeObserver(() => {
//       this.scheduleRefresh('resize-observer');
//     });

//     if (content) this.resizeObs.observe(content);
//     if (wrapper) this.resizeObs.observe(wrapper);
//   }

//   private attachMediaLoadListener() {
//     this.cleanupLoadListener?.();
//     this.cleanupLoadListener = undefined;

//     const onLoadCapture = (e: Event) => {
//       const t = e.target as HTMLElement | null;
//       if (!t) return;

//       if (
//         t.tagName === 'IMG' ||
//         t.tagName === 'VIDEO' ||
//         t.tagName === 'IFRAME' ||
//         t.tagName === 'PICTURE' ||
//         t.tagName === 'SOURCE'
//       ) {
//         this.scheduleRefresh('media-load');
//       }
//     };

//     document.addEventListener('load', onLoadCapture, true);

//     this.cleanupLoadListener = () => {
//       document.removeEventListener('load', onLoadCapture, true);
//     };
//   }

//   private attachFontsListener() {
//     this.cleanupFontsListener?.();
//     this.cleanupFontsListener = undefined;

//     const anyDoc = document as any;
//     const fonts: FontFaceSet | undefined = anyDoc.fonts;
//     if (!fonts) return;

//     const onFonts = () => this.scheduleRefresh('fonts');

//     fonts.ready?.then(onFonts).catch(() => { });

//     const done = () => onFonts();
//     try {
//       (fonts as any).addEventListener?.('loadingdone', done);
//       (fonts as any).addEventListener?.('loadingerror', done);
//     } catch { }

//     this.cleanupFontsListener = () => {
//       try {
//         (fonts as any).removeEventListener?.('loadingdone', done);
//         (fonts as any).removeEventListener?.('loadingerror', done);
//       } catch { }
//     };
//   }

//   // ===================== DESKTOP: NAV COLORS (50%) =====================

//   private observeSectionsDesktopColors(scroller: HTMLElement) {
//     this.colorTriggers.forEach(t => t.kill());
//     this.colorTriggers = [];

//     const sections = gsap.utils.toArray<HTMLElement>('.panel');

//     sections.forEach((section, index) => {
//       const textColor = section.dataset['textcolor'] || 'var(--primary)';
//       const bgColor = section.dataset['bgcolor'] || 'var(--white)';

//       const t = ScrollTrigger.create({
//         id: `HOME_COLOR_${index + 1}`,
//         trigger: section,
//         scroller,
//         start: 'top 50%',
//         end: 'bottom 50%',
//         invalidateOnRefresh: true,
//         onEnter: () => {
//           this.navTheme.setColor(textColor);
//           this.navTheme.setBg(bgColor);
//         },
//         onEnterBack: () => {
//           this.navTheme.setColor(textColor);
//           this.navTheme.setBg(bgColor);
//         },
//         onLeaveBack: () => {
//           if (index === 0) {
//             this.navTheme.setBg('var(--white)');
//             this.navTheme.setColor('var(--primary)');
//           }
//         },
//       });

//       this.colorTriggers.push(t);
//     });
//   }

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
//           this.navTheme.setColor(textColor);
//           this.navTheme.setBg(bgColor);
//         },
//         onEnterBack: () => {
//           this.navTheme.setColor(textColor);
//           this.navTheme.setBg(bgColor);
//         },
//         onLeaveBack: () => {
//           if (index === 0) {
//             this.navTheme.setBg('var(--white)');
//             this.navTheme.setColor('var(--primary)');
//           }
//         },
//       });
//     });
//   }

//   private onResize = () => {
//     this.scheduleRefresh('resize');

//     this.ngZone.run(() => {
//       this.cdr.detectChanges();
//     });
//   };

//   // ===================== SNAP TRIGGERS (REAL TOP/BOTTOM) =====================

//   private buildSnapTriggers(scroller: HTMLElement) {
//     this.snapTriggers.forEach(t => t.kill());
//     this.snapTriggers = [];

//     const panels = gsap.utils.toArray<HTMLElement>('.panel');

//     panels.forEach((panel, i) => {
//       const t = ScrollTrigger.create({
//         id: `SNAP_PANEL_${i + 1}`,
//         trigger: panel,
//         scroller,
//         start: 'top top',
//         end: 'bottom bottom',
//         invalidateOnRefresh: true,
//         markers: {
//           startColor: 'green',
//           endColor: 'green',
//           fontSize: '10px',
//           indent: 55,
//         },
//       });
//       this.snapTriggers.push(t);
//     });
//   }

//   // ===================== SNAP POINTS (PIN-SAFE) =====================

//   private buildSnapPointsFromTriggers(smoother: any) {
//     const scroller = smoother.wrapper();
//     const max = ScrollTrigger.maxScroll(scroller) || 1;
//     const vh = scroller?.clientHeight || window.innerHeight;

//     const points: number[] = [];

//     for (const t of this.snapTriggers) {
//       const start = t.start ?? 0;
//       const end = t.end ?? start;

//       const yTop = start - this.NAV_OFFSET_DESKTOP;
//       points.push(this.clamp(yTop, 0, max));

//       // Tail
//       const length = end - start;
//       if (length > vh * 1.15) {
//         const tail = yTop + (length - vh);
//         points.push(this.clamp(tail, 0, max));
//       }
//     }

//     points.sort((a, b) => a - b);
//     this.snapY = points.filter((v, i, arr) => i === 0 || Math.abs(v - arr[i - 1]) > 2);
//   }

//   private attachSnapRebuildListeners() {
//     if (this.snapListenersAttached) return;
//     this.snapListenersAttached = true;

//     const rebuild = () => {
//       const smoother = ScrollSmoother.get() as any;
//       if (!smoother) return;

//       this.buildSnapTriggers(smoother.wrapper());
//       this.buildSnapPointsFromTriggers(smoother);
//       this.attachSnapDetector(smoother);
//     };

//     ScrollTrigger.addEventListener('refreshInit', rebuild);
//     ScrollTrigger.addEventListener('refresh', rebuild);

//     (this as any)._snapRebuild = rebuild;
//   }

//   private clamp(v: number, min: number, max: number) {
//     return Math.max(min, Math.min(max, v));
//   }

//   // ===================== DEBUG =====================

//   private debugSnapEnds() {
//     const smoother = ScrollSmoother.get() as any;
//     if (!smoother) return;

//     const scroller = smoother.wrapper();
//     const max = ScrollTrigger.maxScroll(scroller) || 0;

//     const st = this.homeSnapST || (ScrollTrigger.getById('HOME_SNAP') as any);
//     const end = (st as any)?.end ?? 0;

//     console.log('[HOME_SNAP] maxScroll=', Math.round(max), ' end=', Math.round(end), ' diff=', Math.round(max - end));
//   }

//   private debugSnapPoints() {
//     if (!this.snapY.length) return;
//     console.log('[SNAP_Y]', this.snapY.map(v => Math.round(v)));
//   }

//   // ===================== MOBILE STATIC HERO I18N =====================

//   private setupMobileStaticHeroLanguage() {
//     const isMobile = window.matchMedia('(max-width: 767px)').matches;
//     if (!isMobile) return;

//     const saved = (localStorage.getItem('lang') || '').toLowerCase();
//     if (saved !== 'en') return;

//     const run = () => this.applyEnglishToMobileHero();
//     const ric = (window as any).requestIdleCallback;
//     if (typeof ric === 'function') ric(() => run(), { timeout: 3000 });
//     else setTimeout(run, 1800);
//   }

//   private applyEnglishToMobileHero() {
//     const hero = document.getElementById('hero-mobile');
//     if (!hero) return;

//     const title = hero.querySelector('[data-i18n="title"]');
//     const subtitle = hero.querySelector('[data-i18n="subtitle"]');
//     const details = hero.querySelector('[data-i18n="details"]');
//     const btn1 = hero.querySelector('[data-i18n="btn1"]');
//     const btn2 = hero.querySelector('[data-i18n="btn2"]');

//     if (title) title.textContent = 'Manage all your operations in one integrated system';
//     if (subtitle)
//       subtitle.textContent =
//         'Al Motammem ERP for enterprise resource management, backed by 40 years of experience in local and Gulf markets.';
//     if (details)
//       details.textContent =
//         'Financial management - inventory - HR and payroll - reporting - fixed assets management - cash and banks - letters of guarantee - letters of credit - tax integrations, plus many more features tailored to your business.';
//     if (btn1) btn1.textContent = 'Book a free consultation';
//     if (btn2) btn2.textContent = 'Start chat now';

//     hero.setAttribute('dir', 'ltr');
//     hero.classList.add('is-en');
//   }

//   ngOnDestroy(): void {
//     this.sectionsRegistry.clear();
//     this.sectionsRegistry.disable();

//     if (this.isBrowser) {
//       try {
//         window.removeEventListener('resize', this.onResize);
//       } catch { }

//       window.removeEventListener('pin-ready', this.onPinReady as any);

//       const rebuild = (this as any)._snapRebuild;
//       if (rebuild) {
//         ScrollTrigger.removeEventListener('refreshInit', rebuild);
//         ScrollTrigger.removeEventListener('refresh', rebuild);
//       }

//       this.cleanupLoadListener?.();
//       this.cleanupLoadListener = undefined;

//       this.cleanupFontsListener?.();
//       this.cleanupFontsListener = undefined;

//       this.resizeObs?.disconnect();
//       this.resizeObs = undefined;

//       this.observer?.disconnect();
//       this.observer = undefined;

//       clearTimeout(this.refreshTimer);
//       clearTimeout(this.mediaRefreshTimer);

//       this.colorTriggers.forEach(t => t.kill());
//       this.colorTriggers = [];

//       this.snapTriggers.forEach(t => t.kill());
//       this.snapTriggers = [];

//       this.snapDetectorST?.kill();
//       this.snapDetectorST = undefined;

//       this.homeSnapST?.kill();
//       this.homeSnapST = undefined;

//       this.snapDelay?.kill();
//       this.snapDelay = undefined;

//       this.snapTween?.kill();
//       this.snapTween = undefined;

//       (this as any)._killSnapCleanup?.();
//       (this as any)._killSnapCleanup = undefined;

//       this.ctx?.revert();
//     }
//   }
// }