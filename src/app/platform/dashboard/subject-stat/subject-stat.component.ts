import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-subject-stat',
  templateUrl: './subject-stat.component.html',
  styleUrls: ['./subject-stat.component.sass']
})
export class SubjectStatComponent implements OnInit {

  constructor() { }
  @Input() stats:any
  ngOnInit(): void {
  }

  mapSubjectToCategory(subject:any) {
    switch (subject) {
        case "Afrikaans FAL":
          return "Business Law";
        case "English HL":
            return "The Humanitarian Business";
        case "Social Science":
            return "Business Consumer Studies";
        case "Life Orientation":
            return "Commerce In Education";
        case "Natural Science and Technology":
            return "Business Mathematics and Informatics";
        case "Economic Management Sciences":
            return "Business Account and Economic Sciences";
        case "Mathematics":
            return "Business In Engineering";
        // Add more cases as needed
        default:
            return "Unknown Category";
    }
  }
  

}
