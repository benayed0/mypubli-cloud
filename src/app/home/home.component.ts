import { Component } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { Article, ArticlesComponent } from '../articles/articles.component';
import { ArticleService } from '../services/article/article.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FileUploadComponent, ArticlesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private articleService: ArticleService) {
    this.getArticles();
  }
  addFiles(article: Article) {
    console.log(article);
    this.articles = [...this.articles, article];
  }
  articles: Article[] = [];
  getArticles() {
    this.articleService.getByUser().subscribe((articles) => {
      console.log(articles);

      this.articles = articles;
    });
  }
}
