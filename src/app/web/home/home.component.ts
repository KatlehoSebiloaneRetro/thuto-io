import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  constructor() { }
  home_banner = "The Future Of Tutoring Has Arrived. Join Thutor Today!"
  header_one_home = "Unlock academic success and financial inclusion with Thuto.io"
  content_one_home = "Thuto.io rewards students for their academic achievements with Thuto Coins, allowing them to access a range of products and services in our marketplace.<br/><br/><br/>Join us today and empower your future."
  header_two_home = "Unlock the power of academic achievement with Thuto Coins."
  content_two_home = "Thuto.io revolutionizes education by rewarding students for their academic progress. With Thuto Coins, students can access a marketplace filled with products and services that contribute to their personal growth and financial inclusion. <br/><br/> Join the digital ecosystem that empowers students and drives economic transformation."
  header_three_home = "Why does it work?"
  content_three_home = "more(engagement + dedication) x Quality content ^ (real-world use of tokens)"
  header_four_home = "="
  content_four_home = "Financially Included, Smart, and Dedicated Youth"
  header_five_home = "Unlock the power of education and financial inclusion with Thuto.io."

  features = [
    {
      header:"Unlock rewards for your academic success.",
      content:"Your hard work deserves recognition. Earn tokens based on your personal progressive performance and unlock rewards that can be used to purchase items, save, invest, or transact in the real world. Join Thuto.io and be included in the formal financial ecosystem while improving and increasing your academic outcomes.",
      link:"../../../assets/feature1.png",
      swop:false
    },
    {
      header:"Unlock your earning potential with curated academic content.",
      content:"Don't just study, earn! Engage with our curated academic content focused on microlearning and maximize your earning potential. With Thuto.io, you can boost your academic outcomes while also building a valuable digital currency that can be used in the real world. Start earning tokens today and unlock a world of possibilities.",
      link:"../../../assets/feature2.png",
      swop:true
    },
    {
      header:"Empower students with real-world financial skills.",
      content:"Thuto.io goes beyond traditional academic rewards. By using tokens for financial activities like buying, saving, and investing, students gain practical experience in financial literacy. This empowers them to make informed decisions and prepares them for success in the real world. Join Thuto.io and unlock a brighter future for students today.",
      link:"../../../assets/feature3.png",
      swop:false
    },
  ]

  section ={
    header:"Empower students with real-world financial skills.",
    content:"Thuto.io goes beyond traditional academic rewards. By using tokens for financial activities like buying, saving, and investing, students gain practical experience in financial literacy. This empowers them to make informed decisions and prepares them for success in the real world. Join Thuto.io and unlock a brighter future for students today.",
    link:"../../../assets/Thuto.io.png",
    swop:false
  }

  review1 = "'Absolutely Amazing ❤️' - Dikeledi"
  review2 = "'I honestly cannot wait for my 5 year old to use thuto' - Mothusi"
  ngOnInit(): void {
  }

}
