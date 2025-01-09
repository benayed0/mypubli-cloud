import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { ArticleService } from '../services/article/article.service';

export interface Article {
  article_id: string;
  createdAt: string;
  article_name?: string;
  report_name: string;
  scientificDoc_name: string;
  state: string;
}

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css',
})
export class ArticlesComponent {
  @Input('articles') articles: Article[] = [];
  articleService = inject(ArticleService);
  articleColumns: string[] = [
    'createdAt',
    'article_name',
    'report_name',
    'scientificDoc_name',
    'state',
    'action',
  ];
  convertState(state: string): string {
    switch (state) {
      case 'ready':
        return 'Prêt';
      case 'processing':
        return 'En cours';
      default:
        return state;
    }
  }
  downloadFile(article: Article, file: 'report' | 'scientific_doc' | 'report') {
    this.articleService
      .getDownloadUrl(article.article_id, file)
      .subscribe(({ url }) => {
        window.open(url);
      });
  }
}
