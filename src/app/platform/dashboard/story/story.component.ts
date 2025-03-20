import { Component, Input, HostListener, OnInit } from '@angular/core';
import { QuizOption, Story } from './interfaces';
import { Client, Databases, ID } from 'appwrite';
import { StoryService } from '../services/stories.service';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit {
  @Input() showType: boolean = false;
  stories: Story[] = [];

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
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c5088e003ce7be0f38');
  
  databases = new Databases(this.client);

  constructor(private storyService: StoryService) {}

  ngOnInit() {
    // Subscribe to the stories observable from the service
    this.storyService.stories$.subscribe(stories => {
      
      
      // Make sure we have stories to work with
      if (!stories || stories.length === 0) {
        this.stories = [];
        return;
      }
      
      // Deep clone the stories array to avoid reference issues
      const storiesClone = JSON.parse(JSON.stringify(stories));
      
      if (this.showType) {
        // Show only viewed stories if showType is true
        this.stories = storiesClone.filter((story:any) => story.viewed === true);
        
      } else {
        // Show only unviewed stories if showType is false
        this.stories = storiesClone.filter((story:any) => story.viewed !== true);
        
      }
    });
  }

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
    // Deep clone the story to avoid reference issues
    this.currentStory = JSON.parse(JSON.stringify(story));
    
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
            "subject": "Mathematics",
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
    }, 60);
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
    if (this.currentStory && !this.currentStory.viewed) {
      const storyToMarkId = this.currentStory.id;
      
      // Log debugging information with the actual story ID
      
      // Immediately update the local state of the story to viewed
      this.currentStory.viewed = true;
      
      // Update the viewed status in the service and handle errors
      this.storyService.markAsViewed(storyToMarkId).subscribe({
        next: (response) => {
          
          this.storyService.refreshStories();
        },
        error: (err) => {
          console.error(`Error marking story ${storyToMarkId} as viewed:`, err);
          // Don't let the error affect the UI
        },
        complete: () => {
          
        }
      });
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