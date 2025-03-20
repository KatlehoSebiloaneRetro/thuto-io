import { Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

interface AssessmentSummary {
  type: string;
  count: number;
  totalMarksObtained: number;
  totalPossibleMarks: number;
}

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

        <ng-container *ngIf="!data.loading && data.assessments && data.assessments.length > 0">
          <!-- Summary Section -->
          <div class="summary-section">
            <h4>Assessment Summary</h4>
            <div class="summary-cards">
              <div class="summary-card" *ngFor="let summary of assessmentSummary">
                <div class="summary-type" [ngClass]="summary.type.toLowerCase()">
                {{ summary.type === 'HOMEWORK' ? 'FORMATIVE' : summary.type }}
                </div>
                <div class="summary-details">
                  <div class="summary-count">{{summary.count}} assessments</div>
                  <div class="summary-marks" *ngIf="summary.count > 0">
                    Average: {{((summary.totalMarksObtained / summary.totalPossibleMarks) * 100 | number:'1.0-0')}}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Grouped Assessments -->
          <div class="assessment-groups">
            <div class="assessment-group" *ngFor="let group of groupedAssessments | keyvalue">
              <h4 class="group-header">{{group.key}}</h4>
              <div class="assessment-cards">
                <div class="assessment-card" *ngFor="let assessment of group.value">
                  <div class="card-header">
                    <div class="card-title">{{assessment.title}}</div>
                    <div class="assessment-type" [ngClass]="assessment.type.toLowerCase()">
                    {{ assessment.type === 'HOMEWORK' ? 'FORMATIVE' : assessment.type }}
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
        </ng-container>
      </div>
    </div>
  `,
  styleUrls:['./assessment-dialog.component.sass']
})
export class AssessmentDialogComponent {
  groupedAssessments: { [key: string]: any[] } = {};
  assessmentSummary: AssessmentSummary[] = [];

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<any, {
      subject: string,
      assessments: any[],
      loading: boolean
    }>
  ) {
    if (this.data.assessments) {
      this.processAssessments();
    }
  }

  get data() {
    return this.context.data;
  }

  private processAssessments() {
    // Group assessments by type
    this.groupedAssessments = this.data.assessments.reduce((groups: { [key: string]: any[] }, assessment) => {
      const type = assessment.type || 'Other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(assessment);
      return groups;
    }, {});

    // Calculate summary for each type
    this.assessmentSummary = Object.entries(this.groupedAssessments).map(([type, assessments]) => {
      const summary: AssessmentSummary = {
        type,
        count: assessments.length,
        totalMarksObtained: assessments.reduce((sum, assessment) => sum + (assessment.marks_obtained || 0), 0),
        totalPossibleMarks: assessments.reduce((sum, assessment) => sum + (assessment.total_marks || 0), 0)
      };
      return summary;
    });
  }
}