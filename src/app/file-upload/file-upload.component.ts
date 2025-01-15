import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgClass } from '@angular/common';
import { HotToastService } from '@ngneat/hot-toast';
import { ArticleService } from '../services/article/article.service';
import { Article } from '../articles/articles.component';
import { MatDialog } from '@angular/material/dialog';
import { ArticleDetailsComponent } from '../article-details/article-details.component';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
    NgClass,
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent {
  constructor(
    private toast: HotToastService,
    private articleService: ArticleService,
    public dialog: MatDialog
  ) {
    this.openDialog('1fa9336a-f1c0-4d85-8af8-9d9ea634642a');
  }
  @ViewChild('ScientificFileInput')
  ScientificFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('ReportFileInput') ReportFileInput!: ElementRef<HTMLInputElement>;
  reportFileTypes = [
    'application/pdf',
    '.doc',
    '.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  scientificDocFileTypes = [
    'application/pdf',
    '.doc',
    '.docx',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  @Output() addFiles = new EventEmitter<Article>();
  //Report file upload
  report: File | undefined;
  reportName: string | undefined;
  isDragOverReport = false;
  sendingReport = false;
  //Scientific doc file upload
  scientific_docs: { file: File; name: string }[] = [];
  isDragOverScientificDoc = false;
  sendingScientificDoc = false;
  reportProgressBar: number = 0;
  scientifDocProgressBar: number = 0;
  showErrors = false;
  onDragOverReport(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOverReport = true;
  }

  onDragLeaveReport(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOverReport = false;
  }

  onDropReport(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOverReport = false;
    if (this.report) {
      this.toast.error('Un seul rapport est autorisé');
      return;
    }
    const file = event.dataTransfer?.files[0];

    this.handleFileReport(file!);
  }

  onReportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files![0];

    this.handleFileReport(file);
  }

  handleFileReport(file: File): void {
    if (this.reportFileTypes.includes(file.type)) {
      this.report = file;
      this.reportName = file.name;
    } else {
      this.toast.error("Le format du fichier n'est pas autorisé");
    }

    // Add your file processing logic here
  }
  clearReport(event?: Event) {
    this.report = undefined;
    this.reportName = undefined;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onDragOverScientificDoc(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOverScientificDoc = true;
  }

  onDragLeaveScientificDoc(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOverScientificDoc = false;
  }

  onDropScientificDoc(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOverScientificDoc = false;

    const file = event.dataTransfer?.files[0];
    this.handleFileScientificDoc(file!);
  }

  onScientificDocFileSelected(event: Event): void {
    console.log('ScientificDocFileSelected');

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file) => {
        this.handleFileScientificDoc(file);
      });
    }
  }

  handleFileScientificDoc(file: File): void {
    if (this.scientificDocFileTypes.includes(file.type)) {
      this.scientific_docs?.push({ file, name: file.name });
    } else {
      this.toast.error("Le format du fichier n'est pas autorisé");
    }

    // Add your file processing logic here
  }
  clearScientificDoc(event: Event, index: number) {
    if (index >= 0 && index < this.scientific_docs!.length) {
      this.scientific_docs!.splice(index, 1); // Remove the file from the files array
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  clearAllScientificDocs(event?: Event) {
    this.scientific_docs = [];

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  sendFiles() {
    this.showErrors = true;
    if (this.report && this.scientific_docs) {
      const scientificDocs = this.scientific_docs.map((doc) => ({
        name: doc.name,
        id: '',
      }));
      const files = {
        report: { name: this.report.name },
        scientific_doc: scientificDocs.map((doc) => doc.name),
      };

      this.articleService
        .getUploadFileUrls(files)
        .subscribe(({ reportUrl, article_id, createdAt }) => {
          this.showErrors = false;

          const reportLoadingToast = this.toast.loading(
            'Envoi du rapport en cours...',
            { duration: 60000 }
          );
          this.articleService.uploadFile(reportUrl, this.report!).subscribe({
            next: (progress) => {
              this.sendingReport = true;
              this.reportProgressBar = progress;
            },

            error: (error) => {
              console.log(error);
              this.reportProgressBar = 0;
              this.toast.error(
                `Une erreur est survenue lors de l'envoi du rapport !`
              );
            },
            complete: () => {
              reportLoadingToast.close();
              console.log('Report uploaded');
              console.log('Uploading scientific doc');
              const scientificDocLoadingToast = this.toast.loading(
                'Envoi du document scientifique en cours...',
                { duration: 60000 }
              );
              for (const i in this.scientific_docs) {
                const { name, file } = this.scientific_docs[i];

                if (!file) {
                  this.toast.error(
                    `Une erreur est survenue lors de l'envoi du document scientifique !`
                  );
                  return;
                }
                this.articleService
                  .getScientificDocUploadUrl({ name, article_id })
                  .subscribe(({ url, id }) => {
                    this.articleService.uploadFile(url, file).subscribe({
                      next: (progress) => {
                        this.sendingReport = false;
                        this.sendingScientificDoc = true;
                        this.scientifDocProgressBar = progress;
                      },

                      error: (error) => {
                        console.log(error);
                        this.scientifDocProgressBar = 0;
                        this.toast.error(
                          `Une erreur est survenue lors de l'envoi du document scientifique !`
                        );
                      },
                      complete: () => {
                        scientificDocs[i]['id'] = id;
                        scientificDocLoadingToast.close();
                        this.sendingScientificDoc = false;
                      },
                    });
                  });
              }

              this.toast.success(
                `${
                  this.scientific_docs.length + 2
                } fichiers envoyés avec succès !`
              );
              this.dialog
                .open(ArticleDetailsComponent, {
                  data: { article_id },
                  width: 'auto',
                  height: 'auto',
                  maxHeight: '80vh',
                  maxWidth: '50vw',
                  disableClose: true,
                })
                .afterClosed()
                .subscribe((data) => {
                  const { authors, fundings, acknowledgments, topic, topics } =
                    data;
                  this.addFiles.emit({
                    article_id,
                    createdAt,
                    report_name: this.reportName!,
                    scientificDocs,
                    state: 'uploaded',
                    authors,
                    topics,
                    topic,
                    fundings,
                    acknowledgments,
                  });
                  this.clearReport();
                  this.clearAllScientificDocs();
                });
            },
          });
        });
    } else {
      if (!this.report && !this.scientific_docs)
        this.toast.error(
          'Merci de rajouter le rapport et au moins un document scientifique'
        );
      else if (!this.report) this.toast.error('Merci de rajouter le Rapport');
      else if (!this.scientific_docs)
        this.toast.error('Merci de rajouter au moins un document scientifique');
    }
  }
  openDialog(article_id: string) {}
}
