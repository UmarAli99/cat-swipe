import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CatService {
  private base = 'https://cataas.com/cat'; 

  constructor(private http: HttpClient) {}

  getCatUrls(count: number): Observable<string[]> {
    const urls = Array.from({ length: count }).map(() => `${this.base}?${Date.now()}-${Math.random()}`);
    return from([urls]);
  }
}
