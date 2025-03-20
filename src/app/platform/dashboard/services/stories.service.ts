// story.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, BehaviorSubject, of } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Story } from '../story/interfaces';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  // Update this URL to point to your Python backend
  private apiUrl = 'https://thuto.server.nexgenlabs.co.za:8000/api/broadcasts';
  private storiesSubject = new BehaviorSubject<Story[]>([]);
  public stories$ = this.storiesSubject.asObservable();
  
  constructor(private http: HttpClient) {
    // Poll for new stories every 60 seconds
    interval(60000).pipe(
      switchMap(() => this.fetchActiveStoriesForUser())
    ).subscribe();
    
    // Initial fetch
    this.fetchActiveStoriesForUser().subscribe();
  }
  
  private getUserId(): string {
    // Get user ID from localStorage or generate a new one if not present
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Date.now().toString();
      localStorage.setItem('userId', userId);
    }
    return userId;
  }
  
  // Add a method to force refresh stories
  public refreshStories(): void {
    this.fetchActiveStoriesForUser().subscribe();
  }
  
  private fetchActiveStoriesForUser(): Observable<Story[]> {
    const userId = this.getUserId();
    
    return this.http.get<any[]>(`${this.apiUrl}/active/user/${userId}`).pipe(
      map(broadcasts => this.transformBroadcastsToStories(broadcasts)),
      tap(stories => {
        // Ensure proper boolean values for viewed property
        const processedStories = stories.map(story => ({
          ...story,
          viewed: Boolean(story.viewed) // Ensure this is a boolean
        }));
        this.storiesSubject.next(processedStories);
      }),
      catchError(err => {
        console.error('Error fetching stories:', err);
        // Return the current stories instead of failing
        return of(this.storiesSubject.getValue());
      })
    );
  }
  
  private transformBroadcastsToStories(broadcasts: any[]): Story[] {
    return broadcasts.map((broadcast, index) => {
      // Get the MongoDB ID from the ID field
      const mongoId = broadcast.id;
      
      // Use the index to create unique IDs for each story (not based on mongoId parsing)
      // This avoids potential ID conflicts or incorrect parsing
      const uniqueId = index + 1;
      
      
      // Transform the broadcast data into the Story format your app expects
      let storyMedia = [];
      
      // If it's an image type, create a media item
      if (broadcast.type === 'image') {
        storyMedia.push({
          url: broadcast.imageUrl || 'assets/story-placeholder.jpg', // Changed to avoid 404
          type: 'image',
          quiz: broadcast.quiz ? {
            question: broadcast.quiz.question,
            options: broadcast.quiz.options
          } : undefined
        });
      } 
      // For text type, use a default image or generate an image from the text
      else {
        storyMedia.push({
          url: 'assets/story-placeholder.jpg', // Changed to avoid 404
          type: 'image'
        });
      }
      
      return {
        id: uniqueId, // Use the unique sequential ID instead of parsing mongoId
        mongoId: mongoId,
        title: broadcast.content || 'Thuto Update',
        media: storyMedia,
        viewed: Boolean(broadcast.viewed), // Ensure this is a boolean value
        color: broadcast.backgroundColor || '#333333'
      };
    });
  }
  
  markAsViewed(storyId: number): Observable<any> {
    const userId = this.getUserId();
    
    // Find the story in our current state to get the MongoDB ID
    const stories = this.storiesSubject.getValue();
    
    // Find the story by ID with additional logging to debug potential issues
    
    const story = stories.find(s => s.id === storyId);
    
    if (!story) {
      console.error(`Story with ID ${storyId} not found in current state!`);
      return of({ success: false, error: 'Story not found' });
    }
    
    // Use the MongoDB ID if available
    const idToUse = story.mongoId || storyId.toString();
    
    
    // Call the backend to mark the story as viewed by this user
    return this.http.post(`${this.apiUrl}/${idToUse}/viewed/${userId}`, {}).pipe(
      tap(response => {
        
        // Update the local state
        const updatedStories = stories.map(s => 
          s.id === storyId ? { ...s, viewed: true } : s
        );
        
        
    
        this.storiesSubject.next(updatedStories);
      }),
      catchError(error => {
        console.error(`Error marking story ${storyId} ("${story.title}") as viewed:`, error);
        
        // Update local state anyway to avoid UI issues
        const updatedStories = stories.map(s => 
          s.id === storyId ? { ...s, viewed: true } : s
        );
        
        
        this.storiesSubject.next(updatedStories);
        
        // Return a success response to avoid breaking the UI
        return of({ success: true });
      })
    );
  }
  
  createStory(story: any): Observable<any> {
    // Transform Story format to broadcast format
    const broadcast = {
      content: story.title,
      type: story.media && story.media.length > 0 ? 'image' : 'text',
      backgroundColor: story.color,
      imageUrl: story.media && story.media.length > 0 ? story.media[0].url : undefined,
      caption: story.title,
      quiz: story.media && story.media.length > 0 ? story.media[0].quiz : undefined
    };
    
    return this.http.post<any>(this.apiUrl, broadcast).pipe(
      tap(() => this.refreshStories())
    );
  }
}