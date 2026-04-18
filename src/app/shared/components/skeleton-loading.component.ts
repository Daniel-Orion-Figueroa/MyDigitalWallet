import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loading',
  templateUrl: './skeleton-loading.component.html',
  standalone: false
})
export class SkeletonLoadingComponent {
  @Input() width: string = '100%';
  @Input() height: string = '20px';
}