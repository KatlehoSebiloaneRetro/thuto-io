import { Component, OnInit } from '@angular/core';
import { StoryService } from '../services/stories.service';

@Component({
  selector: 'app-story-container',
  templateUrl: './story-container.component.html',
  styleUrls: ['./story-container.component.sass']
})
export class StoryContainerComponent implements OnInit {


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

constructor(private storyService: StoryService) { }

  ngOnInit(): void {
    // The service will automatically fetch stories when initialized
  }

}
