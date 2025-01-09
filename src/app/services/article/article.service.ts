import {
  HttpClient,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { Article } from '../../articles/articles.component';

export interface uploadFileUrlRequest {
  report: { name: string; type: string };
  scientific_doc: { name: string; type: string };
}
@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  constructor(
    private httpClient: HttpClient,
    private oauthservice: OAuthService
  ) {}

  uploadFile(aws_url: string, file: File) {
    // Create a new HttpRequest with `reportProgress` enabled
    const req = new HttpRequest('PUT', aws_url, file, {
      headers: new HttpHeaders({
        'Content-Type': file.type,
        'Skip-Auth': 'true', // Custom header to indicate skipping auth
      }),
      reportProgress: true, // Enable progress reporting
    });

    // Return an Observable that maps progress events to a percentage
    return this.httpClient.request(req).pipe(
      map((event) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            // Compute and return the progress percentage
            return Math.round((100 * event.loaded) / (event.total || 1));
          case HttpEventType.Response:
            // Upload complete
            return 100;
          default:
            return 0;
        }
      })
    );
  }
  getUploadFileUrls(files: uploadFileUrlRequest) {
    return this.httpClient.post<{
      reportUrl: string;
      scientificdocUrl: string;
      article_id: string;
      createdAt: string;
    }>(`${environment.API_URL}article/get_files_upload_url`, files);
  }
  getDownloadUrl(article_id: string, filename: string) {
    return this.httpClient.get<{
      url: string;
    }>(`${environment.API_URL}article/get_file/${article_id}/${filename}`);
  }
  getByUser() {
    return this.httpClient.get<Article[]>(
      `${environment.API_URL}article/get_by_user`
    );
  }
}
