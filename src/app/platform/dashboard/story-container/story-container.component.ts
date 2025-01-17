import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-story-container',
  templateUrl: './story-container.component.html',
  styleUrls: ['./story-container.component.sass']
})
export class StoryContainerComponent implements OnInit {

  constructor() { }


  stories = [
    {
      title: 'Your FQ Score',
      color: "#EBA5C5",
      media: [
        { url: 'assets/story1.jpg', type: 'image' },
        { url: 'assets/story2.jpg', type: 'image' },
        { url: 'assets/story3.jpg', type: 'image' },
      ],
      viewed: false
    },
    {
      title: 'Mathematics',
      color: "#F79E1B",
      media: [
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'Solve for x: 3x + 7 = 22',
            options: [
              { id: 1, text: '3', isCorrect: false },
              { id: 2, text: '5', isCorrect: true },
              { id: 3, text: '7', isCorrect: false },
              { id: 4, text: '8', isCorrect: false }
            ]
          }
        },
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'What is the area of a rectangle with length 12cm and width 5cm?',
            options: [
              { id: 1, text: '34 cm²', isCorrect: false },
              { id: 2, text: '60 cm²', isCorrect: true },
              { id: 3, text: '17 cm²', isCorrect: false },
              { id: 4, text: '85 cm²', isCorrect: false }
            ]
          }
        },
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'Which of these is equivalent to 75%?',
            options: [
              { id: 1, text: '0.75', isCorrect: true },
              { id: 2, text: '0.075', isCorrect: false },
              { id: 3, text: '7.5', isCorrect: false },
              { id: 4, text: '0.175', isCorrect: false }
            ]
          }
        },
      ],
      viewed: false
    },
    {
      title: 'Life Orientation',
      color: "#0078BD",
      media: [
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'Which of these is NOT a healthy way to cope with stress?',
            options: [
              { id: 1, text: 'Exercise', isCorrect: false },
              { id: 2, text: 'Isolating yourself', isCorrect: true },
              { id: 3, text: 'Talking to friends', isCorrect: false },
              { id: 4, text: 'Deep breathing', isCorrect: false }
            ]
          }
        },
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'What is peer pressure?',
            options: [
              { id: 1, text: 'Helping friends with homework', isCorrect: false },
              { id: 2, text: 'Influence from people your age to do something', isCorrect: true },
              { id: 3, text: 'Pressure from teachers', isCorrect: false },
              { id: 4, text: 'Pressure from parents', isCorrect: false }
            ]
          }
        },
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'Which is an example of a long-term goal?',
            options: [
              { id: 1, text: 'Finishing homework tonight', isCorrect: false },
              { id: 2, text: 'Getting to class on time', isCorrect: false },
              { id: 3, text: 'Graduating high school', isCorrect: true },
              { id: 4, text: 'Eating lunch', isCorrect: false }
            ]
          }
        },
      ],
      viewed: false
    },
    {
      title: 'English HL',
      color: "#4E46B4",
      media: [
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'Which literary device is used when saying "The wind whispered"?',
            options: [
              { id: 1, text: 'Metaphor', isCorrect: false },
              { id: 2, text: 'Personification', isCorrect: true },
              { id: 3, text: 'Simile', isCorrect: false },
              { id: 4, text: 'Alliteration', isCorrect: false }
            ]
          }
        },
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'What is the main difference between a protagonist and an antagonist?',
            options: [
              { id: 1, text: 'Their age', isCorrect: false },
              { id: 2, text: 'The protagonist leads the story while the antagonist opposes them', isCorrect: true },
              { id: 3, text: 'Their gender', isCorrect: false },
              { id: 4, text: 'The length of their names', isCorrect: false }
            ]
          }
        },
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'Which sentence uses the correct form of there/their/they\'re?',
            options: [
              { id: 1, text: 'There going to the store', isCorrect: false },
              { id: 2, text: 'Their going to the store', isCorrect: false },
              { id: 3, text: 'They\'re going to the store', isCorrect: true },
              { id: 4, text: 'Theyre going to the store', isCorrect: false }
            ]
          }
        },
      ],
      viewed: false
    },
    {
      title: 'Afrikaans FAL',
      color: "#27AB87",
      media: [
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'Wat is die korrekte meervoud van "kind"?',
            options: [
              { id: 1, text: 'kindes', isCorrect: false },
              { id: 2, text: 'kinders', isCorrect: true },
              { id: 3, text: 'kinderen', isCorrect: false },
              { id: 4, text: 'kinds', isCorrect: false }
            ]
          }
        },
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'Watter woord is \'n sinoniem vir "mooi"?',
            options: [
              { id: 1, text: 'lelik', isCorrect: false },
              { id: 2, text: 'pragtig', isCorrect: true },
              { id: 3, text: 'vuil', isCorrect: false },
              { id: 4, text: 'sleg', isCorrect: false }
            ]
          }
        },
        { 
          url: 'assets/gwp.jpg', 
          type: 'image',
          quiz: {
            question: 'Wat is die verkleinwoord van "boom"?',
            options: [
              { id: 1, text: 'boompie', isCorrect: true },
              { id: 2, text: 'boomtjie', isCorrect: false },
              { id: 3, text: 'boometjie', isCorrect: false },
              { id: 4, text: 'klein boom', isCorrect: false }
            ]
          }
        },
      ],
      viewed: false
    },
];
  activeItemIndex = 0;

  items = [
    {
        text: 'Thuto Stories',
        active: true,
        function: ()=>{
          this.activeItemIndex = 0;
          this.items[0].active = true
          this.items[1].active = false
        }
    },
    {
        text: 'Thutor',
        active: false,
        function: ()=>{
          this.activeItemIndex = 1;
          this.items[1].active = true
          this.items[0].active = false
        }
    }
];

  ngOnInit(): void {
  }

}
