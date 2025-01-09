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
    private article: ArticleService
  ) {}
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
  scientific_doc: File | undefined;
  scientific_docName: string | undefined;
  isDragOverScientificDoc = false;
  sendingScientificDoc = false;
  reportProgressBar: number = 0;
  scientifDocProgressBar: number = 0;
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
    const file = input.files![0];
    console.log(file);

    this.handleFileScientificDoc(file);
  }

  handleFileScientificDoc(file: File): void {
    if (this.scientificDocFileTypes.includes(file.type)) {
      this.scientific_doc = file;
      this.scientific_docName = file.name;
    }

    // Add your file processing logic here
  }
  clearScientificDoc(event?: Event) {
    this.scientific_doc = undefined;
    this.scientific_docName = undefined;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  sendFiles() {
    if (this.report && this.scientific_doc) {
      const files = {
        report: { name: this.report.name, type: this.report.type },
        scientific_doc: {
          name: this.scientific_doc.name,
          type: this.scientific_doc.type,
        },
      };
      this.article
        .getUploadFileUrls(files)
        .subscribe(({ reportUrl, scientificdocUrl, article_id, createdAt }) => {
          const reportLoadingToast = this.toast.loading(
            'Envoi du rapport en cours...',
            { duration: 60000 }
          );
          this.article.uploadFile(reportUrl, this.report!).subscribe({
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
              this.article
                .uploadFile(scientificdocUrl, this.scientific_doc!)
                .subscribe({
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
                    this.sendingScientificDoc = false;
                    scientificDocLoadingToast.close();
                    this.toast.success('Fichiers envoyés avec succès !');
                    this.addFiles.emit({
                      article_id,
                      createdAt,
                      report_name: this.reportName!,
                      scientificDoc_name: this.scientific_docName!,
                      state: 'processing',
                    });
                    this.clearReport();
                    this.clearScientificDoc();
                  },
                });
            },
          });
        });
    } else {
      if (!this.report && !this.scientific_doc)
        this.toast.error(
          'Merci de rajouter le Raport et le document scientifique'
        );
      else if (!this.report) this.toast.error('Merci de rajouter le Raport');
      else if (!this.scientific_doc)
        this.toast.error('Merci de rajouter le document scientifique');
    }
  }
}
