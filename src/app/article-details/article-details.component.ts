import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { HotToastService } from '@ngneat/hot-toast';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ArticleService } from '../services/article/article.service';
import { interval, switchMap, Subject, takeUntil } from 'rxjs';
import { Article, STATE } from '../articles/articles.component';
import { NgClass } from '@angular/common';
import { TopicInputComponent } from './topic-input/topic-input.component';

@Component({
  selector: 'app-article-details',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    NgClass,
  ],
  templateUrl: './article-details.component.html',
  styleUrl: './article-details.component.css',
})
export class ArticleDetailsComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ArticleDetailsComponent>,

    private toast: HotToastService,
    private articleService: ArticleService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: { article_id: string; article?: Article }
  ) {}
  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification(event: any) {
  //   console.log('loaded');

  //   if (this.data.article === undefined) {
  //     event.preventDefault();

  //     (event as BeforeUnloadEvent).returnValue =
  //       'You have unsaved changes. Are you sure you want to leave?';
  //   }
  // }
  article = this.data.article ? this.data.article : undefined;
  topics: string[] = [];
  topic_name = '';
  additional_infos = '';
  acknowledgments: { value: string }[] = this.data.article
    ? this.data.article.acknowledgments
      ? this.data.article.acknowledgments.map((value) => ({ value }))
      : [{ value: '' }]
    : [{ value: '' }];
  fundings: { value: string }[] = this.data.article
    ? this.data.article.fundings
      ? this.data.article.fundings.map((value) => ({ value }))
      : [{ value: '' }]
    : [{ value: '' }];
  contributions = [
    'provided data',
    'wrote the article',
    'performed the analysis',
    'created the figures',
    'reviewed the manuscript',
  ];
  authors: {
    name: string;
    withConflicts: boolean;
    conflicts: string;
    contributions: string[];
  }[] = this.data.article
    ? this.data.article.authors.map((author) => ({
        ...author,
        withConflicts: author.conflicts !== '',
      }))
    : [
        {
          name: '',
          withConflicts: false,
          conflicts: '',
          contributions: this.contributions,
        },
      ];
  private destroy$ = new Subject<void>();

  author_number(id: number): string {
    return id === 1 ? '1er' : `${id}ème`;
  }
  ngOnInit(): void {
    this.getTopics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTopics() {
    if (this.data.article_id !== undefined) {
      console.log('Article ID:', this.data.article_id);
      interval(5000) // Emit every 5 seconds
        .pipe(
          takeUntil(this.destroy$), // Continue while topics is empty
          switchMap(() => this.articleService.getTopics(this.data.article_id)) // Fetch topics
        )
        .subscribe({
          next: ({ topics }) => {
            if (topics.length > 0) {
              this.topics = topics;
              this.topic_name = topics[0];
              this.toast.success(
                'Sujets générés avec succès ! \n Vous pouvez maintenant choisir un sujet.'
              );
              console.log('Topics fetched:', this.topics);
              this.destroy$.next();
            }
          },
          error: (err) => {
            console.error('Error fetching topics:', err);
            this.toast.error('Failed to fetch topics. Please try again later.');
          },
          complete: () => {
            console.log('Completed');
          },
        });
    }
  }
  checkTopic(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue === 'button') {
      this.dialog
        .open(TopicInputComponent, {
          width: '600px',
        })
        .afterClosed()
        .subscribe((topic) => {
          if (topic !== undefined && topic !== '') {
            this.topics.push(topic);
            this.topic_name = topic;
          }
        });
    }
  }
  removeAuthor(index: number) {
    this.authors.splice(index, 1);
  }
  removeFunding(index: number) {
    this.fundings.splice(index, 1);
  }
  removeAcknowledgment(index: number) {
    this.acknowledgments.splice(index, 1);
  }
  selectAll(idx: number) {
    this.authors[idx].contributions =
      this.authors[idx].contributions.length === 0 ? this.contributions : [];
  }
  addAuthor() {
    const lastElement = this.authors[this.authors.length - 1].name;
    if (lastElement === '') {
      this.toast.error('Veuillez remplir le champ précédent');
      return;
    }
    this.authors.push({
      name: '',
      withConflicts: false,
      contributions: this.contributions,
      conflicts: '',
    });
  }
  addFund() {
    const lastElement = this.fundings[this.fundings.length - 1].value;

    if (lastElement === '') {
      this.toast.error('Veuillez remplir le champ précédent');
      return;
    }
    this.fundings.push({ value: '' });
  }
  addAcknowledgment() {
    const lastElement =
      this.acknowledgments[this.acknowledgments.length - 1].value;

    if (lastElement === '') {
      this.toast.error('Veuillez remplir le champ précédent');
      return;
    }
    this.acknowledgments.push({ value: '' });
  }

  toggleSelection(idx: number, contribution: string) {
    if (this.authors[idx].contributions.includes(contribution)) {
      this.authors[idx].contributions = this.authors[idx].contributions.filter(
        (item) => item !== contribution
      );
      return;
    } else {
      this.authors[idx].contributions.push(contribution);
    }
  }
  updateAuthorName(idx: number, event: any) {
    this.authors[idx].name = event.target.value;
  }
  updateFundingName(idx: number, event: any) {
    this.fundings[idx].value = event.target.value;
  }
  updateAcknowledgmentName(idx: number, event: any) {
    this.acknowledgments[idx].value = event.target.value;
  }
  send() {
    if (this.topics.length === 0) {
      this.toast.error('Veuillez attendre la génération des sujets...');
      return;
    }
    if (this.topic_name === '') {
      this.toast.error('Veuillez choisir un sujet');
      return;
    }
    if (this.authors.length === 0) {
      this.toast.error('Veuillez ajouter au moins un auteur');
      return;
    }
    for (const author of this.authors) {
      if (author.name === '') {
        this.toast.error('Veuillez remplir le nom de chaque auteur');
        return;
      }
      if (author.withConflicts) {
        if (author.conflicts === '') {
          this.toast.error(
            "Veuillez remplir les conflits d'intérêts pour chaque auteur"
          );
        }
      }
    }
    const fundings = this.fundings
      .map(({ value }) => value)
      .every((text) => text === '')
      ? undefined
      : this.fundings.map(({ value }) => value);
    if (fundings !== undefined) {
      for (const funding of fundings) {
        if (funding === '') {
          this.toast.error('Veuillez remplir chaque champ de financement');
          return;
        }
      }
    }

    const acknowledgments = this.acknowledgments
      .map(({ value }) => value)
      .every((text) => text === '')
      ? undefined
      : this.acknowledgments.map(({ value }) => value);
    if (acknowledgments !== undefined) {
      for (const acknowledgment of acknowledgments) {
        if (acknowledgment === '') {
          this.toast.error('Veuillez remplir chaque champ de remerciement');
          return;
        }
      }
    }
    const authors = this.authors.map(({ withConflicts, ...rest }) => rest);

    const data = {
      article_id: this.data.article_id,
      authors,
      topics: this.topics,
      topic: this.topic_name,
      fundings,
      acknowledgments,
      additional_infos: this.additional_infos,
      state: STATE.WAITING_FOR_ARTICLE,
    };
    this.articleService.sendArticleInfo(data).subscribe(({ success }) => {
      if (success) {
        this.toast.success('Informations envoyées avec succès');
        this.dialogRef.close(data);
      } else {
        this.toast.error("Erreur lors de l'envoi des informations");
      }
    });
  }
}
