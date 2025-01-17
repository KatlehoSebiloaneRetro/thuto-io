// import { Component, Input } from '@angular/core';
// import { QuizOption, Story } from './interfaces';
// import { Client, Databases, ID } from 'appwrite';

// @Component({
//   selector: 'app-story',
//   templateUrl: './story.component.html',
//   styleUrls: ['./story.component.sass']
// })

// export class StoryComponent {

//   @Input()
//   stories:any

//   @Input()
//   showType:boolean = false

//   selectedOption: number | null = null;
//   isAnswered: boolean = false;
//   isCorrectAnswer: boolean = false;

//   currentStory: any = null;
//   currentIndex: number = 0;
//   intervalId: any;
//   progress:any = 0;
//   readonly duration = 2000;
//   client = new Client()
//   .setEndpoint('https://thuto.appwrite.nexgenlabs.co.za/v1')
//   .setProject('672b43fb00096f3a294e');
  
//   databases = new Databases(this.client);

//   viewStory(story: Story, index: number) {
//     this.currentStory = story;
//     this.currentIndex = 0;
//     this.progress = 0;
//     this.resetQuiz();
//     this.startProgressBar();
//   }

//   resetQuiz() {
//     this.selectedOption = null;
//     this.isAnswered = false;
//     this.isCorrectAnswer = false;
//   }

//   getCorrectAnswer(options: QuizOption[]): string {
//     const correctOption = options.find(option => option.isCorrect);
//     return correctOption ? correctOption.text : '';
//   }

//   answerQuestion(option: QuizOption,story:Story) {
//     this.selectedOption = option.id;
//     this.isAnswered = true;
//     this.isCorrectAnswer = option.isCorrect;
    
//     // Pause progress bar
//     this.pauseProgressBar();
    
//     // Continue to next slide after delay if answer is correct
//     if (this.isCorrectAnswer) {
//       setTimeout(() => {
//         this.databases.createDocument(
//           'thuto',
//           '659fe319e187ce2be36c',
//           ID.unique(),
//           {
//                 "id":'id',
//                 "sub-title":'sub-title'+story.title,
//                 "description":story.title+' quiz'+ Date.now().toString(),
//                 "total_marks":"100",
//                 "passing_marks":"100",
//                 "student_id":localStorage.getItem('studentID'),
//                 "student_name":localStorage.getItem('studentID'),
//                 "marks_obtained":"100",
//                 "teacher_remarks":"Well done",
//                 "subject":story.title
//           }
//       )
//         this.nextMedia();
//       }, 2000);
//     }
//   }

//   startProgressBar() {
//     const interval = setInterval(() => {
//       if (this.progress < 100) {
//         this.progress += 0.05;
//       } else {
//         clearInterval(interval);
//         this.nextMedia();
//       }
//     }, 30);
//   }

//   pauseProgressBar() {
//     // Implementation to pause progress
//   }

//   prevMedia() {
//     if (this.currentIndex > 0) {
//       this.currentIndex--;
//       this.progress = 0;
//       this.resetQuiz();
//       this.startProgressBar();
//     }
//   }

//   nextMedia() {
//     if (this.currentStory && this.currentIndex < this.currentStory.media.length - 1) {
//       this.currentIndex++;
//       this.progress = 0;
//       this.resetQuiz();
//       this.startProgressBar();
//     } else {
//       this.closeStory();
//     }
//   }

//   closeStory() {
//     if (this.currentStory) {
//       this.currentStory.viewed = true;
//     }
//     this.currentStory = null;
//     this.currentIndex = 0;
//   }

//   clearInterval() {
//     if (this.intervalId) {
//       clearInterval(this.intervalId);
//       this.intervalId = null;
//     }
//   }
// }


import { Component, Input, HostListener } from '@angular/core';
import { QuizOption, Story } from './interfaces';
import { Client, Databases, ID } from 'appwrite';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass']
})
export class StoryComponent {
  @Input() stories: any;
  @Input() showType: boolean = false;

