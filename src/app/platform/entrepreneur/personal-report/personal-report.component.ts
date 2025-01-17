import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Client, Databases, Query } from 'appwrite';

@Component({
  selector: 'app-personal-report',
  templateUrl: './personal-report.component.html',
  styleUrls: ['./personal-report.component.sass']
})
export class EntPersonalReportComponent implements OnInit {

  constructor(private http:HttpClient) { }
  
  client = new Client()
  .setEndpoint('https://thuto.appwrite.nexgenlabs.co.za/v1')
  .setProject('672b43fb00096f3a294e');

  databases = new Databases(this.client);

  async ReadTransactions(){
    let promise = await this.databases.listDocuments(
      "thuto",
      "transactions",
      [Query.limit(500),Query.equal('owner',localStorage.getItem('studentID')?.split("@")[0]||'')]
    )
    return promise.documents;
  }

  async ReadAssessments(){
    let promise = await this.databases.listDocuments(
      "thuto",
      "659fe319e187ce2be36c",
      [Query.limit(125),Query.equal('student_id',localStorage.getItem('studentID')||'')]
    )
    return promise.documents;
  }

  transactions:any
  assessment:any

  Mathematics:any=[]
  Life_Orientation:any=[]
  Natural_Science_and_Technology:any=[]
  Economic_Management_Sciences:any=[]
  Social_Science:any=[]
  English_HL:any=[]
  Afrikaans_FAL:any=[]

  Ave_Mathematics:any
  Ave_Life_Orientation:any
  Ave_Natural_Science_and_Technology:any
  Ave_Economic_Management_Sciences:any
  Ave_Social_Science:any
  Ave_English_HL:any
  Ave_Afrikaans_FAL:any

  subjectAverages:any=[]

  balance:any = 0
  spent:any = 0
  saved:any = 0
  totalDeposited = 0
  TCCount:any = 0
  earned:any = 0 
  program_id = 'basic_Program'
  student:any
  subjectStats:any

  largestSpend:any
  smallestSpend:any

  bestSubject:any
  WorstSubject:any

  async ReadStudent(){
    let promise = await this.databases.listDocuments(
      "thuto",
      "students",
      [Query.limit(2),Query.equal('email',localStorage.getItem('studentID')||'')]
    )
    return promise.documents[0];
  }

  async ngOnInit(): Promise<void> {
    this.student = await this.ReadStudent()
    this.transactions = await this.ReadTransactions()
    this.assessment = await this.ReadAssessments()
    console.log(this.transactions)
    
    this.assessment.forEach((elem:any)=>{
      if(elem.subject.toLowerCase().includes('mathematics')){
        this.Mathematics.push(elem)
      }
      if(elem.subject.toLowerCase().includes('life')){
        this.Life_Orientation.push(elem)
      }
      if(elem.subject.toLowerCase().includes('natural')){
        this.Natural_Science_and_Technology.push(elem)
      }
      if(elem.subject.toLowerCase().includes('economic')){
        this.Economic_Management_Sciences.push(elem)
      }
      if(elem.subject.toLowerCase().includes('social')){
        this.Social_Science.push(elem)
      }
      if(elem.subject.toLowerCase().includes('english')){
        this.English_HL.push(elem)
      }
      if(elem.subject.toLowerCase().includes('afrikaans')){
        this.Afrikaans_FAL.push(elem)
      }
    })


    this.calculateDeposit()
    this.calculateSpent()
    this.calculateSaved()
    this.calculateBalance()
    console.log(this.totalDeposited)
    this.reload()



    this.Ave_Mathematics= this.calculateAverage(this.Mathematics)
    this.Ave_Life_Orientation= this.calculateAverage(this.Life_Orientation)
    this.Ave_Natural_Science_and_Technology= this.calculateAverage(this.Natural_Science_and_Technology)
    this.Ave_Economic_Management_Sciences= this.calculateAverage(this.Economic_Management_Sciences)
    this.Ave_Social_Science= this.calculateAverage(this.Social_Science)
    this.Ave_English_HL= this.calculateAverage(this.English_HL)
    this.Ave_Afrikaans_FAL= this.calculateAverage(this.Afrikaans_FAL)

    this.subjectAverages.push({subject:'Mathematics',amount: this.Ave_Mathematics})
    this.subjectAverages.push({subject:'Life Orientation',amount: this.Ave_Life_Orientation})
    this.subjectAverages.push({subject:'Natural Science and Technology',amount: this.Ave_Natural_Science_and_Technology})
    this.subjectAverages.push({subject:'Economic Management Sciences',amount: this.Ave_Economic_Management_Sciences})
    this.subjectAverages.push({subject:'Social Science',amount: this.Ave_Social_Science})
    this.subjectAverages.push({subject:'English HL',amount: this.Ave_English_HL})
    this.subjectAverages.push({subject:'Afrikaans FAL',amount: this.Ave_Afrikaans_FAL})

    this.bestSubject = this.findLargest(this.subjectAverages)
    this.WorstSubject = this.findSmallest(this.subjectAverages)

    this.largestSpend = this.findLargestNegative(this.transactions)
    this.smallestSpend = this.findSmallestNegative(this.transactions)

    console.log(this.bestSubject,this.WorstSubject,this.largestSpend,this.smallestSpend)
  }

  calculateSpent(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.amount<0){
        this.spent+=transaction.amount
      }
      
    });
  }

  calculateDeposit(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.item_purchased=="Parent deposit"){
        this.totalDeposited+=transaction.amount
      }
    });
  }

  calculateSaved(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.account.toLowerCase().includes("savings")){
        this.saved+=transaction.amount
      }
      
    });
  }

  calculateBalance(){
    this.transactions.forEach((transaction:any) => {
      this.balance+=transaction.amount
    });
  }

  findLargestNegative(arr:any) {
    return arr.reduce((largestNegative:any, currentNumber:any) => {
        return parseFloat(currentNumber.amount) < 0 && (largestNegative === null || parseFloat(currentNumber.amount) > parseFloat(largestNegative.amount))
            ? currentNumber
            : largestNegative;
    }, null);
}

