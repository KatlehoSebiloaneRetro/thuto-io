import { Component, Input,OnInit } from '@angular/core';

@Component({
  selector: 'app-subject-summary',
  templateUrl: './subject-summary.component.html',
  styleUrls: ['./subject-summary.component.sass']
})
export class SubjectSummaryComponent implements OnInit {

  @Input()
  stats:any
  constructor() { }

  perc:any= 0
  residue:any = 0
  containerBackgroundColor: any;
  

  ngOnInit(): void {
    this.getRandomColorWithContrast();
    this.perc = ((this.stats.earned/this.stats.subjectWorth)*100)
    this.residue = 100-this.perc
    
    if(this.perc<50){
      this.containerBackgroundColor="#ff0000"
    }
    if(this.perc>100){
      this.perc = 100
      this.residue = 0
    }

    
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

  getRandomColorWithContrast() {
    // Generate random RGB values
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    // Calculate luminance to determine contrast with white text
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Ensure sufficient contrast by adjusting luminance
    const adjustedLuminance = luminance > 128 ? luminance - 50 : luminance + 50;

    // Convert RGB to hex
    const hexColor = `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;

    this.containerBackgroundColor =  hexColor;
}

componentToHex(c:any) {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

}