  selectedOption: number | null = null;
  isAnswered: boolean = false;
  isCorrectAnswer: boolean = false;
  isPaused: boolean = false;
  touchStartTime: number = 0;
  touchStartX: number = 0;

  currentStory: any = null;
  currentIndex: number = 0;
  intervalId: any;
  progress: any = 0;
  readonly duration = 2000;
  readonly LONG_PRESS_DURATION = 500; // 500ms for long press

  client = new Client()
    .setEndpoint('https://thuto.appwrite.nexgenlabs.co.za/v1')
    .setProject('672b43fb00096f3a294e');
  
  databases = new Databases(this.client);

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (!this.currentStory) return;
    
    this.touchStartTime = Date.now();
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (!this.currentStory) return;

    const touchDuration = Date.now() - this.touchStartTime;
    const touchEndX = event.changedTouches[0].clientX;
    const screenWidth = window.innerWidth;
    const touchX = touchEndX;

    // Handle long press
    if (touchDuration >= this.LONG_PRESS_DURATION) {
      this.togglePause();
      return;
    }

    // Only handle navigation if not interacting with quiz
    const quizContainer = (event.target as HTMLElement).closest('.quiz-container');
    if (quizContainer) return;

    // Handle left/right navigation
    if (touchX < screenWidth * 0.3) {
      this.prevMedia();
    } else if (touchX > screenWidth * 0.7) {
      this.nextMedia();
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pauseProgressBar();
    } else {
      this.startProgressBar();
    }
  }

  viewStory(story: Story, index: number) {
    this.currentStory = story;
    this.currentIndex = 0;
    this.progress = 0;
    this.isPaused = false;
    this.resetQuiz();
    this.startProgressBar();
  }

  resetQuiz() {
    this.selectedOption = null;
    this.isAnswered = false;
    this.isCorrectAnswer = false;
  }

  getCorrectAnswer(options: QuizOption[]): string {
    const correctOption = options.find(option => option.isCorrect);
    return correctOption ? correctOption.text : '';
  }

  answerQuestion(option: QuizOption, story: Story) {
    this.selectedOption = option.id;
    this.isAnswered = true;
    this.isCorrectAnswer = option.isCorrect;
    
    this.pauseProgressBar();
    
    if (this.isCorrectAnswer) {
      setTimeout(() => {
        this.databases.createDocument(
          'thuto',
          'assessments',
          ID.unique(),
          {
            "id": 'id',
            "sub-title": 'sub-title' + story.title,
            "description": story.title + ' quiz' + Date.now().toString(),
            "total_marks": "100",
            "passing_marks": "100",
            "student_id": localStorage.getItem('studentID'),
            "student_name": localStorage.getItem('studentID'),
            "marks_obtained": "100",
            "teacher_remarks": "Well done",
            "subject": story.title,
            'type': 'STORY',
            'weekNumber': 5,
            'isSelfReported': false,
            'dateCreated': Date.now().toString()
          }
        )
        this.nextMedia();
      }, 2000);
    }
  }

  startProgressBar() {
    this.clearInterval();
    this.intervalId = setInterval(() => {
      if (!this.isPaused && this.progress < 100) {
        this.progress += 0.05;
      } else if (this.progress >= 100) {
        this.clearInterval();
        this.nextMedia();
      }
    }, 30);
  }

  pauseProgressBar() {
    this.clearInterval();
  }

  prevMedia() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.progress = 0;
      this.clearInterval();
      this.resetQuiz();
      this.startProgressBar();
    }
  }

  nextMedia() {
    if (this.currentStory && this.currentIndex < this.currentStory.media.length - 1) {
      this.currentIndex++;
      this.progress = 0;
      this.clearInterval();
      this.resetQuiz();
      this.startProgressBar();
    } else {
      this.closeStory();
    }
  }

  closeStory() {
    if (this.currentStory) {
      this.currentStory.viewed = true;
    }
    this.currentStory = null;
    this.currentIndex = 0;
    this.clearInterval();
  }

  clearInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}