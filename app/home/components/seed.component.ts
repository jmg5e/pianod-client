import {ChangeDetectionStrategy, Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';

import dialogs = require('ui/dialogs');
import {Seed} from '../../models';

@Component({
  selector: 'app-seed',
  moduleId: module.id,
  templateUrl: './seed.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class SeedComponent implements OnInit, OnDestroy {
  @Input() seed: Seed;
  public constructor() {}

  public ngOnInit() {}

  public ngOnDestroy() {}
}
