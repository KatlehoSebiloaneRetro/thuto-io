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

  colors = [
    {subject: "Mathematics", color:"#F79E1B"},
    {subject: "English HL", color:"#4E46B4"},
    {subject: "Social Sciences", color:"#FF4E64"},
    {subject: "Afrikaans FAL", color:"#27AB87"},
    {subject: "Life Orientation", color:"#0078BD"},
    {subject: "Natural Science and Technology", color:"#EBA5C5"},
    {subject: "Economic Management Sciences", color:"#EE936F"}
]
  

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

  getRandomColorWithContrast() {
    console.log(this.stats)

    this.colors.forEach((elem:any) => {
      const subjectName = this.stats.subjectName.toLowerCase();
      const searchTerm = elem.subject.toLowerCase();
      if (subjectName == searchTerm) {
        this.containerBackgroundColor = elem.color;
      }
    });
}

}
