import { LitElement } from 'lit';
import { Constructor } from '../index.js';
// import TrackFocus from '../utils/track-focus.js';

export interface BaseComponentInterface {
  addFocus(element: HTMLElement): void;
  composeClass(...classes: any): string;
}

export type BaseComponentType = typeof LitElement & Constructor<BaseComponentInterface>;

/**
 * Factory function per creare una base class estendibile
 * con stili personalizzati.
 */

export class BaseComponent extends LitElement {
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  addFocus(element: HTMLElement) {
    // new TrackFocus(element); //per il momento è stato disattivato perchè ci sono le pseudo classi ::focus-visible per fare quello che fa TrackFocus. Si possono aggiungere regole css in bsi-italia 3 dato che stiamo facendo una breaking release di bsi.
  }

  // eslint-disable-next-line class-methods-use-this
  composeClass(...classes: any) {
    let composedClass = '';
    classes
      .filter((c: string) => c.length > 0)
      .forEach((newClass: string) => {
        composedClass += ` ${newClass}`;
      });
    return composedClass.trim();
  }
}
