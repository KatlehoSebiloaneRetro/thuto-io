import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'thutor',
  templateUrl: './thutor.component.html',
  styleUrls: ['./thutor.component.sass']
})
export class ThutorComponent implements OnInit {

  constructor() { }

  home_banner = "The Future Of Tutoring Has Arrived. Join Thutor Today!"
  header_one_home = "Unlock the thrill of learning and earning with Thutor."
  content_one_home = "Experience the ultimate tutoring experience with Thutor. Learn from expert educators while earning valuable Thuto Coins that can unlock real-world benefits. Don't settle for ordinary tutoring when you can be part of something extraordinary.<br/><br/><br/>Join Thutor today and let knowledge and rewards go hand in hand."
  header_two_home = "Unlock the power of academic achievement with Thuto Coins."
  content_two_home = "Thuto.io revolutionizes education by rewarding students for their academic progress. With Thuto Coins, students can access a marketplace filled with products and services that contribute to their personal growth and financial inclusion. <br/><br/> Join the digital ecosystem that empowers students and drives economic transformation."
  header_three_home = "Why does it work?"
  content_three_home = "more(engagement + dedication) x Quality content ^ (real-world use of tokens)"
  header_four_home = "="
  content_four_home = "Financially Included, Smart, and Dedicated Youth"

  features = [
    {
      header:"Learn from the best and earn amazing rewards.",
      content:"Don't settle for ordinary tutoring when you can be part of something extraordinary. With Thutor, you'll receive top-notch tutoring from expert educators and earn valuable tokens for your engagement and stellar performance. These Thuto Coins can be used to unlock incredible real-world benefits. Imagine getting paid to learn! Join Thutor today and experience the thrill of knowledge and reward.",
      link:"../../../assets/Thutoring.png",
      swop:false
    },
  ]

  review1 = "'You need to open Thuto to individual students ' - Musa"
  review2 = "'I honestly cannot wait for my 5 year old to use thuto' - Mothusi"

  ngOnInit(): void {
  }

}
