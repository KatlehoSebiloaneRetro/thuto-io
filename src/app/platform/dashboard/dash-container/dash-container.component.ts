import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { tuiHsvToRgb } from '@taiga-ui/cdk';
import { Client, Databases, Query } from 'appwrite';
import { AssessmentDialogComponent } from '../../assessment-dialog/assessment-dialog/assessment-dialog.component';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
@Component({
  selector: 'app-dash-container',
  templateUrl: './dash-container.component.html',
  styleUrls: ['./dash-container.component.sass']
})
export class DashContainerComponent implements OnInit {
  loading = true;
  activeItemIndex = 0;
  stats:any
  studentId:any = 51
  accountTotal:any = 1000
  subjectStats:any
  client = new Client()
  .setEndpoint('https://thuto.appwrite.nexgenlabs.co.za/v1')
  .setProject('672b43fb00096f3a294e');

  

  databases = new Databases(this.client);

  balance:any = 0
  spent:any = 0
  saved:any = 0
  totalDeposited = 0
  TCCount:any = 0
  earned:any = 0 
  transactions:any
  program_id = 'basic_Program'
  student:any

  

  showGood:boolean = false
  showBest:boolean = false
  showWorse:boolean = false
  animal:string = "none"

  featureMap:any={}
  rating:any = 0;
  levels:any =["This Needs Improvement","You're Doing Well","Excellent, We see you Mr CEO","No History"]
  score:any = 0

  perc:number = 0 
  residue:number = 0 


async ReadTransactions(){
  let promise = await this.databases.listDocuments(
    "thuto",
    "transactions",
    [Query.limit(500),Query.equal('owner',localStorage.getItem('studentID')?.split("@")[0]||'')]
  )
  return this.processArray(promise.documents);
}

async ReadStudent(){
  let promise = await this.databases.listDocuments(
    "thuto",
    "students",
    [Query.limit(2),Query.equal('email',localStorage.getItem('studentID')||'')]
  )
  return promise.documents[0];
}

  items = [
    {
        text: 'Summary',
        active: true,
        function: ()=>{
          this.activeItemIndex = 0;
          this.items[0].active = true
          this.items[1].active = false
          this.items[2].active = false
          this.items[3].active = false
        }
    },
    {
        text: 'Spent',
        active: false,
        function: ()=>{
          this.activeItemIndex = 1;
          this.items[0].active = false
          this.items[1].active = true
          this.items[2].active = false
          this.items[3].active = false
        }
    },
    {
        text: 'Earned',
        active: false,
        function: ()=>{
          this.activeItemIndex = 2;
          this.items[0].active = false
          this.items[1].active = false
          this.items[2].active = true
          this.items[3].active = false
        }
    },
    {
        text: 'Invested',
        active: false,
        function: ()=>{
          this.activeItemIndex = 3;
          this.items[0].active = false
          this.items[1].active = false
          this.items[2].active = false
          this.items[3].active = true
        }
    },
];


searchForm = new FormGroup({
  value: new FormControl(''),
});


constructor(private http: HttpClient, @Inject(TuiDialogService) private readonly dialogService: TuiDialogService) { }

  async ngOnInit(): Promise<void> {
    this.student = await this.ReadStudent()
    this.transactions = await this.ReadTransactions()
    this.calculateBalance()
    this.calculateSpent()
    this.calculateSaved()
    this.calculateDeposit()
    this.http.get("http://localhost:6500/score/subject_stats?studentId="+this.student.email+"&programId=basic_Program&depositAmount="+this.totalDeposited).subscribe(
      (data:any)=>{
        this.subjectStats = data
        this.loading = false
        console.log(this.subjectStats)
      },(err)=>{
        console.log(err)
      }
    )
  }

