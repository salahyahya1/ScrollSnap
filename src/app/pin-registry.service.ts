import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type PinDef = {
    panelId: string;
    endPx: number;
    innerId?: string;
    x?: number;
    y?: number;
    scrub?: number | boolean;
    anticipatePin?: number;
};

@Injectable({ providedIn: 'root' })
export class PinRegistryService {
    private _pins$ = new BehaviorSubject<PinDef[]>([]);
    pins$ = this._pins$.asObservable();

    registerPin(def: PinDef) {
        const curr = this._pins$.value;
        const next = [...curr.filter(p => p.panelId !== def.panelId), def];
        this._pins$.next(next);
    }

    unregisterPin(panelId: string) {
        const curr = this._pins$.value;
        this._pins$.next(curr.filter(p => p.panelId !== panelId));
    }

    // ✅ أضفها عشان Home يستعملها
    snapshot(): PinDef[] {
        return this._pins$.value;
    }
}
