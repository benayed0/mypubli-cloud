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
  report: { name: string };
  scientific_doc: string[];
}

export interface uploadScientificDocFileUrlRequest {
  name: string;
  article_id: string;
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
  getTopics(article_id: string) {
    return this.httpClient.get<{ topics: string[] }>(
      `${environment.API_URL}article/get_topics/${article_id}`
    );
  }
  getUploadFileUrls(files: uploadFileUrlRequest) {
    return this.httpClient.post<{
      reportUrl: string;
      scientificdocUrls: { name: string; url: string; id: string }[];
      article_id: string;
      createdAt: string;
    }>(`${environment.API_URL}article/get_files_upload_url`, files);
  }
  getScientificDocUploadUrl(file: uploadScientificDocFileUrlRequest) {
    return this.httpClient.post<{
      url: string;
      id: string;
    }>(`${environment.API_URL}article/get_scientific_doc_upload_url`, file);
  }
  getDownloadUrl(article_id: string, filename: string, id?: string) {
    return this.httpClient.get<{
      url: string;
    }>(
      `${environment.API_URL}article/get_file/${article_id}/${filename}?id=${id}`
    );
  }
  sendArticleInfo(article: Partial<Article>) {
    return this.httpClient.post<{ success: boolean }>(
      `${environment.API_URL}article/info`,
      article
    );
  }
  getByUser() {
    return this.httpClient.get<Article[]>(
      `${environment.API_URL}article/get_by_user`
    );
  }
}
