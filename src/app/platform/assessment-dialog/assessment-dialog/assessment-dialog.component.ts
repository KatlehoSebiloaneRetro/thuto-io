// assessment-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-assessment-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h3>{{data.subject}} Assessments</h3>
      </div>
      
      <div class="dialog-content">
        <ng-container *ngIf="data.loading">
          <div class="loading-state">
            <tui-loader size="l"></tui-loader>
          </div>
        </ng-container>

        <ng-container *ngIf="!data.loading && (!data.assessments || data.assessments.length === 0)">
          <div class="empty-state">
            <p>No assessments found for {{data.subject}}</p>
          </div>
        </ng-container>

        <div class="assessment-cards" *ngIf="!data.loading && data.assessments && data.assessments.length > 0">
          <div class="assessment-card" *ngFor="let assessment of data.assessments">
            <div class="card-header">
              <div class="card-title">{{assessment.title}}</div>
              <div class="assessment-type" [ngClass]="assessment.type.toLowerCase()">
                {{assessment.type}}
              </div>
            </div>
            <div class="card-content">
              <div class="marks-container">
                <span class="marks-label">Marks:</span>
                <span class="marks-value">{{assessment.marks_obtained}}/{{assessment.total_marks}}</span>
              </div>
              <div class="remarks" *ngIf="assessment.teacher_remarks">
                <span class="remarks-label">Remarks:</span>
                <span class="remarks-value">{{assessment.teacher_remarks}}</span>
              </div>
              <div class="date">
                {{assessment.dateCreated | date:'MMM d, y'}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container 
      padding: 0
      max-height: 80vh
      display: flex
      flex-direction: column
    

    .dialog-header 
      padding: 1rem
      border-bottom: 1px solid var(--tui-base-03)
      position: sticky
      top: 0
      background: white
      z-index: 1
    

    .dialog-header h3 
      margin: 0
      font-size: 1.25rem
      font-weight: 600
    

    .dialog-content 
      padding: 1rem
      overflow-y: auto
    

    .assessment-cards 
      display: flex
      flex-direction: column
      gap: 1rem
    

    .assessment-card 
      background: white
      border: 1px solid var(--tui-base-03)
      border-radius: 8px
      padding: 1rem
    

    .card-header 
      display: flex
      justify-content: space-between
      align-items: flex-start
      margin-bottom: 0.75rem
    

    .card-title 
      font-weight: 500
      flex: 1
      margin-right: 1rem
    

    .assessment-type 
      font-size: 0.75rem
      padding: 0.25rem 0.5rem
      border-radius: 4px
      text-transform: uppercase
      font-weight: 500
    

    .assessment-type.homework 
      background: #e3f2fd
      color: #1976d2
    

    .assessment-type.summative 
      background: #fce4ec
      color: #c2185b
    

    .assessment-type.story 
      background: #f3e5f5
      color: #7b1fa2
    

    .card-content 
      font-size: 0.875rem
    

    .marks-container 
      display: flex
      align-items: center
      margin-bottom: 0.5rem
    

    .marks-label 
      color: var(--tui-text-02)
      margin-right: 0.5rem
    

    .marks-value 
      font-weight: 500
    

    .remarks 
      margin-bottom: 0.5rem
    

    .remarks-label 
      color: var(--tui-text-02)
      margin-right: 0.5rem
    

    .date 
      color: var(--tui-text-02)
      font-size: 0.75rem
      margin-top: 0.5rem
    

    .loading-state, .empty-state 
      display: flex
      justify-content: center
      align-items: center
      min-height: 200px
    

    .empty-state 
      color: var(--tui-text-02)
    
  `]
})
export class AssessmentDialogComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<any, {
      subject: string, 
      assessments: any[],
      loading: boolean
    }>
  ) {}

  get data() {
    return this.context.data;
  }
}