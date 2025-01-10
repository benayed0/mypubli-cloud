import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ArticleService } from '../services/article/article.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { LoaderService } from '../services/loader/loader.service';
type state = 'uploaded' | 'processing' | 'ready';
export interface Article {
  article_id: string;
  createdAt: string;
  article_name?: string;
  report_name: string;
  scientificDocs: { name: string; id: string }[];
  scientificDocSelected?: { name: string; id: string };
  state: state;
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
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    NgxSkeletonLoaderModule,
    AsyncPipe,
  ],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css',
})
export class ArticlesComponent implements OnChanges {
  @Input('articles') articles: Article[] = [];
  loaderService = inject(LoaderService);
  articleService = inject(ArticleService);
  articleColumns: string[] = [
    'createdAt',
    'article_name',
    'report_name',
    'scientificDoc_name',
    'state',
    'action',
  ];
  onSelectInput(article: Article, target: any) {
    console.log(article, target.value);
  }
  ngOnChanges(): void {
    // Preselect the first scientificDoc for each article
    this.articles.forEach((article) => {
      if (article.scientificDocs && article.scientificDocs.length > 0) {
        article.scientificDocSelected = article.scientificDocs[0];
        console.log(article.scientificDocSelected);
      }
    });
  }

  convertState(state: state): string {
    switch (state) {
      case 'ready':
        return 'Prêt';
      case 'processing':
        return 'En cours';
      case 'uploaded':
        return 'En attente';
      default:
        return state;
    }
  }
  downloadFile(
    article: Article,
    file: 'article' | 'scientific_doc' | 'report',
    id?: string
  ) {
    this.articleService
      .getDownloadUrl(article.article_id, file, id)
      .subscribe(({ url }) => {
        window.open(url);
      });
  }
}
