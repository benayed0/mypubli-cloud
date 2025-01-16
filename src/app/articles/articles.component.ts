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
import { MatDialog } from '@angular/material/dialog';
import { ArticleDetailsComponent } from '../article-details/article-details.component';
import { MatMenuModule } from '@angular/material/menu';
import { HotToastService } from '@ngneat/hot-toast';

type state = 'pending' | 'uploaded' | 'processing' | 'ready';
export interface Article {
  article_id: string;
  createdAt: string;
  article_name?: string;
  report_name: string;
  scientificDocs: { name: string; id: string }[];
  scientificDocSelected?: { name: string; id: string };
  state: state;
  authors: {
    name: string;
    conflicts: string;
    contributions: string[];
  }[];
  topics: string[];
  topic: string;
  fundings?: string[];
  acknowledgments?: string[];
}

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    MatMenuModule,
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
  constructor(private dialog: MatDialog) {}
  @Input('articles') articles: Article[] = [];
  loaderService = inject(LoaderService);
  articleService = inject(ArticleService);
  toastr = inject(HotToastService);
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
  openDetails(article: Article) {
    return;
    this.dialog.open(ArticleDetailsComponent, {
      data: { article_id: article.article_id },
      width: 'auto',
      height: 'auto',
      maxHeight: '80vh',
      maxWidth: '50vw',
    });
  }
  convertState(state: state): string {
    switch (state) {
      case 'ready':
        return 'Prêt';
      case 'processing':
        return 'En cours';
      case 'uploaded':
      case 'pending':
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
  deleteArticle(article: Article) {
    this.articleService
      .deleteArticle(article.article_id)
      .subscribe(({ success }) => {
        if (success) {
          this.articles = this.articles.filter(
            ({ article_id }) => article_id !== article.article_id
          );
          this.toastr.success('Article supprimé avec succès');
        }
      });
  }
}