  calculateBalance(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.item_purchased=="bank withdrawal"){
        console.log("skipped")
      }else{
        this.balance+=transaction.amount
      }
    });
  }

  async showAssessments(subject: string) {
    try {
      this.loading = true;
      const response = await firstValueFrom(
        this.http.get(`http://localhost:5001/getAssessments`, {
          params: {
            student_id: this.student.email
          }
        })
      );
      
      const allAssessments = response as any[];
      console.log('Subject we are filtering for:', subject);
      console.log('All assessments before filter:', allAssessments);
  
      const subjectAssessments = [];
      // Changed to startsWith for more flexible matching
      for (const assessment of allAssessments) {
        const normalizedAssessmentSubject = assessment.subject?.toString().toLowerCase().trim() || '';
        const normalizedSearchSubject = subject?.toString().toLowerCase().trim() || '';
        
        console.log('Comparing:', {
            assessmentSubject: normalizedAssessmentSubject,
            searchSubject: normalizedSearchSubject,
            startsWith: normalizedAssessmentSubject.startsWith(normalizedSearchSubject),
            assessment: assessment
        });
    
        if (normalizedAssessmentSubject.startsWith(normalizedSearchSubject)) {
            subjectAssessments.push(assessment);
        }
    }
  
      console.log('Filtered assessments:', subjectAssessments);
  
      this.dialogService.open(
        new PolymorpheusComponent(AssessmentDialogComponent),
        {
          data: {
            subject: subject,
            assessments: subjectAssessments,
            loading: false
          },
          dismissible: true,
          size: 'l'
        }
      ).subscribe();
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      this.loading = false;
    }
  }

  calculateDeposit(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.item_purchased=="Parent deposit"){
        this.totalDeposited+=transaction.amount
      }
    });
    this.perc = 50
    this.residue = 50
    this.reload(this.program_id)
  }
  
  calculateSpent(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.amount<0 && transaction.item_purchased!="bank withdrawal"){
        this.spent+=transaction.amount
      }
      
    });
  }
  calculateSaved(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.account.includes("sav")){
        this.saved+=transaction.amount
      }
      
    });
  }

  processArray(inputArray:any) {
    let resultArray = [...inputArray];
  
    for (let i = 0; i < resultArray.length; i++) {
        const currentObject = resultArray[i];
        const currentValue = currentObject.amount;
  
        if (currentValue > 0) {
            // Check for the corresponding negative value
            const correspondingIndex = resultArray.findIndex(obj => obj.amount === -currentValue);
  
            if (correspondingIndex !== -1) {
                // Set the item_purchased field to "saved" for both objects
                resultArray[i].item_purchased = "saved";
                resultArray[correspondingIndex].item_purchased = "saved";
            }
        }
    }
  
    return resultArray;
  
  }
  
  reload(new_program:any){
    this.TCCount = 0
    this.subjectStats
    this.program_id = new_program
    console.warn(this.totalDeposited)
        this.http.get("http://localhost:6500/score/subject_score?studentId="+this.student.email+"&programId="+this.program_id+"&depositAmount="+this.totalDeposited).subscribe(
          (score:any)=>{
            this.TCCount = score.toFixed(2)
            console.log(this.TCCount)
            this.balance = (parseFloat(this.TCCount)+parseFloat(this.spent)).toFixed(2)
            console.warn(this.balance);
            this.calculateFQ(this.transactions)
          
          },
          (err)=>{
            console.log(err)
          }
        )
    
  }

  calculateFQ(array:any){
   let spendingRatio =1-(Math.abs(this.spent)/this.TCCount)*1.05
   let earningRatio = (this.TCCount/this.totalDeposited)
   let savingsRatio = (this.saved/this.TCCount)*3
  
    
    if(Number.isNaN(savingsRatio)){
      this.featureMap= {
        feature1:0,
        feature2:0,
        feature3:0,
      }
    }else{
      this.featureMap= {
        feature1:spendingRatio,
        feature2:earningRatio,
        feature3:savingsRatio,
      }
    }
    console.log(this.featureMap)
    this.score = ((((this.featureMap.feature1+this.featureMap.feature2+this.featureMap.feature3)/3)*100)*5).toFixed(2)

    if(this.score<245){
      this.rating = 0
      this.showWorse = true
      this.TCCount = (this.TCCount*0.9).toFixed(2)
      this.loading = false
      this.animal = "mouse"
    }
    if(this.score>=245&&this.score<=345){
      this.rating = 1
      this.showGood = true
      this.TCCount = (this.TCCount*1.2).toFixed(2)
      this.loading = false
      this.animal = "lion"
    }
    if(this.score>345){
      this.rating = 2
      this.showBest = true
      this.TCCount = (this.TCCount*1.4).toFixed(2)
      this.loading = false
      this.animal = "camel"
    }
    
  }

}