findSmallestNegative(arr:any) {
  return arr.reduce((smallestNegative:any, currentNumber:any) => {
      return (currentNumber.amount) < 0 && (smallestNegative === null || parseFloat(currentNumber.amount) < parseFloat(smallestNegative.amount))
          ? currentNumber
          : smallestNegative;
  }, null);
}

findLargest(arr:any) {
    return arr.reduce((largestNegative:any, currentNumber:any) => {
        return (largestNegative === null || parseFloat(currentNumber.amount) > parseFloat(largestNegative.amount))
            ? currentNumber
            : largestNegative;
    }, null);
}

findSmallest(arr:any) {
  return arr.reduce((smallestNegative:any, currentNumber:any) => {
      return  (smallestNegative === null || parseFloat(currentNumber.amount) < parseFloat(smallestNegative.amount))
          ? currentNumber
          : smallestNegative;
  }, null);
}

calculateImprovementPercentage(studentsArray:any) {
  if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
      // Handle invalid input
      return null;
  }

  // Find the minimum and maximum marks_obtained
  let minMarks = studentsArray[0].marks_obtained;
  let maxMarks = studentsArray[0].marks_obtained;

  for (let i = 1; i < studentsArray.length; i++) {
      const currentMarks = studentsArray[i].marks_obtained;
      minMarks = Math.min(minMarks, currentMarks);
      maxMarks = Math.max(maxMarks, currentMarks);
  }

  // Calculate the improvement percentage
  const improvementPercentage = ((maxMarks - minMarks) / minMarks) * 100;

  return improvementPercentage;
}


getHighestMark(assessmentsArray:any) {
  if (!Array.isArray(assessmentsArray) || assessmentsArray.length === 0) {
      // Handle invalid input
      return null;
  }

  // Find the highest percentage achieved
  let highestPercentage = assessmentsArray[0].marks_obtained / assessmentsArray[0].total_marks * 100;

  for (let i = 1; i < assessmentsArray.length; i++) {
      const currentPercentage = assessmentsArray[i].marks_obtained / assessmentsArray[i].total_marks * 100;
      highestPercentage = Math.max(highestPercentage, currentPercentage);
  }

  return highestPercentage;
}


getLowestMark(assessmentsArray:any) {
  if (!Array.isArray(assessmentsArray) || assessmentsArray.length === 0) {
      // Handle invalid input
      return null;
  }

  // Find the lowest percentage achieved
  let lowestPercentage = assessmentsArray[0].marks_obtained / assessmentsArray[0].total_marks * 100;

  for (let i = 1; i < assessmentsArray.length; i++) {
      const currentPercentage = assessmentsArray[i].marks_obtained / assessmentsArray[i].total_marks * 100;
      lowestPercentage = Math.min(lowestPercentage, currentPercentage);
  }

  return lowestPercentage;
}

getAssessmentWithHighestMark(assessmentsArray:any) {
  if (!Array.isArray(assessmentsArray) || assessmentsArray.length === 0) {
      // Handle invalid input
      return null;
  }

  // Find the index of the highest percentage achieved
  let indexOfHighestPercentage = 0;

  for (let i = 1; i < assessmentsArray.length; i++) {
      const currentPercentage = assessmentsArray[i].marks_obtained / assessmentsArray[i].total_marks * 100;
      const highestPercentage = assessmentsArray[indexOfHighestPercentage].marks_obtained / assessmentsArray[indexOfHighestPercentage].total_marks * 100;

      if (currentPercentage > highestPercentage) {
          indexOfHighestPercentage = i;
      }
  }

  return assessmentsArray[indexOfHighestPercentage];
}

getAssessmentWithLowestMark(assessmentsArray:any) {
  if (!Array.isArray(assessmentsArray) || assessmentsArray.length === 0) {
      // Handle invalid input
      return null;
  }

  // Find the index of the lowest percentage achieved
  let indexOfLowestPercentage = 0;

  for (let i = 1; i < assessmentsArray.length; i++) {
      const currentPercentage = assessmentsArray[i].marks_obtained / assessmentsArray[i].total_marks * 100;
      const lowestPercentage = assessmentsArray[indexOfLowestPercentage].marks_obtained / assessmentsArray[indexOfLowestPercentage].total_marks * 100;

      if (currentPercentage < lowestPercentage) {
          indexOfLowestPercentage = i;
      }
  }

  return assessmentsArray[indexOfLowestPercentage];
}


  calculateAverage(array:any){
    let totalScored = 0
    let totalValued = 0

    array.forEach((elem:any)=>{
      totalScored+=parseFloat(elem.marks_obtained)
      totalValued+=parseFloat(elem.total_marks)

      
    })


    let average = (totalScored/totalValued)*100
    return average;
  }

  reload(){
    this.TCCount = 0
    this.program_id = this.program_id
    console.log(this.program_id)
    var accountTotal = this.totalDeposited
    this.http.get("http://localhost:6500/score/subject_score?studentId="+this.student.email+"&programId="+this.program_id+"&depositAmount="+accountTotal).subscribe(
      (score:any)=>{
      this.TCCount = score.toFixed(2)
      this.totalDeposited = accountTotal
  
      this.balance = (parseFloat(this.TCCount)+parseFloat(this.spent))
      console.log(this.balance)},
      (err)=>{
        console.log(err)
    })
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


