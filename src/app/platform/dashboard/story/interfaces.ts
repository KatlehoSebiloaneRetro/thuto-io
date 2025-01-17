export interface QuizOption {
    id: number;
    text: string;
    isCorrect: boolean;
  }
  
  export interface QuizQuestion {
    question: string;
    options: QuizOption[];
  }
  
  export interface StoryMedia {
    url: string;
    quiz?: QuizQuestion;
  }
  
  export interface Story {
    id: number;
    title: string;
    media: StoryMedia[];
    viewed: boolean;
  }