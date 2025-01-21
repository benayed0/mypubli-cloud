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
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
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
import { ConfirmDialogComponent } from './confirm-delete/confirm-dialog.component';

export enum STATE {
  UPLOADING_FILES = 'UPLOADING_FILES',
  WAITING_FOR_TOPICS = 'WAITING_FOR_TOPICS',
  WAITING_FOR_TOPIC = 'WAITING_FOR_TOPIC',
  WAITING_FOR_ARTICLE = 'WAITING_FOR_ARTICLE',
  WRITING_ARTICLE = 'WRITING_ARTICLE',
  ARTICLE_READY = 'ARTICLE_READY',
}
export interface Article {
  article_id: string;
  createdAt: string;
  article_name?: string;
  report_name: string;
  scientificDocs: { name: string; id: string }[];
  scientificDocSelected?: { name: string; id: string };
  state: STATE;
  authors: {
    name: string;
    conflicts: string;
    contributions: string[];
  }[];
  topics: string[];
  topic: string;
  fundings?: string[];
  acknowledgments?: string[];
  finishedAt?: Date;
  additional_infos?: string;
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
    NgClass,
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
    'action',
    'createdAt',
    'article_name',
    'report_name',
    'scientificDoc_name',
    'state',
    'dl',
  ];
  highlightedRow: string = '';
  sortAscending = true;
  sortData(column: string) {
    if (column === 'createdAt') {
      this.sortAscending = !this.sortAscending; // Toggle the sorting order

      const sorted = this.articles.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime(); // Convert to timestamp for accurate comparison
        const dateB = new Date(b.createdAt).getTime();

        // Sort based on the current sorting direction
        return this.sortAscending ? dateA - dateB : dateB - dateA;
      });
      this.articles = [...sorted];
    }
  }
  trackState(article: Article) {
    console.log('tracking ', article.article_id);

    const createdAt = new Date(article.createdAt).getTime();
    const now = new Date().getTime();
    const tenMinutesInMs = 10 * 60 * 1000;
    const article_index = this.articles.findIndex(
      ({ article_id }) => article_id === article.article_id
    );
    const delay = tenMinutesInMs - (now - createdAt);

    setTimeout(() => {
      console.log('checking ', article.article_id);

      this.articleService
        .getOne(article.article_id)
        .subscribe(({ state, article_name, finishedAt, topic }) => {
          if (state === 'ARTICLE_READY') {
            this.sortAscending = true;
            this.sortData('createdAt');
            this.highlightedRow = article.article_id;
            this.articles[article_index].state = state;
            this.articles[article_index].article_name = article_name;
            this.articles[article_index].finishedAt = finishedAt;
            this.articles = [...this.articles];
            this.toastr.success(
              `Votre article portant le sujet : ${topic} est prêt !`
            );
          }
        });
    }, delay);
  }
  ngOnChanges(): void {
    // Preselect the first scientificDoc for each article
    this.articles.forEach((article) => {
      if (article.state === 'WRITING_ARTICLE') {
        this.trackState(article);
        console.log('tracked');
      }

      if (article.scientificDocs && article.scientificDocs.length > 0) {
        article.scientificDocSelected = article.scientificDocs[0];
      }
    });
  }
  openDetails(article: Article) {
    this.dialog.open(ArticleDetailsComponent, {
      data: { article: article },
      width: 'auto',
      height: 'auto',
      maxHeight: '80vh',
      maxWidth: '50vw',
    });
  }
  calculateDiff(article: Article) {
    const diffInMs =
      new Date(article.finishedAt!).getTime() -
      new Date(article.createdAt).getTime();
    const minutes = Math.floor(diffInMs / (1000 * 60));
    const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
    return article.state === 'ARTICLE_READY'
      ? article.finishedAt
        ? `Prêt en ${minutes} minutes ${seconds} secondes`
        : ''
      : '';
  }
  convertState(state: STATE): string {
    switch (state) {
      case 'ARTICLE_READY':
        return 'Prêt';
      case 'WRITING_ARTICLE':
        return "Création de l'article";
      case 'WAITING_FOR_ARTICLE':
      case 'WAITING_FOR_TOPIC':
      case 'WAITING_FOR_TOPICS':
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
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Suppression de l'article :",
          message: 'Êtes-vous sûr de vouloir supprimer cet article ?',
          confirmLabel: 'Supprimer',
          cancelLabel: 'Annuler',
          itemName: article.article_name
            ? article.article_name.split('.')[0]
            : 'En cours de traitement',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
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
        } else {
          this.toastr.info('Suppression annulée');
        }
      });
  }
}
