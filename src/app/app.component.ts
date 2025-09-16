import { Component, HostListener, OnInit } from '@angular/core';
import { CatService } from './cat.service';

interface Card {
  id: number;
  url: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Cat Swipe';
  cards: Card[] = [];
  currentIndex = 0; 
  liked: Card[] = [];
  disliked: Card[] = [];
  isSummary = false;

  dragging = false;
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  translateX = 0;
  translateY = 0;
  rotation = 0;

  private THROW_THRESHOLD = 100;

  constructor(private catService: CatService) {}

  ngOnInit() {
    this.loadCats(20);
  }

  loadCats(count: number) {
    this.catService.getCatUrls(count).subscribe(urls => {
      this.cards = urls.map((u, i) => ({ id: i + 1, url: u }));
      this.currentIndex = 0;
      this.liked = [];
      this.disliked = [];
      this.isSummary = false;
    });
  }

  onPointerDown(ev: PointerEvent, cardIndex: number) {
    if (cardIndex !== this.currentIndex) return;
    (ev.target as Element).setPointerCapture(ev.pointerId);
    this.dragging = true;
    this.startX = ev.clientX;
    this.startY = ev.clientY;
  }

  onPointerMove(ev: PointerEvent, cardIndex: number) {
    if (!this.dragging || cardIndex !== this.currentIndex) return;
    this.currentX = ev.clientX;
    this.currentY = ev.clientY;
    this.translateX = this.currentX - this.startX;
    this.translateY = this.currentY - this.startY;
    this.rotation = (this.translateX / window.innerWidth) * 30; 
  }

  onPointerUp(ev: PointerEvent, cardIndex: number) {
    if (!this.dragging || cardIndex !== this.currentIndex) return;
    this.dragging = false;

    const deltaX = this.translateX;
    if (Math.abs(deltaX) > this.THROW_THRESHOLD) {
      const liked = deltaX > 0;
      this.throwCard(liked);
    } else {
      this.resetCardPosition();
    }
  }

  swipeLeft() {
    this.translateX = -window.innerWidth; this.rotation = -25;
    this.throwCard(false);
  }
  swipeRight() {
    this.translateX = window.innerWidth; this.rotation = 25;
    this.throwCard(true);
  }

  throwCard(liked: boolean) {
    const card = this.cards[this.currentIndex];
    if (!card) return;
    if (liked) this.liked.push(card); else this.disliked.push(card);

    setTimeout(() => {
      this.currentIndex++;
      this.translateX = 0; this.translateY = 0; this.rotation = 0;

      if (this.currentIndex >= this.cards.length) {
        this.isSummary = true;
      }
    }, 250);
  }

  resetCardPosition() {
    this.translateX = 0; this.translateY = 0; this.rotation = 0;
  }

  getCardStyle(index: number) {
    const baseCenter = 'translate(-50%, -50%)';

    if (index < this.currentIndex) {
      return {
        transform: `${baseCenter} scale(0.9) translateY(40px) rotate(0deg)`,
        opacity: '0',
        zIndex: '1'
      };
    }

    if (index === this.currentIndex) {
      const transform = `${baseCenter} translate(${this.translateX}px, ${this.translateY}px) rotate(${this.rotation}deg)`;
      return { transform, zIndex: '10', opacity: '1' };
    }

    const offset = (index - this.currentIndex) * 8;
    const scale = 1 - offset / 200;
    return {
      transform: `${baseCenter} scale(${scale}) translateY(${offset}px)`,
      zIndex: String(5 - index),
      opacity: '1'
    };
  }
}
