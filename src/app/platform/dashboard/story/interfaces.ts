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
    mongoId?: string;       // Add MongoDB ID
    numericId?: string;     // Add numeric ID as string
    title: string;
    media: StoryMedia[];
    viewed: boolean;
    color?: string;
  }