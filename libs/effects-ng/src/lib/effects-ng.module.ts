import { Inject, InjectionToken, Injector, ModuleWithProviders, NgModule, Type }                  from '@angular/core';
import { actions, Effect, EffectsConfig, EffectsManager, initEffects, isEffect, registerEffects } from '@ngneat/effects';
import { Actions }                                                                                from './actions';

const EFFECTS_PROVIDERS = new InjectionToken('EFFECTS_PROVIDERS');
const EFFECTS_MANAGER   = new InjectionToken('@ngneat/effects Effects Manager');

@NgModule({
  providers: [
    {
      provide: Actions,
      useValue: actions
    }
  ]
})
export class EffectsNgModule {
  constructor(
    @Inject(EFFECTS_MANAGER) manager: EffectsManager,
    @Inject(EFFECTS_PROVIDERS) providers: Type<any>[],
    injector: Injector
  ) {
    const flattenProviders = flatten(providers);

    flattenProviders.forEach(provider => {
      const instance = injector.get(provider);
      const effects  = Object.values(instance).filter((v: any) => isEffect(v));

      registerEffects(effects as Effect[]);
    });
  }

  static forRoot(
    providers: Type<any>[],
    config?: EffectsConfig
  ): ModuleWithProviders<EffectsNgModule> {

    return {
      ngModule: EffectsNgModule,
      providers: [
        {
          provide: EFFECTS_MANAGER,
          useFactory: () => initEffects(config)
        },
        ...providers,
        {
          provide: EFFECTS_PROVIDERS,
          multi: true,
          useValue: providers
        }
      ]
    };
  }

  static forFeature(
    providers: (Type<any>)[]
  ): ModuleWithProviders<EffectsNgModule> {
    return EffectsNgModule.forRoot(providers);
  }

}

function flatten<T>(arr: T[]): T[] {
  return arr.reduce((acc, cur) => acc.concat(Array.isArray(cur) ? flatten(cur) : cur as any), []);
};
